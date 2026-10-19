import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { SupplyForm } from "../supply-form";

export const metadata: Metadata = { title: "Adicionar insumo" };

export default function NewSupplyPage() {
  return (
    <section className="py-8">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Adicionar insumo</h1>
      <Suspense fallback={<p className="text-muted">Carregando…</p>}>
        <AdminOnlyForm />
      </Suspense>
    </section>
  );
}

async function AdminOnlyForm() {
  await requireAdmin();
  return <SupplyForm />;
}
