"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/auth";
import { SUPPLIES_CACHE_TAG } from "@/lib/donations/queries";
import { parseSupplyForm, type SupplyErrors } from "@/lib/donations/validation";

export type SupplyFormState = {
  message?: string;
  errors?: SupplyErrors;
};

export type DeleteSupplyResult = { ok: true } | { ok: false; message: string };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Cadastra (supplyId = null) ou edita um insumo. Sucesso volta para a lista com aviso. */
export async function saveSupply(
  supplyId: string | null,
  _prev: SupplyFormState,
  formData: FormData,
): Promise<SupplyFormState> {
  const auth = await checkAdmin();
  if (!auth.ok) return { message: auth.message };

  const parsed = parseSupplyForm(formData);
  if (!parsed.ok) return { message: "Confira os campos destacados.", errors: parsed.errors };

  if (supplyId === null) {
    const { error } = await auth.supabase.from("supplies").insert(parsed.data);
    if (error) return { message: `Não foi possível cadastrar: ${error.message}` };
  } else {
    if (!UUID_REGEX.test(supplyId)) return { message: "Insumo inválido." };
    // .select() devolve a linha alterada: vazio = não existe mais ou sem permissão (RLS).
    const { data, error } = await auth.supabase
      .from("supplies")
      .update(parsed.data)
      .eq("id", supplyId)
      .select("id");
    if (error) return { message: `Não foi possível salvar: ${error.message}` };
    if (!data || data.length === 0) {
      return { message: "Nada foi salvo: o insumo não existe mais ou sua conta não tem permissão." };
    }
  }

  updateTag(SUPPLIES_CACHE_TAG);
  redirect(`/admin/insumos?status=${supplyId === null ? "criado" : "salvo"}`);
}

export async function deleteSupply(supplyId: string): Promise<DeleteSupplyResult> {
  if (!UUID_REGEX.test(supplyId)) return { ok: false, message: "Insumo inválido." };

  const auth = await checkAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };

  const { data, error } = await auth.supabase.from("supplies").delete().eq("id", supplyId).select("id");
  if (error) return { ok: false, message: `Não foi possível excluir: ${error.message}` };
  if (!data || data.length === 0) {
    return { ok: false, message: "Nada foi excluído: o insumo já não existe ou sua conta não tem permissão." };
  }

  updateTag(SUPPLIES_CACHE_TAG);
  return { ok: true };
}
