import type { Metadata } from "next";
import { Suspense } from "react";
import { FormMessage } from "@/components/admin/form-ui";
import { requireAdmin } from "@/lib/auth";
import { petPhotoUrl } from "@/lib/pets/constants";
import { SITE_PHOTO_SLOTS } from "@/lib/site-photos/slots";
import { SitePhotoCard } from "./site-photo-card";

export const metadata: Metadata = { title: "Fotos do site" };

export default function AdminFotosPage() {
  return (
    <section className="py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Fotos do site</h1>
      <p className="mt-1 max-w-prose text-sm text-muted">
        Troque as imagens dos banners e seções do site. Sem foto, o espaço mostra a ilustração padrão. As fotos dos
        animais continuam sendo editadas em “Pets”.
      </p>
      <Suspense fallback={<p className="mt-6 text-muted">Carregando…</p>}>
        <PhotoSlots />
      </Suspense>
    </section>
  );
}

async function PhotoSlots() {
  const { supabase } = await requireAdmin();
  // Leitura direta (sem cache): o painel sempre mostra o que está gravado.
  const { data, error } = await supabase.from("site_photos").select("*");
  const missingTable = !!error && ["PGRST205", "42P01"].includes(error.code ?? "");

  return (
    <div className="mt-6 grid gap-4">
      {missingTable && (
        <FormMessage type="error">
          A tabela de fotos ainda não existe. Aplique a migração <code>006_site_photos.sql</code> no Supabase (SQL Editor) para
          ativar esta página.
        </FormMessage>
      )}
      {error && !missingTable && <FormMessage type="error">Erro ao carregar as fotos: {error.message}</FormMessage>}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SITE_PHOTO_SLOTS.map((info) => {
          const row = data?.find((r) => r.slot === info.slot);
          return (
            <SitePhotoCard
              key={info.slot}
              info={info}
              current={row ? { url: petPhotoUrl(row.photo_path), alt: row.alt_text } : null}
              enabled={!error}
            />
          );
        })}
      </ul>
    </div>
  );
}
