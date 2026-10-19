import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { HeartIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { resolveAboutContent } from "@/lib/institution/content";
import { getInstitutionContent } from "@/lib/institution/queries";
import { getInstitutionWhatsApp, whatsAppLink } from "@/lib/whatsapp";
import { Logo } from "./logo";

const socialClass =
  "inline-flex size-12 items-center justify-center rounded-full bg-rosa text-white shadow-suave transition-colors hover:bg-rosa-escuro";

/**
 * Redes sociais vindas do sistema: Instagram (painel → institution_content) e
 * WhatsApp (INSTITUTION_WHATSAPP, lido a cada visita). Canais não cadastrados
 * não aparecem. Facebook ainda não tem campo no banco, então não é exibido.
 */
async function SocialLinks() {
  await connection();
  const [about, whatsapp] = [resolveAboutContent(await getInstitutionContent()), getInstitutionWhatsApp()];
  const instagram = about.contacts.instagramUrl;

  if (!instagram && whatsapp.status !== "ok") return null;

  const handle = instagram?.replace(/^https:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");

  return (
    <div className="flex flex-col items-center gap-3">
    <ul className="flex items-center justify-center gap-4" aria-label="Redes sociais">
      {instagram && (
        <li>
          <a href={instagram} target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="Instagram da ONG (abre em nova aba)">
            <InstagramIcon className="size-6" />
          </a>
        </li>
      )}
      {whatsapp.status === "ok" && (
        <li>
          <a
            href={whatsAppLink(whatsapp.number, "Olá! Vim pelo site da ONG Protetora 4 Patas e gostaria de mais informações.")}
            target="_blank"
            rel="noopener noreferrer"
            className={socialClass}
            aria-label="WhatsApp da ONG (abre em nova aba)"
          >
            <WhatsAppIcon className="size-6" />
          </a>
        </li>
      )}
    </ul>
      {instagram && handle && (
        <a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-rosa-escuro hover:underline"
        >
          <InstagramIcon className="size-5" />@{handle}
          <span className="sr-only">(Instagram, abre em nova aba)</span>
        </a>
      )}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-rosa-pastel pb-24 md:pb-10">
      {/* Onda decorativa no topo do rodapé */}
      <svg aria-hidden="true" viewBox="0 0 1440 48" preserveAspectRatio="none" className="block h-8 w-full bg-white text-rosa-pastel md:h-12">
        <path fill="currentColor" d="M0 48h1440V18c-160 18-330 26-520 14C700 18 520 0 330 2 200 3 90 12 0 22v26Z" />
      </svg>
      <Container className="flex flex-col items-center gap-6 pt-4 text-center">
        <p className="flex w-full max-w-md items-center gap-4 text-lg font-semibold text-rosa-escuro">
          <span className="h-px flex-1 bg-rosa-claro" aria-hidden="true" />
          Juntos por eles <HeartIcon className="size-5 text-rosa" />
          <span className="h-px flex-1 bg-rosa-claro" aria-hidden="true" />
        </p>

        <Suspense fallback={null}>
          <SocialLinks />
        </Suspense>

        <div className="flex flex-col items-center gap-3">
          <Logo size={80} />
          <p className="max-w-2xl text-sm font-semibold text-cinza">{siteConfig.fullName}</p>
        </div>

        <nav aria-label="Rodapé" className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm">
          {siteConfig.publicNav.map((item) => (
            <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center rounded-full px-3 text-cinza hover:text-rosa-escuro">
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
