// Conteúdo da página "Sobre": banco (institution_content) com fallback para os
// textos provisórios de src/content/sobre.ts. Seguro para servidor e navegador.

import { aboutContent as fallback } from "@/content/sobre";
import type { InstitutionContent, NamedItem } from "@/types/database";

/** Mesmos limites das regras da tabela (migração 005). */
export const INSTITUTION_LIMITS = {
  intro: 600,
  history: 5000,
  mission: 600,
  vision: 600,
  workIntro: 300,
  values: { maxItems: 8, name: 60, text: 300 },
  work: { maxItems: 6, name: 60, text: 400 },
  email: 120,
  instagram: 200,
  address: 300,
} as const;

/** "db" = cadastrado pelo painel · "fallback" = texto provisório (pendente). */
export type ContentSource = "db" | "fallback";
export type Sourced<T> = { value: T; source: ContentSource };

export type AboutData = {
  intro: Sourced<string>;
  /** Parágrafos da história; vazio = ainda não cadastrada. */
  history: Sourced<string[]>;
  mission: Sourced<string>;
  vision: Sourced<string>;
  values: Sourced<readonly NamedItem[]>;
  workIntro: Sourced<string>;
  workItems: Sourced<readonly NamedItem[]>;
  contacts: {
    email: string | null;
    instagramUrl: string | null;
    phone: string | null;
    address: string | null;
  };
};

function pick<T>(dbValue: T | null | undefined, fallbackValue: T): Sourced<T> {
  return dbValue == null ? { value: fallbackValue, source: "fallback" } : { value: dbValue, source: "db" };
}

/** Quebra a história em parágrafos (linhas em branco ou quebras de linha). */
export function historyParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function resolveAboutContent(row: InstitutionContent | null): AboutData {
  const history = row?.history_text ? historyParagraphs(row.history_text) : null;
  return {
    intro: pick(row?.intro_text, fallback.intro.text),
    history: pick<string[]>(history?.length ? history : null, fallback.history.paragraphs),
    mission: pick(row?.mission_text, fallback.mission.text),
    vision: pick(row?.vision_text, fallback.vision.text),
    values: pick<readonly NamedItem[]>(row?.values_items?.length ? row.values_items : null, fallback.values.items),
    workIntro: pick(row?.work_intro, fallback.work.intro),
    workItems: pick<readonly NamedItem[]>(row?.work_items?.length ? row.work_items : null, fallback.work.items),
    contacts: {
      email: row?.contact_email ?? null,
      instagramUrl: row?.instagram_url ?? fallback.contacts.instagramUrl,
      phone: row?.phone ?? null,
      address: row?.address ?? null,
    },
  };
}
