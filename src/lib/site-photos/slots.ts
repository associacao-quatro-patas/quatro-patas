// Espaços fixos do site que podem receber foto pelo painel (migração 006).
// Seguro para servidor e navegador.

import type { SitePhotoSlot } from "@/types/database";

export type SlotInfo = {
  slot: SitePhotoSlot;
  page: string;
  label: string;
  /** Onde aparece, para o administrador se localizar. */
  where: string;
  /** Descrição usada quando o administrador não informar uma. */
  defaultAlt: string;
  /** Formato em que a foto aparece no site (para orientar o recorte). */
  shape: "redonda" | "retangular";
};

export const SITE_PHOTO_SLOTS: SlotInfo[] = [
  {
    slot: "home_hero_adocao",
    page: "Início",
    label: "Banner 1 · “Adote”",
    where: "Primeiro slide do carrossel do topo.",
    defaultAlt: "Animal resgatado pela ONG Protetora 4 Patas",
    shape: "redonda",
  },
  {
    slot: "home_hero_doacao",
    page: "Início",
    label: "Banner 2 · “Sua doação faz a diferença”",
    where: "Segundo slide do carrossel do topo.",
    defaultAlt: "Animal cuidado com a ajuda das doações",
    shape: "redonda",
  },
  {
    slot: "home_hero_sobre",
    page: "Início",
    label: "Banner 3 · “Conheça a ONG”",
    where: "Terceiro slide do carrossel do topo.",
    defaultAlt: "Equipe da ONG Protetora 4 Patas",
    shape: "redonda",
  },
  {
    slot: "home_quem_somos",
    page: "Início",
    label: "Quem somos",
    where: "Ao lado do texto “Quem somos”.",
    defaultAlt: "Foto da ONG Protetora 4 Patas",
    shape: "retangular",
  },
  {
    slot: "doacoes_hero",
    page: "Doações",
    label: "Banner “Sua doação faz a diferença!”",
    where: "Topo da página Doações.",
    defaultAlt: "Animal resgatado pela ONG Protetora 4 Patas",
    shape: "redonda",
  },
  {
    slot: "doacoes_impacto",
    page: "Doações",
    label: "Cada doação salva uma vida",
    where: "Fim da página Doações, ao lado do texto.",
    defaultAlt: "Animal resgatado pela ONG Protetora 4 Patas",
    shape: "retangular",
  },
];

export const ALT_MAX_LENGTH = 200;

export function isSitePhotoSlot(value: string): value is SitePhotoSlot {
  return SITE_PHOTO_SLOTS.some((s) => s.slot === value);
}
