import Image from "next/image";
import Link from "next/link";
import type { Pet } from "@/types/database";
import { CheckIcon, SyringeIcon, WhatsAppIcon } from "@/components/ui/icons";
import { PhotoPlaceholder } from "@/components/ui/illustrations";
import { SEX_LABELS, SIZE_LABELS, SPECIES_LABELS, STATUS_LABELS, petPhotoUrl } from "@/lib/pets/constants";
import { FavoriteButton } from "./favorite-button";

export function PetPhoto({ pet, sizes, priority }: { pet: Pet; sizes: string; priority?: boolean }) {
  return pet.photo_path ? (
    <Image
      src={petPhotoUrl(pet.photo_path)}
      alt={`Foto de ${pet.name}`}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
    />
  ) : (
    <PhotoPlaceholder label={`${pet.name} ainda não tem foto`} className="h-full w-full" />
  );
}

const statusStyles: Record<Pet["status"], string> = {
  available: "bg-rosa-pastel text-rosa-escuro",
  adoption_in_progress: "bg-amarelo text-cinza",
  adopted: "bg-zinc-200 text-zinc-700",
};

export function PetStatusBadge({ status, className = "" }: { status: Pet["status"]; className?: string }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]} ${className}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

/** Selos de vacina e castração: rosa quando em dia, Amarelo Alerta quando pendente. */
export function CareBadges({ pet, className = "" }: { pet: Pet; className?: string }) {
  const badge = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold";
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Cuidados">
      <li className={`${badge} ${pet.is_vaccinated ? "bg-rosa-pastel text-rosa-escuro" : "bg-amarelo/70 text-cinza"}`}>
        <SyringeIcon className="size-3.5" />
        {pet.is_vaccinated ? "Vacinado" : "Vacina pendente"}
      </li>
      <li className={`${badge} ${pet.is_neutered ? "bg-rosa-pastel text-rosa-escuro" : "bg-amarelo/70 text-cinza"}`}>
        <CheckIcon className="size-3.5" />
        {pet.is_neutered ? "Castrado" : "Castração pendente"}
      </li>
    </ul>
  );
}

export function petSummary(pet: Pet) {
  return [pet.age ?? "Idade não informada", SEX_LABELS[pet.sex], `Porte ${SIZE_LABELS[pet.size].toLowerCase()}`].join(" · ");
}

/**
 * Cartão do animal. O nome é o link para a ficha (o cartão inteiro é clicável);
 * coração e WhatsApp ficam por cima, como ações independentes.
 */
export function PetCard({ pet, whatsappHref, priority }: { pet: Pet; whatsappHref?: string | null; priority?: boolean }) {
  return (
    <article className="card group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3.4] overflow-hidden bg-rosa-claro">
        <PetPhoto pet={pet} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw" priority={priority} />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {pet.status === "adoption_in_progress" ? <PetStatusBadge status={pet.status} className="shadow-sm" /> : <span />}
          <FavoriteButton petId={pet.id} petName={pet.name} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold text-cinza">
          <Link
            href={`/adocao/${pet.slug}`}
            className="after:absolute after:inset-0 after:content-[''] group-hover:text-rosa-escuro"
          >
            {pet.name}
          </Link>
        </h3>
        <p className="text-sm text-muted">
          {SPECIES_LABELS[pet.species]} · {petSummary(pet)}
        </p>
        <CareBadges pet={pet} className="mt-3" />

        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp relative z-10 mt-4 w-full"
            aria-label={`Quero adotar ${pet.name} pelo WhatsApp (abre em nova aba)`}
          >
            <WhatsAppIcon className="size-5" />
            Quero adotar pelo WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}
