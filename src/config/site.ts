// Configuração estática do site. Informações da instituição que mudam (Pix,
// WhatsApp, endereço, redes sociais, textos) NÃO ficam aqui: vêm do Supabase
// (ou de variáveis de ambiente) e são editadas pelo painel administrativo.

export type NavItem = {
  label: string;
  href: string;
};

/** Nome oficial (rodapé, página Sobre e metadados). */
const fullName =
  "Associação Protetora 4 Patas de Assistência aos Animais Abandonados e Comunitários e Apoio aos Protetores Independentes";

export const siteConfig = {
  /** Nome curto para cabeçalho, botões e textos corridos. */
  name: "ONG Protetora 4 Patas",
  shortName: "4 Patas",
  fullName,
  /** Descrição informada no briefing da ONG (usada nos metadados). */
  description: `${fullName}: ONG de proteção animal em Manaus (AM) que resgata cães e gatos em situação de vulnerabilidade, promove feirinhas de adoção em praças e apoia protetores independentes.`,
  logo: { src: "/logo-4patas.png", alt: "Logo da ONG Protetora 4 Patas" },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  publicNav: [
    { label: "Início", href: "/" },
    { label: "Sobre", href: "/sobre" },
    { label: "Adoção", href: "/adocao" },
    { label: "Doações", href: "/doacoes" },
  ] satisfies NavItem[],
  adminNav: [
    { label: "Visão geral", href: "/admin" },
    { label: "Pets", href: "/admin/pets" },
    { label: "Instituição", href: "/admin/instituicao" },
    { label: "Doações", href: "/admin/doacoes" },
    { label: "Insumos", href: "/admin/insumos" },
    { label: "Fotos do site", href: "/admin/fotos" },
  ] satisfies NavItem[],
};
