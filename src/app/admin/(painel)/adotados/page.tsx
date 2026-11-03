import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { formatAdoptionDate } from "@/lib/adoptions/validation";
import { SPECIES_LABELS, petPhotoUrl } from "@/lib/pets/constants";
import type { PetAdoption } from "@/types/database";
import { DeletePetButton } from "../pets/delete-pet-button";

export const metadata: Metadata = { title: "Adotados" };

export default function AdminAdoptedPage() {
  return (
    <section className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Adotados</h1>
        <Link href="/admin/adotados/novo" className="rounded-lg bg-brand px-4 py-2.5 font-semibold text-brand-foreground">
          + Cadastrar adotado
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted">
        Os dados dos tutores são vistos só aqui. Na página{" "}
        <Link href="/mural-de-adocoes" className="font-semibold text-brand underline">
          Pets adotados
        </Link>{" "}
        aparecem apenas a foto e o nome do animal.
      </p>
      <Suspense fallback={<p className="mt-6 text-muted">Carregando…</p>}>
        <AdoptedList />
      </Suspense>
    </section>
  );
}

async function AdoptedList() {
  const { supabase } = await requireAdmin();
  const [petsResult, adoptionsResult] = await Promise.all([
    supabase.from("pets").select("*").eq("status", "adopted"),
    supabase.from("pet_adoptions").select("*"),
  ]);

  if (petsResult.error) {
    return (
      <p role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-800">
        Erro ao carregar os adotados: {petsResult.error.message}
      </p>
    );
  }

  // Tabela ainda não criada (migração 007): mostra os adotados sem tutor.
  const missingTable = ["PGRST205", "42P01"].includes(adoptionsResult.error?.code ?? "");
  const adoptions = new Map<string, PetAdoption>((adoptionsResult.data ?? []).map((a) => [a.pet_id, a]));

  // Adoções mais recentes primeiro; adotados sem data (anteriores ao registro) no fim.
  const items = petsResult.data
    .map((pet) => ({ pet, adoption: adoptions.get(pet.id) ?? null }))
    .sort(
      (a, b) =>
        (b.adoption?.adopted_at ?? "").localeCompare(a.adoption?.adopted_at ?? "") ||
        b.pet.updated_at.localeCompare(a.pet.updated_at),
    );

  return (
    <>
      {(missingTable || (adoptionsResult.error && !missingTable)) && (
        <p role="alert" className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {missingTable
            ? "O registro de adoções ainda não foi ativado no banco: aplique a migração 007 no Supabase."
            : `Erro ao carregar os dados dos tutores: ${adoptionsResult.error?.message}`}
        </p>
      )}

      {items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border bg-surface p-6 text-center text-muted">
          Nenhum animal adotado registrado ainda.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {items.map(({ pet, adoption }) => (
            <li key={pet.id} className="flex flex-wrap items-start gap-3 rounded-xl border border-border bg-surface p-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-border/40">
                {pet.photo_path ? (
                  <Image src={petPhotoUrl(pet.photo_path)} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-muted">Sem foto</span>
                )}
              </div>
              <div className="min-w-0 flex-1 basis-56">
                <p className="truncate font-bold">{pet.name}</p>
                <p className="text-sm text-muted">{SPECIES_LABELS[pet.species]}</p>
                {adoption ? (
                  <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
                    <dt className="text-muted">Tutor</dt>
                    <dd className="font-semibold break-words">{adoption.tutor_name}</dd>
                    <dt className="text-muted">Contato</dt>
                    <dd className="break-words">{adoption.tutor_contact}</dd>
                    <dt className="text-muted">Endereço</dt>
                    <dd className="break-words whitespace-pre-line">{adoption.tutor_address ?? "Não informado"}</dd>
                    <dt className="text-muted">Adotado em</dt>
                    <dd>{formatAdoptionDate(adoption.adopted_at)}</dd>
                  </dl>
                ) : (
                  <p className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                    Dados da adoção não informados
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/adotados/${pet.id}/editar`}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-border/40"
                >
                  {adoption ? "Editar" : "Completar dados"}
                </Link>
                <DeletePetButton
                  petId={pet.id}
                  petName={pet.name}
                  note="O registro do animal, a foto e os dados do tutor serão apagados e ele sai da página Pets adotados."
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
