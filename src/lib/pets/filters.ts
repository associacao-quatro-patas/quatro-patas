// Filtros da página pública de adoção. Ficam na URL
// (?especie=dog&porte=small&vacinado=sim&busca=mel) para que possam ser
// combinados, compartilhados e funcionem sem JavaScript.

import type { PetSex, PetSize, PetSpecies } from "@/types/database";

export type PetFilters = {
  species?: PetSpecies;
  size?: PetSize;
  sex?: PetSex;
  vaccinated?: boolean;
  neutered?: boolean;
  /** Busca pelo nome do animal (campo de busca do cabeçalho). */
  search?: string;
};

type GroupKey = "species" | "size" | "sex";
type ToggleKey = "vaccinated" | "neutered";

/** Nome do parâmetro na URL (em português) para cada filtro. */
export const FILTER_PARAMS = {
  species: "especie",
  size: "porte",
  sex: "sexo",
  vaccinated: "vacinado",
  neutered: "castrado",
  search: "busca",
} as const satisfies Record<keyof PetFilters, string>;

/** Opções exibidas em cada grupo, na ordem da tela. */
export const FILTER_OPTIONS = {
  species: [
    { value: "dog", label: "Cão" },
    { value: "cat", label: "Gato" },
    { value: "other", label: "Outros" },
  ],
  size: [
    { value: "small", label: "Pequeno" },
    { value: "medium", label: "Médio" },
    { value: "large", label: "Grande" },
  ],
  sex: [
    { value: "male", label: "Macho" },
    { value: "female", label: "Fêmea" },
  ],
} as const satisfies Record<GroupKey, readonly { value: string; label: string }[]>;

export const FILTER_GROUP_LABELS: Record<GroupKey, string> = {
  species: "Espécie",
  size: "Porte",
  sex: "Sexo",
};

export const TOGGLE_LABELS: Record<ToggleKey, string> = {
  vaccinated: "Vacinado",
  neutered: "Castrado",
};

export const SEARCH_MAX_LENGTH = 40;

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Limpa a busca: só letras, números, espaço, hífen e apóstrofo (evita curingas). */
export function normalizeSearch(raw: string | undefined) {
  const value = (raw ?? "")
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s'-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SEARCH_MAX_LENGTH);
  return value || undefined;
}

/** Lê os filtros da URL, ignorando valores desconhecidos ou repetidos. */
export function parsePetFilters(searchParams: SearchParams): PetFilters {
  const filters: PetFilters = {};
  for (const key of Object.keys(FILTER_OPTIONS) as GroupKey[]) {
    const value = first(searchParams[FILTER_PARAMS[key]]);
    const option = FILTER_OPTIONS[key].find((o) => o.value === value);
    if (option) Object.assign(filters, { [key]: option.value });
  }
  for (const key of Object.keys(TOGGLE_LABELS) as ToggleKey[]) {
    if (first(searchParams[FILTER_PARAMS[key]]) === "sim") filters[key] = true;
  }
  const search = normalizeSearch(first(searchParams[FILTER_PARAMS.search]));
  if (search) filters.search = search;
  return filters;
}

export function hasActiveFilters(filters: PetFilters) {
  return Object.values(filters).some(Boolean);
}

/** Monta a URL de /adocao com os filtros informados. */
export function buildAdoptionHref(filters: PetFilters) {
  const params = new URLSearchParams();
  for (const key of Object.keys(FILTER_OPTIONS) as GroupKey[]) {
    if (filters[key]) params.set(FILTER_PARAMS[key], filters[key]);
  }
  for (const key of Object.keys(TOGGLE_LABELS) as ToggleKey[]) {
    if (filters[key]) params.set(FILTER_PARAMS[key], "sim");
  }
  if (filters.search) params.set(FILTER_PARAMS.search, filters.search);
  const query = params.toString();
  return query ? `/adocao?${query}` : "/adocao";
}

/**
 * URL com um grupo alterado e os demais mantidos.
 * Passar `undefined` (ou o valor já ativo) remove aquele filtro.
 */
export function filterHref(current: PetFilters, key: GroupKey, value: string | undefined) {
  return buildAdoptionHref({ ...current, [key]: current[key] === value ? undefined : value });
}

/** URL com um filtro de cuidado (vacinado/castrado) ligado ou desligado. */
export function toggleHref(current: PetFilters, key: ToggleKey) {
  return buildAdoptionHref({ ...current, [key]: current[key] ? undefined : true });
}
