import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { InstitutionContent } from "@/types/database";

// Tag usada pelo painel (updateTag) para atualizar a página "Sobre" na hora.
export const INSTITUTION_CACHE_TAG = "institution";

/**
 * Linha única de institution_content, lida como visitante (mesmas regras RLS
 * da página pública). `null` = nada cadastrado ainda ou erro de leitura: em
 * ambos os casos o site usa os textos provisórios de src/content/sobre.ts.
 */
export async function getInstitutionContent(): Promise<InstitutionContent | null> {
  "use cache";
  cacheTag(INSTITUTION_CACHE_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient().from("institution_content").select("*").maybeSingle();
  if (error) {
    console.error("Erro ao carregar o conteúdo institucional:", error.message);
    return null;
  }
  return data;
}
