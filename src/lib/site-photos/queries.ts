import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { petPhotoUrl } from "@/lib/pets/constants";
import type { SitePhotoSlot } from "@/types/database";
import { SITE_PHOTO_SLOTS } from "./slots";

// Tag usada pelo painel (updateTag) para atualizar o site na hora.
export const SITE_PHOTOS_CACHE_TAG = "site-photos";

export type SitePhotoView = { url: string; alt: string };
export type SitePhotos = Partial<Record<SitePhotoSlot, SitePhotoView>>;

/**
 * Fotos cadastradas no painel, por espaço do site. Espaço sem foto (ou tabela
 * ainda não criada pela migração 006) = o site usa a ilustração padrão.
 */
export async function getSitePhotos(): Promise<SitePhotos> {
  "use cache";
  cacheTag(SITE_PHOTOS_CACHE_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient().from("site_photos").select("slot, photo_path, alt_text");
  if (error) {
    // PGRST205/42P01: tabela ainda não existe. Qualquer outro erro é registrado.
    if (!["PGRST205", "42P01"].includes(error.code ?? "")) {
      console.error("Erro ao carregar as fotos do site:", error.message);
    }
    return {};
  }

  const photos: SitePhotos = {};
  for (const row of data) {
    const info = SITE_PHOTO_SLOTS.find((s) => s.slot === row.slot);
    if (!info) continue;
    photos[row.slot] = { url: petPhotoUrl(row.photo_path), alt: row.alt_text?.trim() || info.defaultAlt };
  }
  return photos;
}
