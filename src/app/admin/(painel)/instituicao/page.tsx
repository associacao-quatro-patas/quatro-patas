import type { Metadata } from "next";
import { Suspense } from "react";
import { FormMessage } from "@/components/admin/form-ui";
import { requireAdmin } from "@/lib/auth";
import { getInstitutionWhatsApp } from "@/lib/whatsapp";
import { InstitutionForm } from "./institution-form";

export const metadata: Metadata = { title: "Instituição" };

export default function AdminInstituicaoPage() {
  return (
    <section className="py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Instituição</h1>
      <p className="mt-1 max-w-prose text-sm text-muted">
        Textos e contatos da página pública “Sobre”. Campos vazios continuam usando os textos provisórios até você
        cadastrar as informações confirmadas pela instituição.
      </p>
      <Suspense fallback={<p className="mt-6 text-muted">Carregando…</p>}>
        <InstitutionLoader />
      </Suspense>
    </section>
  );
}

async function InstitutionLoader() {
  const { supabase } = await requireAdmin();
  // Leitura direta (sem cache): o formulário sempre mostra o que está gravado.
  const { data, error } = await supabase.from("institution_content").select("*").maybeSingle();
  const whatsapp = getInstitutionWhatsApp();

  if (error) {
    return (
      <div className="mt-6">
        <FormMessage type="error">Erro ao carregar o conteúdo institucional: {error.message}</FormMessage>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        WhatsApp da página Sobre:{" "}
        <strong className="text-foreground">
          {whatsapp.status === "ok"
            ? "configurado no servidor"
            : whatsapp.status === "invalid"
              ? "configurado em formato inválido"
              : "não configurado"}
        </strong>{" "}
        (variável INSTITUTION_WHATSAPP; o número não é exibido aqui).
      </p>
      <InstitutionForm content={data} />
    </div>
  );
}
