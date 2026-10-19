import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { PETS_CACHE_TAG, PUBLIC_STATUSES } from "./constants";
import type { PetFilters } from "./filters";
import type { Pet } from "@/types/database";

// ---------------------------------------------------------------------------
// Leituras públicas (site). Usam o cliente anônimo, ficam em cache e são
// invalidadas na hora pelas Server Actions do painel (updateTag).
// ---------------------------------------------------------------------------

/** Os filtros fazem parte da chave do cache: cada combinação tem sua entrada. */
export async function getPublicPets(filters: PetFilters = {}): Promise<Pet[]> {
  "use cache";
  cacheTag(PETS_CACHE_TAG);
  cacheLife("hours");

  let query = createPublicClient().from("pets").select("*").in("status", PUBLIC_STATUSES);
  if (filters.species) query = query.eq("species", filters.species);
  if (filters.size) query = query.eq("size", filters.size);
  if (filters.sex) query = query.eq("sex", filters.sex);
  if (filters.vaccinated) query = query.eq("is_vaccinated", true);
  if (filters.neutered) query = query.eq("is_neutered", true);
  // A busca já chega limpa (normalizeSearch): sem curingas nem vírgulas.
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw new Error(`Erro ao carregar os animais: ${error.message}`);
  return data;
}

export async function getPublicPetBySlug(slug: string): Promise<Pet | null> {
  "use cache";
  cacheTag(PETS_CACHE_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient()
    .from("pets")
    .select("*")
    .eq("slug", slug)
    .in("status", PUBLIC_STATUSES)
    .maybeSingle();

  if (error) throw new Error(`Erro ao carregar o animal: ${error.message}`);
  return data;
}
