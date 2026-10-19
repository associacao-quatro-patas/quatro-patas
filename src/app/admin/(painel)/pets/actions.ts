"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/auth";
import { PETS_BUCKET, PETS_CACHE_TAG, PHOTO_PATH_REGEX, slugify } from "@/lib/pets/constants";
import { parsePetForm, type PetFormErrors } from "@/lib/pets/validation";

export type PetFormState = {
  message?: string;
  errors?: PetFormErrors;
};

type ServerSupabase = Extract<Awaited<ReturnType<typeof checkAdmin>>, { ok: true }>["supabase"];

const UNIQUE_VIOLATION = "23505";

async function removePhoto(supabase: ServerSupabase, path: string | null | undefined) {
  if (!path) return;
  // Falha aqui só deixa um arquivo órfão no bucket; não deve desfazer o cadastro.
  const { error } = await supabase.storage.from(PETS_BUCKET).remove([path]);
  if (error) console.error("Não foi possível remover a foto antiga:", error.message);
}

/**
 * Cadastra (petId = null) ou edita um pet.
 * A foto já foi enviada pelo navegador direto ao Storage; aqui chega apenas o
 * nome do arquivo (photo_path). As políticas RLS também barram não-admins.
 */
export async function savePet(
  petId: string | null,
  _prev: PetFormState,
  formData: FormData,
): Promise<PetFormState> {
  const auth = await checkAdmin();
  const parsed = parsePetForm(formData);

  if (!auth.ok) return { message: auth.message };
  if (!parsed.ok) {
    // A foto já subiu; descarta para não deixar arquivo órfão. O navegador
    // envia de novo no próximo envio do formulário.
    const uploaded = formData.get("photo_path");
    if (typeof uploaded === "string" && PHOTO_PATH_REGEX.test(uploaded)) {
      await removePhoto(auth.supabase, uploaded);
    }
    return { message: "Confira os campos destacados.", errors: parsed.errors };
  }

  const { supabase } = auth;
  const { data, photoPath } = parsed;

  if (petId === null) {
    // Gera um slug a partir do nome; se já existir, tenta "nome-2", "nome-3"...
    const base = slugify(data.name) || "pet";
    let created = false;

    for (let attempt = 1; attempt <= 20 && !created; attempt++) {
      const slug = attempt === 1 ? base : `${base}-${attempt}`;
      const { error } = await supabase
        .from("pets")
        .insert({ ...data, slug, ...(photoPath ? { photo_path: photoPath } : {}) });

      if (!error) created = true;
      else if (error.code !== UNIQUE_VIOLATION) {
        await removePhoto(supabase, photoPath);
        return { message: `Não foi possível cadastrar: ${error.message}` };
      }
    }

    if (!created) {
      await removePhoto(supabase, photoPath);
      return { message: "Já existem muitos animais com este nome. Use um nome diferente." };
    }
  } else {
    const { data: current, error: findError } = await supabase
      .from("pets")
      .select("photo_path")
      .eq("id", petId)
      .maybeSingle();

    if (findError || !current) {
      await removePhoto(supabase, photoPath);
      return { message: "Animal não encontrado. Ele pode ter sido excluído." };
    }

    const { error } = await supabase
      .from("pets")
      .update({ ...data, ...(photoPath ? { photo_path: photoPath } : {}) })
      .eq("id", petId);

    if (error) {
      await removePhoto(supabase, photoPath);
      return { message: `Não foi possível salvar: ${error.message}` };
    }

    // Foto substituída: apaga o arquivo anterior do bucket.
    if (photoPath && current.photo_path && current.photo_path !== photoPath) {
      await removePhoto(supabase, current.photo_path);
    }
  }

  updateTag(PETS_CACHE_TAG);
  redirect("/admin/pets");
}

export type DeletePetResult = { ok: true; warning?: string } | { ok: false; message: string };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Exclui um pet e a foto dele. Devolve o resultado (sem redirect) para o
 * botão mostrar a mensagem e atualizar a lista.
 */
export async function deletePet(petId: string): Promise<DeletePetResult> {
  if (!UUID_REGEX.test(petId)) return { ok: false, message: "Animal inválido." };

  const auth = await checkAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };
  const { supabase } = auth;

  // .select() devolve as linhas apagadas. Lista vazia = nada foi excluído:
  // o animal não existe mais ou a política RLS não permitiu.
  const { data: deleted, error } = await supabase
    .from("pets")
    .delete()
    .eq("id", petId)
    .select("photo_path");

  if (error) return { ok: false, message: `Não foi possível excluir: ${error.message}` };
  if (!deleted || deleted.length === 0) {
    return {
      ok: false,
      message: "Nada foi excluído: o animal já não existe ou sua conta não tem permissão. Atualize a página.",
    };
  }

  updateTag(PETS_CACHE_TAG);

  // A foto é apagada depois do registro: se falhar, o animal já saiu do site
  // e o arquivo fica apenas órfão no bucket (o administrador é avisado).
  const photoPath = deleted[0].photo_path;
  if (photoPath) {
    const { data: removed, error: storageError } = await supabase.storage
      .from(PETS_BUCKET)
      .remove([photoPath]);
    // Sem permissão, o Storage não devolve erro: devolve uma lista vazia.
    if (storageError || !removed || removed.length === 0) {
      console.error("Foto não removida do bucket:", photoPath, storageError?.message ?? "nenhum arquivo removido");
      return { ok: true, warning: "O animal foi excluído, mas a foto não pôde ser apagada do armazenamento." };
    }
  }

  return { ok: true };
}
