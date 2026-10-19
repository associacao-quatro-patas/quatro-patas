import type { ReactNode } from "react";

// Peças de formulário do painel (mesmo visual do formulário de pets).

export const inputClass =
  "mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-sm text-red-700">{error}</span>}
    </label>
  );
}

export function Checkbox({ name, label, defaultChecked, hint }: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-2">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-5 shrink-0 accent-brand" />
      <span>
        <span className="font-semibold">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Mensagem de resultado (sucesso ou erro) anunciada para leitores de tela. */
export function FormMessage({ type, children }: { type: "success" | "error"; children: ReactNode }) {
  return (
    <p
      role={type === "error" ? "alert" : "status"}
      className={`rounded-lg p-3 text-sm ${type === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}
    >
      {children}
    </p>
  );
}
