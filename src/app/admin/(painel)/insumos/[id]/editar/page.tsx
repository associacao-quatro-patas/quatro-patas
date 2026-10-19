import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { SupplyForm } from "../../supply-form";

export const metadata: Metadata = { title: "Editar insumo" };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function EditSupplyPage({ params }: PageProps<"/admin/insumos/[id]/editar">) {
  return (
    <section className="py-8">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Editar insumo</h1>
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

  const { data: supply, error } = await supabase.from("supplies").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Erro ao carregar o insumo: ${error.message}`);
  if (!supply) notFound();

  return <SupplyForm supply={supply} />;
}
