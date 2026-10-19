import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdoptionInterest } from "@/components/pets/adoption-interest";
import { CareBadges, PetPhoto, PetStatusBadge } from "@/components/pets/pet-card";
import { FavoriteButton } from "@/components/pets/favorite-button";
import { SEX_LABELS, SIZE_LABELS, SPECIES_LABELS } from "@/lib/pets/constants";
import { getPublicPetBySlug } from "@/lib/pets/queries";

// Com Cache Components, `params` é dado de requisição e precisa de <Suspense>.
export default function PetPage({ params }: PageProps<"/adocao/[slug]">) {
  return (
    <section className="py-8 sm:py-12">
      <Link href="/adocao" className="text-sm font-semibold text-brand hover:underline">
        ← Voltar para adoção
      </Link>
      <Suspense fallback={<p className="mt-6 text-muted">Carregando…</p>}>
        {params.then(({ slug }) => (
          <PetDetails slug={slug} />
        ))}
      </Suspense>
    </section>
  );
}

async function PetDetails({ slug }: { slug: string }) {
  const pet = await getPublicPetBySlug(slug);
  if (!pet) notFound();

  const facts = [
    ["Espécie", SPECIES_LABELS[pet.species]],
    ["Sexo", SEX_LABELS[pet.sex]],
    ["Porte", SIZE_LABELS[pet.size]],
    ["Idade", pet.age ?? "Não informada"],
    ["Castrado", pet.is_neutered ? "Sim" : "Não"],
    ["Vacinado", pet.is_vaccinated ? "Sim" : "Não"],
  ];

  return (
    <article className="mt-6 grid gap-8 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-border/40">
        <PetPhoto pet={pet} sizes="(min-width: 768px) 50vw, 100vw" priority />
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{pet.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <PetStatusBadge status={pet.status} className="text-sm" />
          <FavoriteButton petId={pet.id} petName={pet.name} />
        </div>
        <CareBadges pet={pet} className="mt-3" />

        <AdoptionInterest petName={pet.name} petSlug={pet.slug} inProgress={pet.status === "adoption_in_progress"} />

        <dl className="mt-6 grid grid-cols-2 gap-3">
          {facts.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-surface p-3">
              <dt className="text-xs font-semibold text-muted uppercase">{label}</dt>
              <dd className="mt-0.5 font-bold">{value}</dd>
            </div>
          ))}
        </dl>

        {pet.description && (
          <div className="mt-6">
            <h2 className="text-lg font-extrabold">Sobre {pet.name}</h2>
            <p className="texto-justificado mt-2 whitespace-pre-line text-foreground/90">{pet.description}</p>
          </div>
        )}

        {pet.story && (
          <div className="mt-6">
            <h2 className="text-lg font-extrabold">História</h2>
            <p className="texto-justificado mt-2 whitespace-pre-line text-foreground/90">{pet.story}</p>
          </div>
        )}
      </div>
    </article>
  );
}
