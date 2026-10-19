import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import {
  ArrowRightIcon,
  HandHeartIcon,
  HeartIcon,
  IconCircle,
  PawIcon,
  StarIcon,
  SyringeIcon,
  UsersIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { siteConfig } from "@/config/site";
import { aboutContent as c } from "@/content/sobre";
import { resolveAboutContent, type AboutData } from "@/lib/institution/content";
import { getInstitutionContent } from "@/lib/institution/queries";
import { getInstitutionWhatsApp, whatsAppLink } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const about = resolveAboutContent(await getInstitutionContent());
  return { title: "Sobre", description: `${siteConfig.fullName}. ${about.intro.value}` };
}

// Textos: tabela institution_content (editada em /admin/instituicao). Trecho
// não cadastrado usa o texto provisório de src/content/sobre.ts.

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="section-title">
      {children}
    </h2>
  );
}

// Ícones das frentes de atuação (na ordem dos itens; repetem se houver mais).
const WORK_ICONS = [<HeartIcon key="r" />, <SyringeIcon key="c" />, <PawIcon key="f" />, <HandHeartIcon key="p" />, <StarIcon key="s" />, <UsersIcon key="u" />];

const HELP_OPTIONS = [
  { title: "Adote", text: "Conheça os animais que esperam por uma família.", href: "/adocao", cta: "Ver o mural de adoção", icon: <PawIcon /> },
  { title: "Doe via Pix", text: "Qualquer valor ajuda com alimentação e cuidados.", href: "/doacoes", cta: "Ir para Doações", icon: <HeartIcon /> },
  { title: "Doe itens", text: "Ração, remédios, produtos de limpeza e outros itens.", href: "/doacoes#itens-prioritarios", cta: "Ver itens prioritários", icon: <HandHeartIcon /> },
];

export default async function SobrePage() {
  const about = resolveAboutContent(await getInstitutionContent());

  return (
    <div className="grid grid-cols-1 gap-14 py-6 sm:gap-20 sm:py-8">
      {/* Apresentação */}
      <header className="card relative overflow-hidden bg-gradient-to-br from-rosa-pastel via-white to-rosa-claro px-5 py-8 sm:px-10 sm:py-12">
        <PawIcon className="pointer-events-none absolute -right-6 -bottom-8 size-40 text-rosa-claro sm:size-56" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <Logo size={96} className="bg-white p-1 shadow-suave" />
          <div>
            <p className="text-sm font-semibold tracking-wide text-rosa-escuro uppercase">Quem somos</p>
            <h1 className="mt-1 max-w-3xl text-2xl font-bold text-cinza sm:text-3xl">{siteConfig.fullName}</h1>
          </div>
        </div>
        <p className="texto-justificado relative mt-5 max-w-3xl text-base text-cinza sm:text-lg">{about.intro.value}</p>
        <div className="relative mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/adocao" className="btn-primary">
            Quero adotar
          </Link>
          <Link href="/doacoes" className="btn-secondary">
            Quero ajudar
          </Link>
        </div>
      </header>

      {/* Nossa história */}
      <section aria-labelledby="historia" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
        <SectionTitle id="historia">{c.history.title}</SectionTitle>
        <div className="grid gap-3 text-cinza">
          {about.history.value.length > 0 ? (
            about.history.value.map((paragraph, i) => (
              <p key={i} className="texto-justificado">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="card border-dashed bg-rosa-pastel p-5 text-muted">{c.history.pendingMessage}</p>
          )}
        </div>
      </section>

      {/* Missão, visão e valores */}
      <section aria-labelledby="missao-visao-valores">
        <SectionTitle id="missao-visao-valores">Missão, visão e valores</SectionTitle>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            { title: c.mission.title, text: about.mission.value, icon: <StarIcon /> },
            { title: c.vision.title, text: about.vision.value, icon: <HeartIcon /> },
          ].map((item) => (
            <article key={item.title} className="card flex gap-4 p-5">
              <IconCircle>{item.icon}</IconCircle>
              <div>
                <h3 className="text-lg font-bold text-rosa-escuro">{item.title}</h3>
                <p className="texto-justificado mt-1 text-cinza">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
        <article className="card mt-4 bg-rosa-pastel p-5">
          <h3 className="text-lg font-bold text-rosa-escuro">{c.values.title}</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {about.values.value.map((value, i) => (
              <li key={i} className="flex gap-3">
                <PawIcon className="mt-1 size-5 shrink-0 text-rosa" />
                <span className="texto-justificado">
                  <strong className="font-semibold text-cinza">{value.name}.</strong> <span className="text-cinza">{value.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Atuação em Manaus (inclui o apoio aos protetores independentes) */}
      <section aria-labelledby="atuacao">
        <SectionTitle id="atuacao">{c.work.title}</SectionTitle>
        <p className="texto-justificado mt-3 max-w-2xl text-muted">{about.workIntro.value}</p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {about.workItems.value.map((item, i) => (
            <li key={i} className="card p-5">
              <IconCircle>{WORK_ICONS[i % WORK_ICONS.length]}</IconCircle>
              <h3 className="mt-3 font-bold text-cinza">{item.name}</h3>
              <p className="texto-justificado mt-1 text-sm text-cinza">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Como ajudar */}
      <section aria-labelledby="como-ajudar">
        <SectionTitle id="como-ajudar">Como ajudar</SectionTitle>
        <p className="mt-3 text-muted">Toda ajuda faz diferença. Escolha a forma que combina com você:</p>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {HELP_OPTIONS.map((option) => (
            <li key={option.title} className="card flex flex-col p-5">
              <IconCircle>{option.icon}</IconCircle>
              <h3 className="mt-3 text-lg font-bold text-cinza">{option.title}</h3>
              <p className="texto-justificado mt-1 flex-1 text-sm text-cinza">{option.text}</p>
              <Link href={option.href} className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-semibold text-rosa-escuro hover:underline">
                {option.cta} <ArrowRightIcon className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Contato */}
      <section aria-labelledby="contato">
        <SectionTitle id="contato">Contato</SectionTitle>
        <Suspense fallback={<p className="mt-4 text-muted">Carregando…</p>}>
          <ContactChannels contacts={about.contacts} />
        </Suspense>
      </section>
    </div>
  );
}

/**
 * Mostra apenas canais configurados: o WhatsApp de INSTITUTION_WHATSAPP (lido a
 * cada visita, via connection) e os contatos opcionais cadastrados no painel.
 * Nada é exibido para canais vazios.
 */
async function ContactChannels({ contacts }: { contacts: AboutData["contacts"] }) {
  await connection();
  const whatsapp = getInstitutionWhatsApp();
  const others = [
    contacts.email && { label: "E-mail", value: contacts.email, href: `mailto:${contacts.email}` },
    contacts.instagramUrl && {
      label: "Instagram",
      value: "@" + contacts.instagramUrl.replace(/^https:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, ""),
      href: contacts.instagramUrl,
      external: true,
    },
    contacts.phone && { label: "Telefone", value: contacts.phone, href: `tel:+${contacts.phone.replace(/\D/g, "")}` },
    contacts.address && { label: "Endereço", value: contacts.address },
  ].filter(Boolean) as { label: string; value: string; href?: string; external?: boolean }[];

  if (whatsapp.status !== "ok" && others.length === 0) {
    return <p className="card mt-4 border-dashed p-5 text-muted">Os canais de contato da ONG serão divulgados em breve.</p>;
  }

  return (
    <div className="card mt-4 grid gap-4 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-cinza">Tem dúvidas sobre adoção, doações ou quer saber como ajudar? Fale com a gente.</p>
        {whatsapp.status === "ok" && (
          <a
            href={whatsAppLink(whatsapp.number, "Olá! Vim pelo site da ONG Protetora 4 Patas e gostaria de mais informações.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp shrink-0"
          >
            <WhatsAppIcon className="size-5" />
            Conversar pelo WhatsApp
          </a>
        )}
      </div>
      {others.length > 0 && (
        <dl className="grid gap-3 border-t border-rosa-claro pt-4 sm:grid-cols-2">
          {others.map((item) => (
            <div key={item.label}>
              <dt className="text-xs font-semibold text-muted uppercase">{item.label}</dt>
              <dd className="mt-0.5 font-semibold break-words whitespace-pre-line text-cinza">
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-rosa-escuro hover:underline"
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
