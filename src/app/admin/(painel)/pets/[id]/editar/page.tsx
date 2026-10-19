import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { PetForm } from "../../pet-form";

export const metadata: Metadata = { title: "Editar animal" };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function EditPetPage({ params }: PageProps<"/admin/pets/[id]/editar">) {
  return (
    <section className="py-8">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Editar animal</h1>
      <Suspense fallback={<p className="text-muted">Carregando…</p>}>
        {params.then(({ id }) => (
          <EditForm id={id} />
        ))}
      </Suspense>
    </section>
  );
}

async function EditForm({ id }: { id: string }) {
  const { supabase } = await requireAdmin();
  if (!UUID_REGEX.test(id)) notFound();

  const { data: pet, error } = await supabase.from("pets").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Erro ao carregar o animal: ${error.message}`);
  if (!pet) notFound();

  return <PetForm pet={pet} />;
}
