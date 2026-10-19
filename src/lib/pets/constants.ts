// Constantes e utilitários dos pets, seguros para servidor e navegador.
// Os valores aceitos espelham as validações da tabela (migração 001).

import type { PetSex, PetSize, PetSpecies, PetStatus } from "@/types/database";

export const PETS_BUCKET = "pets";
export const PETS_CACHE_TAG = "pets";

export const SPECIES_LABELS: Record<PetSpecies, string> = {
  dog: "Cachorro",
  cat: "Gato",
  other: "Outro",
};

export const SEX_LABELS: Record<PetSex, string> = {
  male: "Macho",
  female: "Fêmea",
  unknown: "Não informado",
};

export const SIZE_LABELS: Record<PetSize, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
};

export const STATUS_LABELS: Record<PetStatus, string> = {
  available: "Disponível",
  adoption_in_progress: "Em processo de adoção",
  adopted: "Adotado",
};

/** Status que aparecem no site público (o mesmo critério da política RLS). */
export const PUBLIC_STATUSES = ["available", "adoption_in_progress"] as const satisfies readonly PetStatus[];

export const LIMITS = {
  name: 80,
  age: 50,
  description: 2000,
  story: 5000,
  slug: 100,
} as const;

/** Mesmo formato exigido pela coluna photo_path (migração 003). */
export const PHOTO_PATH_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|avif)$/;

/** URL pública da foto no bucket "pets" (o bucket é público). */
export function petPhotoUrl(photoPath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/storage/v1/object/public/${PETS_BUCKET}/${encodeURIComponent(photoPath)}`;
}

/** "Mel Pipoca!" → "mel-pipoca". Resultado vazio se não sobrar nenhum caractere válido. */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, LIMITS.slug - 4)
    .replace(/-+$/g, "");
}
