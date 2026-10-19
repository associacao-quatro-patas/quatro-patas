import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { PixBand } from "@/components/donations/pix-card";
import { HeroBanner } from "@/components/home/hero-banner";
import { PetCard } from "@/components/pets/pet-card";
import { Carousel } from "@/components/ui/carousel";
import { ArrowRightIcon, HeartIcon, IconCircle, PawIcon, UsersIcon } from "@/components/ui/icons";
import { SitePhotoFrame } from "@/components/ui/site-photo";
import { siteConfig } from "@/config/site";
import { getDonationSettings } from "@/lib/donations/queries";
import { resolveAboutContent } from "@/lib/institution/content";
import { getInstitutionContent } from "@/lib/institution/queries";
import { getPublicPets } from "@/lib/pets/queries";
import { getSitePhotos } from "@/lib/site-photos/queries";

// Título e descrição: os padrões do layout (nome oficial completo da associação).

/** Quantos animais disponíveis aparecem no carrossel da página inicial. */
const FEATURED_PETS = 9;

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="section-title">
      {children}
    </h2>
  );
}

const SHORTCUTS = [
  { label: "Adoção", text: "Conheça quem espera por você", href: "/adocao", icon: <PawIcon /> },
  { label: "Doação", text: "Pix e itens prioritários", href: "/doacoes", icon: <HeartIcon /> },
  { label: "Sobre", text: "Quem somos e como atuamos", href: "/sobre", icon: <UsersIcon /> },
];

export default async function HomePage() {
  // "Quem somos": mesma fonte da página Sobre (painel → institution_content,
  // com fallback para src/content/sobre.ts).
  const [about, photos] = [resolveAboutContent(await getInstitutionContent()), await getSitePhotos()];

  return (
    <div className="grid grid-cols-1 gap-14 py-6 sm:gap-20 sm:py-8">
      <h1 className="sr-only">{siteConfig.name}: adoção responsável e proteção animal em Manaus</h1>

      {/* Hero em carrossel */}
      <HeroBanner />

      {/* Atalhos rápidos */}
      <nav aria-label="Atalhos">
        <ul className="grid grid-cols-3 gap-3 sm:gap-5">
          {SHORTCUTS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="card flex h-full min-h-28 flex-col items-center justify-center gap-2 bg-rosa-pastel p-3 text-center transition-colors hover:border-rosa sm:flex-row sm:justify-start sm:gap-4 sm:p-5 sm:text-left"
              >
                <IconCircle>{item.icon}</IconCircle>
                <span>
                  <span className="block font-semibold text-cinza">{item.label}</span>
                  <span className="hidden text-sm text-muted sm:block">{item.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quem somos */}
      <section aria-labelledby="quem-somos" className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
        <div>
          <SectionTitle id="quem-somos">Quem somos</SectionTitle>
          <p className="texto-justificado mt-4 text-cinza">{about.intro.value}</p>
          <Link href="/sobre" className="btn-primary mt-6">
            Saiba mais <ArrowRightIcon className="size-5" />
          </Link>
        </div>
        {/* Foto da ONG (painel → Fotos do site); sem foto, espaço reservado */}
        <SitePhotoFrame photo={photos.home_quem_somos} placeholderLabel="Espaço para foto da ONG Protetora 4 Patas" />
      </section>

      {/* Nossos animais */}
      <section aria-labelledby="nossos-animais">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionTitle id="nossos-animais">Nossos animais</SectionTitle>
            <p className="mt-3 text-muted">Conheça alguns dos nossos resgatados que estão em busca de um lar.</p>
          </div>
          <Link href="/adocao" className="btn-secondary">
            Ver adoções <ArrowRightIcon className="size-5" />
          </Link>
        </div>
        <Suspense fallback={<div className="mt-6 h-80 animate-pulse rounded-card bg-rosa-pastel" aria-hidden="true" />}>
          <FeaturedPets />
        </Suspense>
      </section>

      {/* Faça uma doação (Pix) */}
      <Suspense fallback={<div className="h-40 animate-pulse rounded-card bg-rosa-pastel" aria-hidden="true" />}>
        <DonationBand />
      </Suspense>

      {/* Nosso objetivo · Como funciona? */}
      <section aria-label="Nosso objetivo e como funciona" className="grid gap-4 md:grid-cols-2 md:gap-6">
        <InfoCard icon={<UsersIcon />} title="Nosso objetivo" href="/sobre" cta="Saiba mais sobre nós">
          Resgatar, cuidar e encontrar um lar para cada animal.
        </InfoCard>
        <InfoCard icon={<HeartIcon />} title="Como funciona?" href="/doacoes" cta="Veja como ajudar">
          É simples e seguro: você escolhe como ajudar — adotando, doando via Pix ou doando itens.
        </InfoCard>
      </section>
    </div>
  );
}

/** Mesma consulta e regras da página de adoção; aqui só os "Disponível". */
async function FeaturedPets() {
  const pets = (await getPublicPets()).filter((pet) => pet.status === "available").slice(0, FEATURED_PETS);

  if (pets.length === 0) {
    return (
      <div className="card mt-6 border-dashed bg-rosa-pastel p-8 text-center">
        <PawIcon className="mx-auto size-10 text-rosa" />
        <p className="mt-3 font-semibold text-cinza">Nenhum animal disponível para adoção neste momento.</p>
        <p className="mt-1 text-sm text-muted">Novos amigos podem chegar a qualquer hora. Volte em breve!</p>
        <Link href="/adocao" className="btn-primary mt-5">
          Conhecer o mural de adoção
        </Link>
      </div>
    );
  }

  return (
    <Carousel label="Nossos animais" itemClassName="basis-[85%] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc((100%-2rem)/3)]" className="mt-6">
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </Carousel>
  );
}

async function DonationBand() {
  return <PixBand settings={await getDonationSettings()} />;
}

function InfoCard({ icon, title, href, cta, children }: { icon: ReactNode; title: string; href: string; cta: string; children: ReactNode }) {
  return (
    <article className="card flex gap-4 bg-rosa-pastel p-5">
      <IconCircle>{icon}</IconCircle>
      <div>
        <h3 className="text-lg font-bold text-cinza after:mt-1.5 after:block after:h-1 after:w-8 after:rounded-full after:bg-rosa after:content-['']">
          {title}
        </h3>
        <p className="texto-justificado mt-2 text-cinza">{children}</p>
        <Link href={href} className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-semibold text-rosa-escuro hover:underline">
          {cta} <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </article>
  );
}
