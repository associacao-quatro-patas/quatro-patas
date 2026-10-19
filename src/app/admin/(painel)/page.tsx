import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { HeartIcon, PawIcon } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/auth";
import { resolvePixDisplay } from "@/lib/donations/pix";
import { getActiveSupplies, getDonationSettings } from "@/lib/donations/queries";
import { getPublicPets } from "@/lib/pets/queries";

export const metadata: Metadata = { title: "Visão geral" };

export default function AdminHomePage() {
  return (
    <section className="py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Visão geral</h1>
      <p className="mt-1 text-sm text-muted">Resumo do que está publicado no site e atalhos para o gerenciamento.</p>
      <Suspense fallback={<OverviewSkeleton />}>
        <Overview />
      </Suspense>
    </section>
  );
}

/**
 * Usa as mesmas consultas públicas do site (os números refletem exatamente o
 * que os visitantes veem). Elas são atualizadas na hora quando algo é salvo
 * no painel.
 */
async function Overview() {
  await requireAdmin();

  const [pets, supplies, donation] = await Promise.all([
    getPublicPets().then(
      (list) => ({ ok: true as const, available: list.filter((p) => p.status === "available").length, inProgress: list.filter((p) => p.status === "adoption_in_progress").length }),
      () => ({ ok: false as const }),
    ),
    getActiveSupplies(),
    getDonationSettings(),
  ]);

  const pix = donation.status === "ok" ? resolvePixDisplay(donation.data) : null;
  const pixStatus =
    donation.status !== "ok"
      ? { label: "Indisponível", text: "Não foi possível verificar os dados do Pix.", ok: false }
      : pix?.qrPayload
        ? { label: "Ativo com QR Code", text: "A página de Doações mostra o QR Code e o botão de copiar.", ok: true }
        : pix?.key
          ? { label: "Ativo (só chave)", text: "A página de Doações mostra a chave Pix, sem QR Code.", ok: true }
          : { label: "Não configurado", text: "A página de Doações mostra “Pix disponível em breve”.", ok: false };

  const activeSupplies = supplies.status === "ok" ? supplies.data : null;
  const urgent = activeSupplies?.filter((s) => s.is_urgent).length ?? 0;

  return (
    <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <OverviewCard
        icon={<PawIcon className="size-6" />}
        title="Animais"
        value={pets.ok ? pets.available : "—"}
        caption={pets.ok ? (pets.available === 1 ? "disponível para adoção" : "disponíveis para adoção") : "não foi possível carregar"}
        detail={
          pets.ok
            ? pets.inProgress > 0
              ? `${pets.inProgress} em processo de adoção também aparece${pets.inProgress === 1 ? "" : "m"} no site.`
              : pets.available === 0
                ? "Nenhum animal visível no site no momento."
                : undefined
            : undefined
        }
        links={[
          { href: "/admin/pets", label: "Gerenciar animais" },
          { href: "/admin/pets/novo", label: "+ Cadastrar animal", primary: true },
        ]}
      />
      <OverviewCard
        icon={<HeartIcon className="size-6" />}
        title="Insumos"
        value={activeSupplies ? activeSupplies.length : "—"}
        caption={activeSupplies ? (activeSupplies.length === 1 ? "ativo no site" : "ativos no site") : "não foi possível carregar"}
        detail={
          activeSupplies
            ? activeSupplies.length === 0
              ? "A lista de itens ainda está vazia."
              : urgent > 0
                ? `${urgent} marcado${urgent === 1 ? "" : "s"} como urgente${urgent === 1 ? "" : "s"}.`
                : undefined
            : undefined
        }
        links={[
          { href: "/admin/insumos", label: "Gerenciar insumos" },
          { href: "/admin/insumos/novo", label: "+ Adicionar insumo", primary: true },
        ]}
      />
      <OverviewCard
        icon={<PixIcon />}
        title="Doações via Pix"
        value={pixStatus.label}
        valueSmall
        valueTone={pixStatus.ok ? "ok" : "warn"}
        detail={pixStatus.text}
        links={[{ href: "/admin/doacoes", label: "Editar dados do Pix", primary: true }]}
      />
    </ul>
  );
}

function OverviewCard({
  icon,
  title,
  value,
  caption,
  detail,
  links,
  valueSmall,
  valueTone,
}: {
  icon: ReactNode;
  title: string;
  value: number | string;
  caption?: string;
  detail?: string;
  links: { href: string; label: string; primary?: boolean }[];
  valueSmall?: boolean;
  valueTone?: "ok" | "warn";
}) {
  const tone = valueTone === "ok" ? "text-green-800" : valueTone === "warn" ? "text-amber-900" : "text-foreground";
  return (
    <li className="flex flex-col rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">{icon}</span>
        <h2 className="font-extrabold">{title}</h2>
      </div>
      <p className="mt-4">
        <span className={`font-extrabold ${valueSmall ? "text-xl" : "text-4xl"} ${tone}`}>{value}</span>
        {caption && <span className="ml-2 text-sm text-muted">{caption}</span>}
      </p>
      {detail && <p className="mt-1 text-sm text-muted">{detail}</p>}
      <div className="mt-5 flex flex-1 flex-wrap items-end gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              link.primary
                ? "rounded-lg bg-rosa-escuro px-3 py-2 text-sm font-semibold text-white hover:brightness-110"
                : "rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-border/40"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </li>
  );
}

function PixIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="currentColor">
      <path d="M17.6 16.9a2.9 2.9 0 0 1-2-.8l-2.9-2.9a.6.6 0 0 0-.8 0l-2.9 2.9a2.9 2.9 0 0 1-2 .8H6.4l3.7 3.7a2.7 2.7 0 0 0 3.8 0l3.7-3.7h0ZM7 7.1a2.9 2.9 0 0 1 2 .8l2.9 2.9a.6.6 0 0 0 .8 0l2.9-2.9a2.9 2.9 0 0 1 2-.8h.4l-3.7-3.7a2.7 2.7 0 0 0-3.8 0L6.6 7.1H7Zm13.6 3L18.4 8a.4.4 0 0 1-.2 0h-1a2 2 0 0 0-1.4.6l-2.9 2.9a1.4 1.4 0 0 1-2 0L8 8.6A2 2 0 0 0 6.6 8H5.4a.4.4 0 0 1-.2 0L3 10.1a2.7 2.7 0 0 0 0 3.8l2.2 2.2a.4.4 0 0 1 .2 0h1.2a2 2 0 0 0 1.4-.6l2.9-2.9a1.4 1.4 0 0 1 2 0l2.9 2.9a2 2 0 0 0 1.4.6h1a.4.4 0 0 1 .2 0l2.2-2.2a2.7 2.7 0 0 0 0-3.8Z" />
    </svg>
  );
}

function OverviewSkeleton() {
  return (
    <div aria-hidden="true" className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-48 animate-pulse rounded-2xl bg-border/40" />
      ))}
    </div>
  );
}
