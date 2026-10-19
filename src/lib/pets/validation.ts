import type { PetSex, PetSize, PetSpecies, PetStatus } from "@/types/database";
import { LIMITS, PHOTO_PATH_REGEX, SEX_LABELS, SIZE_LABELS, SPECIES_LABELS, STATUS_LABELS } from "./constants";

export type PetFormFields = {
  name: string;
  species: PetSpecies;
  sex: PetSex;
  age: string | null;
  size: PetSize;
  description: string | null;
  story: string | null;
  is_neutered: boolean;
  is_vaccinated: boolean;
  status: PetStatus;
};

export type PetFormErrors = Partial<Record<keyof PetFormFields | "photo", string>>;

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function oneOf<T extends string>(value: string, labels: Record<T, string>): value is T {
  return Object.hasOwn(labels, value);
}

/**
 * Valida os campos do formulário com as mesmas regras da tabela pets.
 * O banco também valida, mas aqui as mensagens são amigáveis.
 */
export function parsePetForm(formData: FormData):
  | { ok: true; data: PetFormFields; photoPath: string | null }
  | { ok: false; errors: PetFormErrors } {
  const errors: PetFormErrors = {};

  const name = text(formData, "name");
  if (!name) errors.name = "Informe o nome.";
  else if (name.length > LIMITS.name) errors.name = `Use no máximo ${LIMITS.name} caracteres.`;

  const species = text(formData, "species");
  if (!oneOf(species, SPECIES_LABELS)) errors.species = "Escolha a espécie.";

  const sex = text(formData, "sex");
  if (!oneOf(sex, SEX_LABELS)) errors.sex = "Escolha o sexo.";

  const size = text(formData, "size");
  if (!oneOf(size, SIZE_LABELS)) errors.size = "Escolha o porte.";

  const status = text(formData, "status");
  if (!oneOf(status, STATUS_LABELS)) errors.status = "Escolha o status.";

  const age = text(formData, "age");
  if (age.length > LIMITS.age) errors.age = `Use no máximo ${LIMITS.age} caracteres.`;

  const description = text(formData, "description");
  if (description.length > LIMITS.description) {
    errors.description = `Use no máximo ${LIMITS.description} caracteres.`;
  }

  const story = text(formData, "story");
  if (story.length > LIMITS.story) errors.story = `Use no máximo ${LIMITS.story} caracteres.`;

  const photoPath = text(formData, "photo_path");
  if (photoPath && !PHOTO_PATH_REGEX.test(photoPath)) errors.photo = "Arquivo de foto inválido.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    photoPath: photoPath || null,
    data: {
      name,
      species: species as PetSpecies,
      sex: sex as PetSex,
      size: size as PetSize,
      status: status as PetStatus,
      age: age || null,
      description: description || null,
      story: story || null,
      is_neutered: formData.get("is_neutered") === "on",
      is_vaccinated: formData.get("is_vaccinated") === "on",
    },
  };
}
