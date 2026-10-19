import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PetCard } from "@/components/pets/pet-card";
import { PetFiltersBar } from "@/components/pets/pet-filters";
import { IconCircle, PawIcon } from "@/components/ui/icons";
import { hasActiveFilters, parsePetFilters, type PetFilters } from "@/lib/pets/filters";
import { getPublicPets } from "@/lib/pets/queries";
import { petAdoptionWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Adoção",
  description: "Mural Virtual de Adoção da ONG Protetora 4 Patas: cães e gatos resgatados em Manaus esperando por um lar.",
};

// Com Cache Components, searchParams é dado de requisição e precisa de <Suspense>.
export default function AdocaoPage({ searchParams }: PageProps<"/adocao">) {
  return (
    <section className="py-8 sm:py-12">
      <div className="card flex items-center gap-4 bg-gradient-to-br from-rosa-pastel to-white p-5 sm:p-8">
        <IconCircle size="lg">
          <PawIcon />
        </IconCircle>
        <div>
          <h1 className="text-3xl font-bold text-rosa-escuro sm:text-4xl">Mural Virtual de Adoção</h1>
          <p className="mt-1 text-cinza">Conheça os nossos resgatados e encontre seu novo melhor amigo.</p>
        </div>
      </div>
      <Suspense fallback={<p className="mt-8 text-muted">Carregando animais…</p>}>
        {searchParams.then((params) => {
          const filters = parsePetFilters(params);
          return (
            <>
              <PetFiltersBar filters={filters} />
              <PetGrid filters={filters} />
            </>
          );
        })}
      </Suspense>
    </section>
  );
}

async function PetGrid({ filters }: { filters: PetFilters }) {
  const pets = await getPublicPets(filters);
  const filtered = hasActiveFilters(filters);

  if (pets.length === 0) {
    return (
      <div className="card mt-6 border-dashed bg-rosa-pastel p-8 text-center">
        <PawIcon className="mx-auto size-10 text-rosa" />
        {filtered ? (
          <>
            <p className="mt-3 font-semibold text-cinza">Nenhum animal encontrado com esses filtros.</p>
            <Link href="/adocao" scroll={false} className="btn-secondary mt-4">
              Limpar filtros
            </Link>
          </>
        ) : (
          <>
            <p className="mt-3 font-semibold text-cinza">Nenhum animal disponível para adoção no momento.</p>
            <p className="mt-1 text-sm text-muted">Novos amigos podem chegar a qualquer hora. Volte em breve!</p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {pets.length === 1 ? "1 animal encontrado" : `${pets.length} animais encontrados`}
      </p>
      <ul className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet, i) => (
          <li key={pet.id}>
            <PetCard pet={pet} whatsappHref={petAdoptionWhatsAppHref(pet)} priority={i < 3} />
          </li>
        ))}
      </ul>
    </>
  );
}
