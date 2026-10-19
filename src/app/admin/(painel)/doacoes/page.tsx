import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { DonationForm } from "./donation-form";

export const metadata: Metadata = { title: "Doações" };

export default function AdminDoacoesPage() {
  return (
    <section className="py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Doações</h1>
      <p className="mt-1 max-w-prose text-sm text-muted">
        Dados do Pix exibidos na página pública de Doações. Deixe em branco o que a instituição ainda não tiver.
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-muted">Carregando…</p>}>
          <DonationSettingsLoader />
        </Suspense>
      </div>
    </section>
  );
}

async function DonationSettingsLoader() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("donation_settings").select("*").maybeSingle();

  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
        Erro ao carregar os dados de doação: {error.message}
      </p>
    );
  }
  return <DonationForm settings={data} />;
}
