import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Garante que quem está na requisição é um administrador autorizado
 * (usuário logado E presente em public.admins). Use no início de toda página
 * e Server Action do painel: o proxy só verifica se há login, não se é admin.
 *
 * Lê cookies, então o componente que a chama precisa estar em um <Suspense>.
 */
export async function requireAdmin() {
  // O cliente de Auth lê o relógio (Date.now) ao validar a sessão; com Cache
  // Components isso só pode acontecer em tempo de requisição.
  await connection();
  const supabase = await createClient();

  // getUser() valida o token no servidor do Supabase (não confia só no cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) redirect("/admin/sem-permissao");

  return { supabase, user };
}

/** Versão para Server Actions: em vez de redirecionar, informa o erro. */
export async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, message: "Sua sessão expirou. Entre novamente." };

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) {
    return { ok: false as const, message: "Sua conta não tem permissão para esta ação." };
  }
  return { ok: true as const, supabase, user };
}
