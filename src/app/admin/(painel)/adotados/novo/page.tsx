import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { AdoptedForm } from "../adopted-form";

export const metadata: Metadata = { title: "Cadastrar adotado" };

export default function NewAdoptedPage() {
  return (
    <section className="py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Cadastrar adotado</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Para animais adotados que não estavam cadastrados no site. Se o animal já está na aba Pets, edite-o lá e mude o
        status para “Adotado”, assim o registro não fica duplicado.
      </p>
      <Suspense fallback={<p className="text-muted">Carregando…</p>}>
        <AdminOnlyForm />
      </Suspense>
    </section>
  );
}

async function AdminOnlyForm() {
  await requireAdmin();
  return <AdoptedForm />;
}
