// Validação dos formulários de Doações e Insumos com as mesmas regras das
// tabelas (migração 004). O banco também valida; aqui as mensagens são claras.

import type { DonationSettings, PixKeyType, Supply } from "@/types/database";
import { isValidPixPayload, normalizePixKey } from "./pix";

export const PIX_KEY_TYPE_OPTIONS: { value: PixKeyType; label: string; placeholder: string }[] = [
  { value: "cpf", label: "CPF", placeholder: "000.000.000-00" },
  { value: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00" },
  { value: "email", label: "E-mail", placeholder: "nome@exemplo.org" },
  { value: "phone", label: "Telefone (celular)", placeholder: "(11) 90000-0000" },
  { value: "random", label: "Chave aleatória", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
];

export const DONATION_LIMITS = {
  recipientName: 100,
  merchantName: 25,
  merchantCity: 15,
  copyPaste: 512,
  notes: 500,
} as const;

export const SUPPLY_LIMITS = {
  name: 80,
  description: 500,
  quantity: 60,
  sortOrder: 9999,
} as const;

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// ---------------------------------------------------------------------------
// Pix
// ---------------------------------------------------------------------------

export type DonationFields = Omit<DonationSettings, "id" | "updated_at">;
export type DonationErrors = Partial<Record<keyof DonationFields, string>>;

export function parseDonationForm(formData: FormData):
  | { ok: true; data: DonationFields }
  | { ok: false; errors: DonationErrors } {
  const errors: DonationErrors = {};

  const type = text(formData, "pix_key_type");
  const rawKey = text(formData, "pix_key");
  let pixKey: string | null = null;
  let pixKeyType: PixKeyType | null = null;

  if (type && !PIX_KEY_TYPE_OPTIONS.some((o) => o.value === type)) {
    errors.pix_key_type = "Tipo de chave inválido.";
  } else if (type && !rawKey) {
    errors.pix_key = "Informe a chave ou escolha “Sem chave Pix”.";
  } else if (!type && rawKey) {
    errors.pix_key_type = "Escolha o tipo da chave.";
  } else if (type && rawKey) {
    pixKeyType = type as PixKeyType;
    pixKey = normalizePixKey(pixKeyType, rawKey);
    if (!pixKey) {
      errors.pix_key = {
        cpf: "CPF deve ter 11 dígitos.",
        cnpj: "CNPJ deve ter 14 dígitos.",
        email: "E-mail inválido (máximo de 77 caracteres).",
        phone: "Telefone inválido. Use DDD + número, por exemplo (11) 90000-0000.",
        random: "Chave aleatória inválida (formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).",
      }[pixKeyType];
    }
  }

  const recipientName = text(formData, "recipient_name");
  if (recipientName.length > DONATION_LIMITS.recipientName) {
    errors.recipient_name = `Use no máximo ${DONATION_LIMITS.recipientName} caracteres.`;
  }

  const merchantName = text(formData, "pix_merchant_name");
  if (merchantName.length > DONATION_LIMITS.merchantName) {
    errors.pix_merchant_name = `O padrão do QR Code aceita no máximo ${DONATION_LIMITS.merchantName} caracteres.`;
  }

  const merchantCity = text(formData, "pix_merchant_city");
  if (merchantCity.length > DONATION_LIMITS.merchantCity) {
    errors.pix_merchant_city = `O padrão do QR Code aceita no máximo ${DONATION_LIMITS.merchantCity} caracteres.`;
  }

  // Remove quebras de linha/espaços que costumam vir ao colar.
  const copyPaste = text(formData, "pix_copy_paste").replace(/\s+/g, "");
  if (copyPaste && (copyPaste.length < 50 || copyPaste.length > DONATION_LIMITS.copyPaste || !isValidPixPayload(copyPaste))) {
    errors.pix_copy_paste =
      "Código inválido. Cole o “Pix Copia e Cola” completo, exatamente como o banco forneceu.";
  }

  const notes = text(formData, "notes");
  if (notes.length > DONATION_LIMITS.notes) errors.notes = `Use no máximo ${DONATION_LIMITS.notes} caracteres.`;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      pix_key: pixKey,
      pix_key_type: pixKeyType,
      recipient_name: recipientName || null,
      pix_merchant_name: merchantName || null,
      pix_merchant_city: merchantCity || null,
      pix_copy_paste: copyPaste || null,
      notes: notes || null,
    },
  };
}

// ---------------------------------------------------------------------------
// Insumos
// ---------------------------------------------------------------------------

export type SupplyFields = Pick<Supply, "name" | "description" | "quantity" | "is_urgent" | "is_active" | "sort_order">;
export type SupplyErrors = Partial<Record<keyof SupplyFields, string>>;

export function parseSupplyForm(formData: FormData):
  | { ok: true; data: SupplyFields }
  | { ok: false; errors: SupplyErrors } {
  const errors: SupplyErrors = {};

  const name = text(formData, "name");
  if (!name) errors.name = "Informe o nome do item.";
  else if (name.length > SUPPLY_LIMITS.name) errors.name = `Use no máximo ${SUPPLY_LIMITS.name} caracteres.`;

  const description = text(formData, "description");
  if (description.length > SUPPLY_LIMITS.description) {
    errors.description = `Use no máximo ${SUPPLY_LIMITS.description} caracteres.`;
  }

  const quantity = text(formData, "quantity");
  if (quantity.length > SUPPLY_LIMITS.quantity) errors.quantity = `Use no máximo ${SUPPLY_LIMITS.quantity} caracteres.`;

  const sortRaw = text(formData, "sort_order") || "0";
  const sortOrder = Number(sortRaw);
  if (!/^\d+$/.test(sortRaw) || sortOrder > SUPPLY_LIMITS.sortOrder) {
    errors.sort_order = `Use um número inteiro de 0 a ${SUPPLY_LIMITS.sortOrder}.`;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name,
      description: description || null,
      quantity: quantity || null,
      is_urgent: formData.get("is_urgent") === "on",
      is_active: formData.get("is_active") === "on",
      sort_order: sortOrder,
    },
  };
}
