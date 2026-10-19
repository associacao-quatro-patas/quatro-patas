import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { requireSupabaseEnv } from "./env";

/**
 * Cliente Supabase anônimo (sem sessão nem cookies), usado para ler dados
 * públicos dentro de funções com "use cache". Enxerga exatamente o que um
 * visitante enxerga, pois está sujeito às mesmas políticas RLS.
 */
export function createPublicClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
