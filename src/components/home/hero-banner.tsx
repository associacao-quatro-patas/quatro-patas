import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Carousel } from "@/components/ui/carousel";
import { ArrowRightIcon } from "@/components/ui/icons";
import { HeartPawIllustration, PetsIllustration } from "@/components/ui/illustrations";
import { getSitePhotos, type SitePhotoView } from "@/lib/site-photos/queries";

type HeroSlideProps = {
  title: string;
  text: string;
  cta: { label: string; href: string };
  art: ReactNode;
  /** Foto cadastrada no painel (Fotos do site); substitui a ilustração. */
  photo?: SitePhotoView;
  /** Nível do título (o primeiro destaque da página pode ser h1). */
  as?: "h1" | "h2";
};

/** Um destaque: texto + botão à esquerda, ilustração à direita (empilha no celular). */
export function HeroSlide({ title, text, cta, art, photo, as: Heading = "h2" }: HeroSlideProps) {
  return (
    <div className="relative grid min-h-full items-center gap-4 overflow-hidden rounded-card bg-gradient-to-br from-rosa-pastel via-white to-rosa-claro px-5 py-8 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:px-14 sm:py-12">
      <div className="relative z-10 text-center sm:text-left">
        <Heading className="text-3xl font-bold text-rosa-escuro sm:text-4xl lg:text-5xl">{title}</Heading>
        <p className="mx-auto mt-3 max-w-md text-base text-cinza sm:mx-0 sm:text-lg">{text}</p>
        <Link href={cta.href} className="btn-primary mt-6">
          {cta.label} <ArrowRightIcon className="size-5" />
        </Link>
      </div>
      {photo ? (
        <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-full border-8 border-white shadow-suave sm:w-full sm:max-w-xs">
          <Image src={photo.url} alt={photo.alt} fill sizes="(min-width: 640px) 320px, 192px" className="object-cover" />
        </div>
      ) : (
        <div className="mx-auto w-48 sm:w-full sm:max-w-sm">{art}</div>
      )}
    </div>
  );
}

/** Carrossel de destaques da página inicial (Adoção · Doação · Sobre). */
export async function HeroBanner() {
  const photos = await getSitePhotos();
  return (
    <Carousel label="Destaques" itemClassName="basis-full">
      <HeroSlide
        title="Adote: encontre seu novo melhor amigo!"
        text="Cães e gatos resgatados esperam por uma família. Conheça os animais e as nossas feirinhas de adoção nas praças de Manaus."
        cta={{ label: "Saiba mais", href: "/adocao" }}
        art={<PetsIllustration className="w-full" />}
        photo={photos.home_hero_adocao}
      />
      <HeroSlide
        title="Sua doação faz a diferença!"
        text="Com seu apoio, conseguimos alimentar, cuidar e dar uma segunda chance a muitos pets."
        cta={{ label: "Doe agora", href: "/doacoes" }}
        art={<HeartPawIllustration className="aspect-square w-full" />}
        photo={photos.home_hero_doacao}
      />
      <HeroSlide
        title="Conheça a ONG Protetora 4 Patas"
        text="Resgatamos animais em situação de vulnerabilidade em Manaus e apoiamos protetores independentes."
        cta={{ label: "Saiba mais", href: "/sobre" }}
        art={<HeartPawIllustration className="aspect-square w-full" />}
        photo={photos.home_hero_sobre}
      />
    </Carousel>
  );
}
