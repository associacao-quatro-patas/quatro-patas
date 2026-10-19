"use server";

import { updateTag } from "next/cache";
import { checkAdmin } from "@/lib/auth";
import { PETS_BUCKET, PHOTO_PATH_REGEX } from "@/lib/pets/constants";
import { SITE_PHOTOS_CACHE_TAG } from "@/lib/site-photos/queries";
import { ALT_MAX_LENGTH, isSitePhotoSlot } from "@/lib/site-photos/slots";

export type SitePhotoResult = { ok: true; message: string } | { ok: false; message: string };

type AdminSupabase = Extract<Awaited<ReturnType<typeof checkAdmin>>, { ok: true }>["supabase"];

async function removeFile(supabase: AdminSupabase, path: string | null | undefined) {
  if (!path) return;
  const { data, error } = await supabase.storage.from(PETS_BUCKET).remove([path]);
  if (error || !data?.length) console.error("Foto antiga não removida do bucket:", path, error?.message ?? "nada removido");
}

/**
 * Define (ou troca) a foto de um espaço do site. A imagem já foi enviada pelo
 * navegador ao bucket "pets"; aqui chega o nome do arquivo e a descrição.
 */
export async function saveSitePhoto(slot: string, photoPath: string, altText: string): Promise<SitePhotoResult> {
  const auth = await checkAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };
  const { supabase } = auth;

  if (!isSitePhotoSlot(slot)) return { ok: false, message: "Espaço de foto inválido." };
  if (!PHOTO_PATH_REGEX.test(photoPath)) return { ok: false, message: "Arquivo de foto inválido." };
  const alt = altText.trim();
  if (alt.length > ALT_MAX_LENGTH) {
    await removeFile(supabase, photoPath);
    return { ok: false, message: `A descrição deve ter no máximo ${ALT_MAX_LENGTH} caracteres.` };
  }

  const { data: current } = await supabase.from("site_photos").select("photo_path").eq("slot", slot).maybeSingle();

  const { data, error } = await supabase
    .from("site_photos")
    .upsert({ slot, photo_path: photoPath, alt_text: alt || null }, { onConflict: "slot" })
    .select("slot");

  if (error || !data?.length) {
    await removeFile(supabase, photoPath);
    if (error && ["PGRST205", "42P01"].includes(error.code ?? "")) {
      return { ok: false, message: "A tabela de fotos ainda não existe. Aplique a migração 006 no Supabase." };
    }
    return { ok: false, message: error ? `Não foi possível salvar: ${error.message}` : "Nada foi salvo: sua conta não tem permissão." };
  }

  if (current?.photo_path && current.photo_path !== photoPath) await removeFile(supabase, current.photo_path);

  updateTag(SITE_PHOTOS_CACHE_TAG);
  return { ok: true, message: "Foto salva. O site já foi atualizado." };
}

/** Remove a foto de um espaço: o site volta a mostrar a ilustração padrão. */
export async function removeSitePhoto(slot: string): Promise<SitePhotoResult> {
  const auth = await checkAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };
  if (!isSitePhotoSlot(slot)) return { ok: false, message: "Espaço de foto inválido." };

  const { data, error } = await auth.supabase.from("site_photos").delete().eq("slot", slot).select("photo_path");
  if (error) return { ok: false, message: `Não foi possível remover: ${error.message}` };
  if (!data?.length) return { ok: false, message: "Este espaço já está sem foto." };

  await removeFile(auth.supabase, data[0].photo_path);
  updateTag(SITE_PHOTOS_CACHE_TAG);
  return { ok: true, message: "Foto removida. O site voltou a mostrar a ilustração padrão." };
}
