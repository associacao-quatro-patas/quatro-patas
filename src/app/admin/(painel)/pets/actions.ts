"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/auth";
import { parseAdoptionForm, type AdoptionFields, type AdoptionFormErrors } from "@/lib/adoptions/validation";
import { insertPetWithSlug, registerAdoption, removePetPhoto } from "@/lib/pets/admin";
import { PETS_BUCKET, PETS_CACHE_TAG, PHOTO_PATH_REGEX } from "@/lib/pets/constants";
import { parsePetForm, type PetFormErrors } from "@/lib/pets/validation";

export type PetFormState = {
  message?: string;
  errors?: PetFormErrors & AdoptionFormErrors;
};

/**
 * Cadastra (petId = null) ou edita um pet.
 * A foto já foi enviada pelo navegador direto ao Storage; aqui chega apenas o
 * nome do arquivo (photo_path). As políticas RLS também barram não-admins.
 * Com status "Adotado", os dados do tutor são obrigatórios e o animal passa
 * para a aba Adotados (o mesmo registro, com foto e dados preservados).
 */
export async function savePet(
  petId: string | null,
  _prev: PetFormState,
  formData: FormData,
): Promise<PetFormState> {
  const auth = await checkAdmin();
  const parsed = parsePetForm(formData);
  const adopting = parsed.ok ? parsed.data.status === "adopted" : formData.get("status") === "adopted";
  const adoption = adopting ? parseAdoptionForm(formData) : null;

  if (!auth.ok) return { message: auth.message };
  if (!parsed.ok || (adoption && !adoption.ok)) {
    // A foto já subiu; descarta para não deixar arquivo órfão. O navegador
    // envia de novo no próximo envio do formulário.
    const uploaded = formData.get("photo_path");
    if (typeof uploaded === "string" && PHOTO_PATH_REGEX.test(uploaded)) {
      await removePetPhoto(auth.supabase, uploaded);
    }
    return {
      message: "Confira os campos destacados.",
      errors: { ...(parsed.ok ? {} : parsed.errors), ...(adoption && !adoption.ok ? adoption.errors : {}) },
    };
  }

  const { supabase } = auth;
  const { data, photoPath } = parsed;
  const adoptionData: AdoptionFields | null = adoption?.ok ? adoption.data : null;

  if (petId === null) {
    const created = await insertPetWithSlug(supabase, { ...data, ...(photoPath ? { photo_path: photoPath } : {}) });
    if (!created.ok) {
      await removePetPhoto(supabase, photoPath);
      return { message: created.message };
    }

    if (adoptionData) {
      const adoptionError = await registerAdoption(supabase, created.id, adoptionData);
      if (adoptionError) {
        // Sem os dados do tutor o cadastro não fica pela metade: desfaz tudo.
        await supabase.from("pets").delete().eq("id", created.id);
        await removePetPhoto(supabase, photoPath);
        return { message: adoptionError };
      }
    }
  } else {
    const { data: current, error: findError } = await supabase
      .from("pets")
      .select("photo_path, status")
      .eq("id", petId)
      .maybeSingle();

    if (findError || !current) {
      await removePetPhoto(supabase, photoPath);
      return { message: "Animal não encontrado. Ele pode ter sido excluído." };
    }

    // Ao adotar, o status só muda junto com os dados do tutor (registerAdoption).
    const { error } = await supabase
      .from("pets")
      .update({
        ...data,
        ...(adoptionData ? { status: current.status } : {}),
        ...(photoPath ? { photo_path: photoPath } : {}),
      })
      .eq("id", petId);

    if (error) {
      await removePetPhoto(supabase, photoPath);
      return { message: `Não foi possível salvar: ${error.message}` };
    }

    // Foto substituída: apaga o arquivo anterior do bucket.
    if (photoPath && current.photo_path && current.photo_path !== photoPath) {
      await removePetPhoto(supabase, current.photo_path);
    }

    if (adoptionData) {
      const adoptionError = await registerAdoption(supabase, petId, adoptionData);
      if (adoptionError) {
        updateTag(PETS_CACHE_TAG);
        return { message: `Os dados do animal foram salvos, mas a adoção não foi registrada. ${adoptionError}` };
      }
    }
  }

  updateTag(PETS_CACHE_TAG);
  redirect(adoptionData ? "/admin/adotados" : "/admin/pets");
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
