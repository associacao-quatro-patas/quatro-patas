import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { PetForm } from "../pet-form";

export const metadata: Metadata = { title: "Cadastrar animal" };

export default function NewPetPage() {
  return (
    <section className="py-8">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Cadastrar animal</h1>
      <Suspense fallback={<p className="text-muted">Carregando…</p>}>
        <AdminOnlyForm />
      </Suspense>
    </section>
  );
}

async function AdminOnlyForm() {
  await requireAdmin();
  return <PetForm />;
}
