// Validação do formulário "Instituição" com as mesmas regras da tabela
// institution_content (migração 005). O banco também valida.

import type { InstitutionContent, NamedItem } from "@/types/database";
import { INSTITUTION_LIMITS as L } from "./content";

export type InstitutionFields = Omit<InstitutionContent, "id" | "updated_at">;
export type InstitutionErrors = Partial<Record<keyof InstitutionFields, string>>;

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  // Normaliza quebras de linha do Windows e remove espaços nas pontas.
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim() : "";
}

function optionalText(formData: FormData, key: keyof InstitutionFields, max: number, errors: InstitutionErrors) {
  const value = text(formData, key);
  if (value.length > max) errors[key] = `Use no máximo ${max} caracteres (atual: ${value.length}).`;
  return value || null;
}

/** Lê pares nome/texto (campos repetidos `<prefixo>_name` e `<prefixo>_text`). */
function namedItems(
  formData: FormData,
  prefix: "values" | "work",
  limits: { maxItems: number; name: number; text: number },
  key: "values_items" | "work_items",
  errors: InstitutionErrors,
): NamedItem[] | null {
  const names = formData.getAll(`${prefix}_name`).map((v) => (typeof v === "string" ? v.trim() : ""));
  const texts = formData.getAll(`${prefix}_text`).map((v) => (typeof v === "string" ? v.replace(/\r\n?/g, "\n").trim() : ""));
  const items: NamedItem[] = [];

  for (let i = 0; i < Math.max(names.length, texts.length); i++) {
    const name = names[i] ?? "";
    const itemText = texts[i] ?? "";
    if (!name && !itemText) continue; // linha totalmente vazia: ignorada
    if (!name || !itemText) {
      errors[key] = `Item ${i + 1}: preencha o nome e o texto (ou remova o item).`;
      return null;
    }
    if (name.length > limits.name) {
      errors[key] = `Item ${i + 1}: nome com no máximo ${limits.name} caracteres.`;
      return null;
    }
    if (itemText.length > limits.text) {
      errors[key] = `Item ${i + 1}: texto com no máximo ${limits.text} caracteres.`;
      return null;
    }
    items.push({ name, text: itemText });
  }

  if (items.length > limits.maxItems) {
    errors[key] = `Use no máximo ${limits.maxItems} itens.`;
    return null;
  }
  return items.length ? items : null;
}

/** "@perfil", "instagram.com/perfil" ou o link completo → https://www.instagram.com/perfil/ */
export function normalizeInstagram(raw: string): string | null {
  const value = raw.trim();
  const handle =
    value.match(/^@?([A-Za-z0-9._]{1,30})$/)?.[1] ??
    value.match(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9._]{1,30})\/?(?:\?.*)?$/i)?.[1];
  return handle ? `https://www.instagram.com/${handle}/` : null;
}

export function parseInstitutionForm(formData: FormData):
  | { ok: true; data: InstitutionFields }
  | { ok: false; errors: InstitutionErrors } {
  const errors: InstitutionErrors = {};

  const data: InstitutionFields = {
    intro_text: optionalText(formData, "intro_text", L.intro, errors),
    history_text: optionalText(formData, "history_text", L.history, errors),
    mission_text: optionalText(formData, "mission_text", L.mission, errors),
    vision_text: optionalText(formData, "vision_text", L.vision, errors),
    values_items: namedItems(formData, "values", L.values, "values_items", errors),
    work_intro: optionalText(formData, "work_intro", L.workIntro, errors),
    work_items: namedItems(formData, "work", L.work, "work_items", errors),
    contact_email: null,
    instagram_url: null,
    phone: null,
    address: optionalText(formData, "address", L.address, errors),
  };

  const email = text(formData, "contact_email");
  if (email) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > L.email) errors.contact_email = "E-mail inválido.";
    else data.contact_email = email.toLowerCase();
  }

  const instagram = text(formData, "instagram_url");
  if (instagram) {
    const url = normalizeInstagram(instagram);
    if (!url) errors.instagram_url = "Informe o perfil (@perfil) ou o link do Instagram.";
    else data.instagram_url = url;
  }

  const phone = text(formData, "phone");
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (!/^[0-9 +()\-]+$/.test(phone) || digits.length < 8 || digits.length > 15) {
      errors.phone = "Telefone inválido. Use só números, espaços, +, parênteses e hífen.";
    } else data.phone = phone;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data };
}
