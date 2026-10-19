import type { ReactNode } from "react";

type PagePlaceholderProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

/**
 * Marcador temporário para páginas ainda não implementadas.
 * Remova ao construir o conteúdo real de cada página.
 */
export function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  return (
    <section className="py-10 sm:py-16">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-prose text-muted">{description}</p>
      <div className="mt-6 rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-muted">
        Página em construção.
      </div>
      {children}
    </section>
  );
}
