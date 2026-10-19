import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PixCard } from "@/components/donations/pix-card";
import { HelpCategories, SupplyList } from "@/components/donations/supply-list";
import { HeroSlide } from "@/components/home/hero-banner";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PetsIllustration } from "@/components/ui/illustrations";
import { SitePhotoFrame } from "@/components/ui/site-photo";
import { getActiveSupplies, getDonationSettings } from "@/lib/donations/queries";
import { getSitePhotos } from "@/lib/site-photos/queries";
import { getInstitutionWhatsApp } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Doações",
  description: "Doe via Pix ou com itens da lista de necessidades da ONG Protetora 4 Patas, em Manaus.",
};

export default async function DoacoesPage() {
  const photos = await getSitePhotos();

  return (
    <div className="grid grid-cols-1 gap-14 py-6 sm:gap-20 sm:py-8">
      <HeroSlide
        as="h1"
        title="Sua doação faz a diferença!"
        text="Com seu apoio, conseguimos alimentar, cuidar e dar uma segunda chance a muitos pets."
        cta={{ label: "Doe agora", href: "#pix-titulo" }}
        art={<PetsIllustration className="w-full" />}
        photo={photos.doacoes_hero}
      />

      <section aria-labelledby="como-ajudar">
        <h2 id="como-ajudar" className="section-title">
          Como você pode ajudar?
        </h2>
        <HelpCategories />
        <div className="mt-8">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-card bg-rosa-pastel" aria-hidden="true" />}>
            <Supplies />
          </Suspense>
        </div>
      </section>

      <div className="scroll-mt-24" id="doe-via-pix">
        <Suspense fallback={<div className="h-56 animate-pulse rounded-card bg-rosa-pastel" aria-hidden="true" />}>
          <Pix />
        </Suspense>
      </div>

      <section aria-labelledby="cada-doacao" className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
        <SitePhotoFrame photo={photos.doacoes_impacto} placeholderLabel="Espaço para foto de um animal resgatado pela ONG" />
        <div>
          <h2 id="cada-doacao" className="section-title">
            Cada doação salva uma vida
          </h2>
          <p className="texto-justificado mt-4 text-cinza">
            Com o seu apoio, podemos continuar resgatando, cuidando e encontrando lares responsáveis para os nossos pets.
          </p>
          <Link href="/sobre" className="btn-secondary mt-6">
            Saiba mais <ArrowRightIcon className="size-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

// O número do WhatsApp é lido a cada visita (connection), como no resto do site.
async function Supplies() {
  await connection();
  const whatsapp = getInstitutionWhatsApp();
  return (
    <SupplyList supplies={await getActiveSupplies()} whatsappNumber={whatsapp.status === "ok" ? whatsapp.number : null} />
  );
}

async function Pix() {
  return <PixCard settings={await getDonationSettings()} />;
}
