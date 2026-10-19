import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FormMessage } from "@/components/admin/form-ui";
import { requireAdmin } from "@/lib/auth";
import { DeleteSupplyButton } from "./delete-supply-button";

export const metadata: Metadata = { title: "Insumos" };

const STATUS_MESSAGES: Record<string, string> = {
  criado: "Insumo adicionado. A página de Doações já foi atualizada.",
  salvo: "Alterações salvas. A página de Doações já foi atualizada.",
  excluido: "Insumo excluído.",
};

export default function AdminInsumosPage({ searchParams }: PageProps<"/admin/insumos">) {
  return (
    <section className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Insumos</h1>
          <p className="mt-1 text-sm text-muted">Itens exibidos em “Itens de que precisamos” na página de Doações.</p>
        </div>
        <Link href="/admin/insumos/novo" className="rounded-lg bg-brand px-4 py-2.5 font-semibold text-brand-foreground">
          + Adicionar insumo
        </Link>
      </div>

      {/* Aviso de sucesso vindo da URL (?status=) e lista: dados de requisição, dentro de Suspense. */}
      <Suspense fallback={<p className="mt-6 text-muted">Carregando…</p>}>
        {searchParams.then(({ status }) => {
          const message = typeof status === "string" ? STATUS_MESSAGES[status] : undefined;
          return (
            <>
              {message && (
                <div className="mt-6">
                  <FormMessage type="success">{message}</FormMessage>
                </div>
              )}
              <SupplyList />
            </>
          );
        })}
      </Suspense>
    </section>
  );
}

async function SupplyList() {
  const { supabase } = await requireAdmin();
  // Como admin, a política RLS libera todos os insumos, inclusive os ocultos.
  const { data: supplies, error } = await supabase
    .from("supplies")
    .select("*")
    .order("is_urgent", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="mt-6">
        <FormMessage type="error">Erro ao carregar os insumos: {error.message}</FormMessage>
      </div>
    );
  }

  if (supplies.length === 0) {
    return (
      <p className="mt-6 rounded-xl border border-dashed border-border bg-surface p-6 text-center text-muted">
        Nenhum insumo cadastrado ainda. Use “+ Adicionar insumo” para criar o primeiro.
      </p>
    );
  }

  return (
    <ul className="mt-6 grid gap-3">
      {supplies.map((supply) => (
        <li
          key={supply.id}
          className={`flex flex-wrap items-start gap-3 rounded-xl border bg-surface p-4 ${
            supply.is_active ? "border-border" : "border-dashed border-border opacity-75"
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold">{supply.name}</p>
              {supply.is_urgent && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-brand-foreground">Urgente</span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  supply.is_active ? "bg-green-100 text-green-800" : "bg-zinc-200 text-zinc-700"
                }`}
              >
                {supply.is_active ? "Ativo" : "Oculto no site"}
              </span>
            </div>
            {supply.description && <p className="mt-1 text-sm text-muted">{supply.description}</p>}
            <p className="mt-1 text-xs text-muted">
              {supply.quantity ? `Quantidade: ${supply.quantity} · ` : ""}Ordem: {supply.sort_order}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/insumos/${supply.id}/editar`}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-border/40"
            >
              Editar
            </Link>
            <DeleteSupplyButton supplyId={supply.id} supplyName={supply.name} />
          </div>
        </li>
      ))}
    </ul>
  );
}
