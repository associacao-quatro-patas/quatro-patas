import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { AdoptedForm } from "../../adopted-form";

export const metadata: Metadata = { title: "Editar adotado" };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function EditAdoptedPage({ params }: PageProps<"/admin/adotados/[id]/editar">) {
  return (
    <section className="py-8">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Editar adotado</h1>
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

  const [{ data: pet, error }, { data: adoption }] = await Promise.all([
    supabase.from("pets").select("*").eq("id", id).maybeSingle(),
    supabase.from("pet_adoptions").select("*").eq("pet_id", id).maybeSingle(),
  ]);
  if (error) throw new Error(`Erro ao carregar o animal: ${error.message}`);
  if (!pet) notFound();
  // Ainda não adotado: a adoção é registrada pela aba Pets (mudando o status).
  if (pet.status !== "adopted") redirect(`/admin/pets/${pet.id}/editar`);

  return <AdoptedForm pet={pet} adoption={adoption} />;
}
