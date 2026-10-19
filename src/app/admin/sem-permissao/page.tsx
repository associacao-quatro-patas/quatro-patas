import type { Metadata } from "next";
import { signOut } from "../actions";

export const metadata: Metadata = {
  title: "Sem permissão",
  robots: { index: false, follow: false },
};

export default function NoPermissionPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
        <h1 className="text-xl font-extrabold">Sem permissão</h1>
        <p className="mt-2 text-sm text-muted">
          Sua conta está conectada, mas não está autorizada a usar o painel administrativo.
        </p>
        <form action={signOut} className="mt-5">
          <button className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-brand-foreground">
            Sair
          </button>
        </form>
      </div>
    </main>
  );
}
