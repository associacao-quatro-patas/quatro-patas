import "server-only";

// Número do WhatsApp da instituição, lido da variável de ambiente
// INSTITUTION_WHATSAPP (veja .env.example). Formato internacional, só com
// dígitos ou com pontuação: "5511999998888" ou "+55 (11) 99999-8888".
// Quando a página "Instituição" do painel existir, o número passará a vir do
// banco e esta variável ficará como alternativa.

export type WhatsAppConfig =
  | { status: "ok"; number: string }
  | { status: "missing" }
  | { status: "invalid" };

/** Normaliza e valida o número configurado (código do país + DDD + número). */
export function parseWhatsAppNumber(raw: string | undefined): WhatsAppConfig {
  const value = raw?.trim();
  if (!value) return { status: "missing" };

  const digits = value.replace(/\D/g, "");
  // E.164: até 15 dígitos. Exige código do país (ex.: 55 + DDD + 8 ou 9 dígitos).
  if (!/^[1-9]\d{11,14}$/.test(digits)) return { status: "invalid" };
  return { status: "ok", number: digits };
}

export function getInstitutionWhatsApp(): WhatsAppConfig {
  return parseWhatsAppNumber(process.env.INSTITUTION_WHATSAPP);
}

/** Link wa.me com a mensagem já preenchida. */
export function whatsAppLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function adoptionInterestMessage(petName: string, petUrl?: string) {
  const base = `Olá! Tenho interesse em adotar ${petName}. Gostaria de saber mais sobre a adoção.`;
  return petUrl ? `${base}\n${petUrl}` : base;
}

/**
 * Link "Quero adotar pelo WhatsApp" de um animal (mensagem com o nome dele e,
 * se o site tiver endereço público, o link da ficha). `null` se o WhatsApp da
 * ONG não estiver configurado ou for inválido.
 */
export function petAdoptionWhatsAppHref(pet: { name: string; slug: string }) {
  const whatsapp = getInstitutionWhatsApp();
  if (whatsapp.status !== "ok") return null;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const petUrl = site && !/localhost|127\.0\.0\.1/.test(site) ? `${site.replace(/\/$/, "")}/adocao/${pet.slug}` : undefined;
  return whatsAppLink(whatsapp.number, adoptionInterestMessage(pet.name, petUrl));
}
