import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { DonationSettings, Supply } from "@/types/database";

// Tags usadas pelo painel (updateTag) para atualizar a página na hora.
export const DONATIONS_CACHE_TAG = "donations";
export const SUPPLIES_CACHE_TAG = "supplies";

/**
 * `unavailable` = tabela ainda não criada no Supabase (migração 004 pendente)
 * ou erro de leitura. A página mostra "em breve" em vez de quebrar.
 */
export type Loaded<T> = { status: "ok"; data: T } | { status: "unavailable" };

// PGRST205: tabela não existe na API · 42P01: tabela não existe no banco.
const MISSING_TABLE = new Set(["PGRST205", "42P01"]);

function unavailable(what: string, error: { code?: string; message: string }): { status: "unavailable" } {
  if (!MISSING_TABLE.has(error.code ?? "")) {
    console.error(`Erro ao carregar ${what}:`, error.message);
  }
  return { status: "unavailable" };
}

export async function getDonationSettings(): Promise<Loaded<DonationSettings | null>> {
  "use cache";
  cacheTag(DONATIONS_CACHE_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient().from("donation_settings").select("*").maybeSingle();
  if (error) return unavailable("dados do Pix", error);
  return { status: "ok", data };
}

/** Insumos ativos; urgentes primeiro, depois pela ordem definida no painel. */
export async function getActiveSupplies(): Promise<Loaded<Supply[]>> {
  "use cache";
  cacheTag(SUPPLIES_CACHE_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient()
    .from("supplies")
    .select("*")
    .eq("is_active", true)
    .order("is_urgent", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return unavailable("insumos", error);
  return { status: "ok", data };
}
