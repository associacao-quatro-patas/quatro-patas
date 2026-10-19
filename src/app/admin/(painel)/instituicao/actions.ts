"use server";

import { updateTag } from "next/cache";
import { checkAdmin } from "@/lib/auth";
import { INSTITUTION_CACHE_TAG } from "@/lib/institution/queries";
import { parseInstitutionForm, type InstitutionErrors } from "@/lib/institution/validation";

export type InstitutionFormState = {
  status?: "success" | "error";
  message?: string;
  errors?: InstitutionErrors;
};

/**
 * Salva a linha única de institution_content (id = true). Campo vazio = NULL,
 * e a página "Sobre" volta a usar o texto provisório daquele trecho.
 * As políticas RLS também barram quem não é administrador.
 */
export async function saveInstitutionContent(
  _prev: InstitutionFormState,
  formData: FormData,
): Promise<InstitutionFormState> {
  const auth = await checkAdmin();
  if (!auth.ok) return { status: "error", message: auth.message };

  const parsed = parseInstitutionForm(formData);
  if (!parsed.ok) {
    return { status: "error", message: "Confira os campos destacados. Nada foi salvo.", errors: parsed.errors };
  }

  // .select() confirma que a linha foi gravada (vazio = bloqueado pelo RLS).
  const { data, error } = await auth.supabase
    .from("institution_content")
    .upsert({ id: true, ...parsed.data }, { onConflict: "id" })
    .select("id");

  if (error) return { status: "error", message: `Não foi possível salvar: ${error.message}` };
  if (!data || data.length === 0) {
    return { status: "error", message: "Nada foi salvo: sua conta não tem permissão para esta ação." };
  }

  updateTag(INSTITUTION_CACHE_TAG);
  return { status: "success", message: "Conteúdo salvo. A página “Sobre” já foi atualizada." };
}
