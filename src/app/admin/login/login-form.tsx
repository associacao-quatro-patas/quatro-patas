"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

/** Só aceita voltar para páginas do próprio painel (evita redirecionamento aberto). */
function safeNext(value: string | null) {
  return value && value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin/pets";
}

// O Next esconde (não desmonta) a página ao navegar; recriar o formulário ao
// escondê-lo evita que e-mail e senha fiquem guardados no HTML oculto.
export function LoginForm() {
  const [resetKey, setResetKey] = useState(0);
  useLayoutEffect(() => () => setResetKey((key) => key + 1), []);
  return <LoginFormFields key={resetKey} />;
}

function LoginFormFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });

    if (signInError) {
      setPending(false);
      setError("E-mail ou senha incorretos.");
      return;
    }

    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin !== true) {
      await supabase.auth.signOut();
      setPending(false);
      setError("Esta conta não está autorizada a usar o painel.");
      return;
    }

    router.replace(safeNext(searchParams.get("next")));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
      <label className="block">
        <span className="text-sm font-semibold">E-mail</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Senha</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 font-semibold text-brand-foreground disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
