import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";
import { signOut } from "../actions";

export const metadata: Metadata = {
  title: { default: "Painel", template: `%s | Painel ${siteConfig.name}` },
  robots: { index: false, follow: false },
};

// O proxy (src/proxy.ts) bloqueia quem não está logado; cada página e Server
// Action ainda confere se o usuário é admin (requireAdmin / checkAdmin).
export default function PainelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="border-b border-border bg-surface md:w-60 md:border-r md:border-b-0">
        <Link href="/admin" className="flex items-center gap-2.5 px-4 py-4">
          <Logo size={40} />
          <span className="leading-tight">
            <span className="block font-bold text-rosa-escuro">{siteConfig.shortName}</span>
            <span className="block text-xs text-muted">Painel administrativo</span>
          </span>
        </Link>
        <nav
          className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible"
          aria-label="Painel"
        >
          {siteConfig.adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-border/60"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-border/60 md:mt-4"
          >
            Ver site
          </Link>
          <form action={signOut} className="shrink-0">
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-muted hover:bg-border/60">
              Sair
            </button>
          </form>
        </nav>
      </aside>
      <main className="flex-1 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
