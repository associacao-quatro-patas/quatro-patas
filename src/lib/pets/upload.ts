// Preparo e envio de fotos. Roda SOMENTE no navegador: o arquivo vai direto
// para o Supabase Storage com a sessão do administrador, sem passar pelo
// servidor do Next (Server Actions aceitam no máximo 1 MB por requisição).

import { createClient } from "@/lib/supabase/client";
import { PETS_BUCKET } from "./constants";

const MAX_DIMENSION = 1600;
const QUALITY = 0.85;
export const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024;

// Formato final de TODAS as fotos. Precisa estar entre os "Allowed MIME types"
// do bucket "pets" (hoje: image/jpeg e image/png) e a extensão precisa estar
// na lista das políticas do Storage (migração 002) e da coluna photo_path (003).
// JPEG é aceito por todos os navegadores ao converter imagens.
export const PHOTO_CONTENT_TYPE = "image/jpeg";
export const PHOTO_EXTENSION = "jpg";

/**
 * Reduz a foto para no máximo 1600 px e converte para JPEG. Fotos de celular
 * de 5–10 MB ficam com algumas centenas de KB, carregando rápido no site.
 */
export async function compressImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Não foi possível ler esta imagem. Tente uma foto em JPG ou PNG.");
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d")!;
  // JPEG não tem transparência: fundo branco evita áreas pretas em PNGs.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, PHOTO_CONTENT_TYPE, QUALITY),
  );
  if (!blob || blob.type !== PHOTO_CONTENT_TYPE) {
    throw new Error("Não foi possível converter a imagem.");
  }
  return blob;
}

/** Envia a foto ao bucket "pets" e devolve o nome do arquivo (photo_path). */
export async function uploadPetPhoto(file: File): Promise<string> {
  const blob = await compressImage(file);
  // Nome único a cada envio: trocar a foto gera uma URL nova, sem cache antigo.
  const path = `${crypto.randomUUID()}.${PHOTO_EXTENSION}`;

  const { error } = await createClient()
    .storage.from(PETS_BUCKET)
    .upload(path, blob, { contentType: PHOTO_CONTENT_TYPE, cacheControl: "31536000", upsert: false });

  if (error) {
    if (/mime type/i.test(error.message)) {
      throw new Error("O bucket \"pets\" recusou o formato da imagem. Confira os tipos permitidos no Supabase.");
    }
    if (/row-level security|unauthorized/i.test(error.message)) {
      throw new Error("Sem permissão para enviar fotos. Entre novamente com uma conta de administrador.");
    }
    throw new Error(error.message);
  }
  return path;
}
