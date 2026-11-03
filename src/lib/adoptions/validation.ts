import type { PetSex, PetSize, PetSpecies } from "@/types/database";
import { LIMITS, PHOTO_PATH_REGEX, SEX_LABELS, SIZE_LABELS, SPECIES_LABELS } from "@/lib/pets/constants";
import { oneOf, text } from "@/lib/pets/validation";

// Mesmos limites das restrições da tabela pet_adoptions (migração 007).
export const ADOPTION_LIMITS = {
  tutorName: 120,
  tutorContact: 120,
  tutorAddress: 300,
} as const;

/** Datas de adoção aceitas pelo banco a partir deste dia. */
export const MIN_ADOPTION_DATE = "1990-01-01";

export type AdoptionFields = {
  tutor_name: string;
  tutor_contact: string;
  tutor_address: string | null;
  adopted_at: string;
};

export type AdoptionFormErrors = Partial<Record<keyof AdoptionFields, string>>;

/** Data de hoje em Manaus (AAAA-MM-DD), para não aceitar adoções no futuro. */
export function todayInManaus(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Manaus" }).format(now);
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** Valida os dados do tutor e a data da adoção (campos do formulário de adoção). */
export function parseAdoptionForm(
  formData: FormData,
  today = todayInManaus(),
): { ok: true; data: AdoptionFields } | { ok: false; errors: AdoptionFormErrors } {
  const errors: AdoptionFormErrors = {};

  const tutorName = text(formData, "tutor_name");
  if (!tutorName) errors.tutor_name = "Informe o nome completo do tutor.";
  else if (tutorName.length > ADOPTION_LIMITS.tutorName) {
    errors.tutor_name = `Use no máximo ${ADOPTION_LIMITS.tutorName} caracteres.`;
  }

  const tutorContact = text(formData, "tutor_contact");
  if (!tutorContact) errors.tutor_contact = "Informe um telefone ou outro contato do tutor.";
  else if (tutorContact.length > ADOPTION_LIMITS.tutorContact) {
    errors.tutor_contact = `Use no máximo ${ADOPTION_LIMITS.tutorContact} caracteres.`;
  }

  const tutorAddress = text(formData, "tutor_address");
  if (tutorAddress.length > ADOPTION_LIMITS.tutorAddress) {
    errors.tutor_address = `Use no máximo ${ADOPTION_LIMITS.tutorAddress} caracteres.`;
  }

  const adoptedAt = text(formData, "adopted_at");
  if (!isValidDate(adoptedAt)) errors.adopted_at = "Informe a data da adoção.";
  else if (adoptedAt < MIN_ADOPTION_DATE) errors.adopted_at = "Confira o ano da adoção.";
  else if (adoptedAt > today) errors.adopted_at = "A data da adoção não pode estar no futuro.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      tutor_name: tutorName,
      tutor_contact: tutorContact,
      tutor_address: tutorAddress || null,
      adopted_at: adoptedAt,
    },
  };
}

export type AdoptedPetFields = { name: string; species: PetSpecies; sex: PetSex; size: PetSize };
export type AdoptedPetErrors = Partial<Record<keyof AdoptedPetFields | "photo", string>>;

/**
 * Dados do animal no cadastro direto da aba Adotados. Só os campos
 * obrigatórios da tabela pets; os demais (descrição, história…) são mantidos.
 */
export function parseAdoptedPetForm(formData: FormData):
  | { ok: true; data: AdoptedPetFields; photoPath: string | null }
  | { ok: false; errors: AdoptedPetErrors } {
  const errors: AdoptedPetErrors = {};

  const name = text(formData, "name");
  if (!name) errors.name = "Informe o nome do animal.";
  else if (name.length > LIMITS.name) errors.name = `Use no máximo ${LIMITS.name} caracteres.`;

  const species = text(formData, "species");
  if (!oneOf(species, SPECIES_LABELS)) errors.species = "Escolha a espécie.";

  const sex = text(formData, "sex");
  if (!oneOf(sex, SEX_LABELS)) errors.sex = "Escolha o sexo.";

  const size = text(formData, "size");
  if (!oneOf(size, SIZE_LABELS)) errors.size = "Escolha o porte.";

  const photoPath = text(formData, "photo_path");
  if (photoPath && !PHOTO_PATH_REGEX.test(photoPath)) errors.photo = "Arquivo de foto inválido.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    photoPath: photoPath || null,
    data: { name, species: species as PetSpecies, sex: sex as PetSex, size: size as PetSize },
  };
}

/** "2026-10-01" → "01/10/2026" (sem fuso: a data é só um dia do calendário). */
export function formatAdoptionDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}
