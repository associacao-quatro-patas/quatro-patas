import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  const configured = getSupabaseEnv() !== null;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <Logo size={72} priority className="mx-auto mb-4" />
        <h1 className="text-center text-xl font-bold text-rosa-escuro">Painel administrativo</h1>
        <p className="text-center text-sm text-muted">{siteConfig.name}</p>
        <p className="mt-1 text-center text-sm text-muted">Acesso restrito a administradores autorizados.</p>
        {configured ? (
          // useSearchParams (parâmetro ?next=) é dado de requisição: precisa de <Suspense>.
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        ) : (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Supabase ainda não configurado. Crie o arquivo <code>.env.local</code> a partir de{" "}
            <code>.env.example</code>.
          </p>
        )}
      </div>
    </main>
  );
}
