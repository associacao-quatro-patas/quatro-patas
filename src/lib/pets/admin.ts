import "server-only";
import type { checkAdmin } from "@/lib/auth";
import type { AdoptionFields } from "@/lib/adoptions/validation";
import type { Database } from "@/types/database";
import { PETS_BUCKET, slugify } from "./constants";

// Operações do painel usadas pelas abas Pets e Adotados.

export type ServerSupabase = Extract<Awaited<ReturnType<typeof checkAdmin>>, { ok: true }>["supabase"];
type PetInsert = Omit<Database["public"]["Tables"]["pets"]["Insert"], "slug">;

const UNIQUE_VIOLATION = "23505";

export async function removePetPhoto(supabase: ServerSupabase, path: string | null | undefined) {
  if (!path) return;
  // Falha aqui só deixa um arquivo órfão no bucket; não deve desfazer o cadastro.
  const { error } = await supabase.storage.from(PETS_BUCKET).remove([path]);
  if (error) console.error("Não foi possível remover a foto antiga:", error.message);
}

/** Cadastra um pet gerando o slug pelo nome; se já existir, tenta "nome-2", "nome-3"... */
export async function insertPetWithSlug(
  supabase: ServerSupabase,
  pet: PetInsert,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const base = slugify(pet.name) || "pet";

  for (let attempt = 1; attempt <= 20; attempt++) {
    const slug = attempt === 1 ? base : `${base}-${attempt}`;
    const { data, error } = await supabase.from("pets").insert({ ...pet, slug }).select("id").single();

    if (!error) return { ok: true, id: data.id };
    if (error.code !== UNIQUE_VIOLATION) return { ok: false, message: `Não foi possível cadastrar: ${error.message}` };
  }
  return { ok: false, message: "Já existem muitos animais com este nome. Use um nome diferente." };
}

/**
 * Marca o animal como adotado e grava os dados do tutor numa única transação
 * (função register_adoption, migração 007). Devolve a mensagem de erro, se houver.
 */
export async function registerAdoption(
  supabase: ServerSupabase,
  petId: string,
  adoption: AdoptionFields,
): Promise<string | null> {
  const { error } = await supabase.rpc("register_adoption", {
    p_pet_id: petId,
    p_tutor_name: adoption.tutor_name,
    p_tutor_contact: adoption.tutor_contact,
    p_tutor_address: adoption.tutor_address,
    p_adopted_at: adoption.adopted_at,
  });
  if (!error) return null;
  if (["PGRST202", "42883"].includes(error.code ?? "")) {
    return "O registro de adoções ainda não foi ativado no banco (migração 007).";
  }
  return `Não foi possível registrar a adoção: ${error.message}`;
}
