import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { SPECIES_LABELS, STATUS_LABELS, petPhotoUrl } from "@/lib/pets/constants";
import type { PetStatus } from "@/types/database";
import { DeletePetButton } from "./delete-pet-button";

export const metadata: Metadata = { title: "Pets" };

const statusStyles: Record<PetStatus, string> = {
  available: "bg-green-100 text-green-800",
  adoption_in_progress: "bg-amber-100 text-amber-900",
  adopted: "bg-zinc-200 text-zinc-700",
};

export default function AdminPetsPage() {
  return (
    <section className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Pets</h1>
        <Link
          href="/admin/pets/novo"
          className="rounded-lg bg-brand px-4 py-2.5 font-semibold text-brand-foreground"
        >
          + Cadastrar animal
        </Link>
      </div>
      <Suspense fallback={<p className="mt-6 text-muted">Carregando…</p>}>
        <PetList />
      </Suspense>
    </section>
  );
}

async function PetList() {
  const { supabase } = await requireAdmin();
  // Como admin, a política RLS libera todos os pets, inclusive os adotados.
  const { data: pets, error } = await supabase
    .from("pets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-800">
        Erro ao carregar os animais: {error.message}
      </p>
    );
  }

  if (pets.length === 0) {
    return (
      <p className="mt-6 rounded-xl border border-dashed border-border bg-surface p-6 text-center text-muted">
        Nenhum animal cadastrado ainda.
      </p>
    );
  }

  return (
    <ul className="mt-6 grid gap-3">
      {pets.map((pet) => (
        <li
          key={pet.id}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3"
        >
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-border/40">
            {pet.photo_path ? (
              <Image src={petPhotoUrl(pet.photo_path)} alt="" fill sizes="64px" className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-xs text-muted">Sem foto</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{pet.name}</p>
            <p className="text-sm text-muted">{SPECIES_LABELS[pet.species]}</p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[pet.status]}`}
            >
              {STATUS_LABELS[pet.status]}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/pets/${pet.id}/editar`}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-border/40"
            >
              Editar
            </Link>
            <DeletePetButton petId={pet.id} petName={pet.name} />
          </div>
        </li>
      ))}
    </ul>
  );
}
