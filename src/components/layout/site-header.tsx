"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { CloseIcon, HandHeartIcon, HomeIcon, MenuIcon, PawIcon, SearchIcon, UsersIcon } from "@/components/ui/icons";
import { FILTER_PARAMS, SEARCH_MAX_LENGTH } from "@/lib/pets/filters";
import { Logo } from "./logo";

const NAV_ICONS: Record<string, typeof HomeIcon> = {
  "/": HomeIcon,
  "/sobre": UsersIcon,
  "/adocao": PawIcon,
  "/doacoes": HandHeartIcon,
};

function isActive(pathname: string | undefined, href: string) {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type NavLinksProps = { variant: "desktop" | "mobile"; pathname?: string; onNavigate?: () => void };

function NavLinks({ variant, pathname, onNavigate }: NavLinksProps) {
  return siteConfig.publicNav.map((item) => {
    const active = isActive(pathname, item.href);
    const Icon = NAV_ICONS[item.href] ?? PawIcon;
    return variant === "desktop" ? (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`relative inline-flex min-h-11 items-center rounded-full px-4 font-semibold transition-colors hover:bg-rosa-pastel ${
          active ? "text-rosa-escuro after:absolute after:inset-x-4 after:bottom-1 after:h-0.5 after:rounded-full after:bg-rosa" : "text-cinza"
        }`}
      >
        {item.label}
      </Link>
    ) : (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`flex min-h-12 items-center gap-3 rounded-2xl px-3 font-semibold ${active ? "bg-rosa-pastel text-rosa-escuro" : "text-cinza hover:bg-rosa-pastel"}`}
      >
        <span className="icon-circle size-9 [&>svg]:size-5">
          <Icon />
        </span>
        {item.label}
      </Link>
    );
  });
}

// usePathname() é dado de requisição com Cache Components: precisa de <Suspense>.
// O fallback mostra os mesmos links sem o destaque da página ativa.
function ActiveNavLinks(props: Omit<NavLinksProps, "pathname">) {
  const pathname = usePathname();
  return <NavLinks {...props} pathname={pathname} />;
}

function Nav(props: Omit<NavLinksProps, "pathname">) {
  return (
    <Suspense fallback={<NavLinks {...props} />}>
      <ActiveNavLinks {...props} />
    </Suspense>
  );
}

const iconButton =
  "inline-flex size-11 items-center justify-center rounded-full text-cinza transition-colors hover:bg-rosa-pastel";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  // Esc fecha menu e busca.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const brand = (
    <Link href="/" className="flex items-center gap-2.5 rounded-full" aria-label={`${siteConfig.name}: página inicial`}>
      <Logo size={40} priority className="md:hidden" />
      <Logo size={56} priority className="hidden md:block" />
      <span className="text-xl font-bold text-rosa-escuro md:text-2xl">{siteConfig.shortName}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-rosa-claro bg-white/95 backdrop-blur">
      <Container className="grid h-16 grid-cols-[44px_1fr_44px] items-center gap-2 md:h-20 md:grid-cols-[auto_1fr_auto]">
        {/* Celular: menu à esquerda */}
        <button
          type="button"
          className={`${iconButton} md:hidden`}
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => {
            setMenuOpen((v) => !v);
            setSearchOpen(false);
          }}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Logo: centro no celular, esquerda no computador */}
        <div className="flex justify-center md:justify-start">{brand}</div>

        {/* Computador: navegação horizontal */}
        <nav className="hidden items-center justify-end gap-1 md:col-start-2 md:row-start-1 md:flex" aria-label="Principal">
          <Nav variant="desktop" />
        </nav>

        <button
          type="button"
          className={`${iconButton} justify-self-end`}
          aria-expanded={searchOpen}
          aria-controls="busca-animais"
          aria-label={searchOpen ? "Fechar busca" : "Buscar animal pelo nome"}
          onClick={() => {
            setSearchOpen((v) => !v);
            setMenuOpen(false);
          }}
        >
          {searchOpen ? <CloseIcon /> : <SearchIcon />}
        </button>
      </Container>

      {searchOpen && (
        <div id="busca-animais" className="border-t border-rosa-claro bg-white">
          <Container className="py-3">
            {/* GET simples: funciona com ou sem JavaScript e reaproveita os filtros da adoção */}
            <form action="/adocao" role="search" className="flex gap-2" onSubmit={() => setSearchOpen(false)}>
              <label htmlFor="busca" className="sr-only">
                Nome do animal
              </label>
              <input
                ref={searchInput}
                id="busca"
                name={FILTER_PARAMS.search}
                type="search"
                maxLength={SEARCH_MAX_LENGTH}
                placeholder="Buscar animal pelo nome…"
                className="min-h-12 flex-1 rounded-full border-2 border-rosa-claro bg-white px-5 text-base outline-none focus:border-rosa"
              />
              <button type="submit" className="btn-primary px-5" aria-label="Buscar">
                <SearchIcon className="size-5" />
              </button>
            </form>
          </Container>
        </div>
      )}

      {menuOpen && (
        <nav id="menu-mobile" className="border-t border-rosa-claro bg-white md:hidden" aria-label="Principal">
          <Container className="flex flex-col gap-1 py-3">
            <Nav variant="mobile" onNavigate={() => setMenuOpen(false)} />
          </Container>
        </nav>
      )}
    </header>
  );
}
