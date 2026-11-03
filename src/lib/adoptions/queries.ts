import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { PETS_CACHE_TAG } from "@/lib/pets/constants";
import type { MuralPet } from "@/types/database";

/**
 * Animais do Mural de Adoções. A função adoption_mural (migração 007) devolve
 * só id, nome e foto: nenhum dado do tutor sai do banco para o site.
 * Usa a mesma tag dos pets, que o painel atualiza a cada alteração.
 */
export async function getAdoptionMural(): Promise<MuralPet[]> {
  "use cache";
  cacheTag(PETS_CACHE_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient().rpc("adoption_mural");
  if (error) {
    // PGRST202/42883: função ainda não criada (migração 007 não aplicada).
    if (!["PGRST202", "42883"].includes(error.code ?? "")) {
      console.error("Erro ao carregar o Mural de Adoções:", error.message);
    }
    return [];
  }
  return (data ?? []).map(({ id, name, photo_path }) => ({ id, name, photo_path }));
}
