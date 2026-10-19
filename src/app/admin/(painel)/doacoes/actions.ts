"use server";

import { updateTag } from "next/cache";
import { checkAdmin } from "@/lib/auth";
import { DONATIONS_CACHE_TAG } from "@/lib/donations/queries";
import { parseDonationForm, type DonationErrors } from "@/lib/donations/validation";

export type DonationFormState = {
  status?: "success" | "error";
  message?: string;
  errors?: DonationErrors;
};

/**
 * Cria ou atualiza a linha única de donation_settings (id = true).
 * As políticas RLS também barram quem não é administrador.
 */
export async function saveDonationSettings(_prev: DonationFormState, formData: FormData): Promise<DonationFormState> {
  const auth = await checkAdmin();
  if (!auth.ok) return { status: "error", message: auth.message };

  const parsed = parseDonationForm(formData);
  if (!parsed.ok) {
    return { status: "error", message: "Confira os campos destacados.", errors: parsed.errors };
  }

  const { error } = await auth.supabase
    .from("donation_settings")
    .upsert({ id: true, ...parsed.data }, { onConflict: "id" });

  if (error) {
    return { status: "error", message: `Não foi possível salvar: ${error.message}` };
  }

  updateTag(DONATIONS_CACHE_TAG);
  return { status: "success", message: "Dados de doação salvos. A página pública já foi atualizada." };
}
