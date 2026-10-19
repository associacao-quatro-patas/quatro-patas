// Pix "BR Code" (padrão EMV do Banco Central) para QR Code ESTÁTICO.
// Nenhum dado da instituição fica aqui: tudo vem de public.donation_settings.
// Referência: Manual de Padrões para Iniciação do Pix (Banco Central do Brasil).

import type { DonationSettings, PixKeyType } from "@/types/database";

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), exigido pelo BR Code. */
export function crc16(payload: string) {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(payload)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Campo EMV: ID (2 dígitos) + tamanho (2 dígitos) + valor. */
function field(id: string, value: string) {
  const size = new TextEncoder().encode(value).length;
  if (size > 99) throw new Error(`Campo ${id} longo demais para o BR Code.`);
  return `${id}${String(size).padStart(2, "0")}${value}`;
}

/** Nome e cidade no QR: sem acentos e só caracteres seguros, como pedem os bancos. */
function emvText(text: string, max: number) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 .,\-/&]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/**
 * Gera o "Pix Copia e Cola" de um QR Code estático, sem valor fixo (a pessoa
 * escolhe quanto doar no app do banco).
 */
export function buildStaticPixPayload({ key, merchantName, merchantCity }: {
  key: string;
  merchantName: string;
  merchantCity: string;
}) {
  const name = emvText(merchantName, 25);
  const city = emvText(merchantCity, 15);
  if (!key || !name || !city) throw new Error("Chave, nome e cidade são obrigatórios para o QR Code.");

  const payload =
    field("00", "01") + // versão do payload
    field("26", field("00", "br.gov.bcb.pix") + field("01", key)) + // conta Pix
    field("52", "0000") + // categoria do recebedor (não informada)
    field("53", "986") + // moeda: real
    field("58", "BR") +
    field("59", name) +
    field("60", city) +
    field("62", field("05", "***")) + // sem identificador de transação
    "6304"; // CRC (calculado sobre tudo, inclusive "6304")

  return payload + crc16(payload);
}

/** Confere formato e CRC de um "Pix Copia e Cola" (ex.: o fornecido pelo banco). */
export function isValidPixPayload(payload: string) {
  const value = payload.trim();
  if (!/^000201/.test(value) || !/br\.gov\.bcb\.pix/i.test(value)) return false;
  const match = value.match(/^([\s\S]*6304)([0-9A-Fa-f]{4})$/);
  return !!match && crc16(match[1]) === match[2].toUpperCase();
}

/**
 * Normaliza a chave digitada no formato que o Pix espera (usado pelo painel).
 * Devolve null se o formato não corresponder ao tipo escolhido.
 */
export function normalizePixKey(type: PixKeyType, raw: string): string | null {
  const value = raw.trim();
  const digits = value.replace(/\D/g, "");
  switch (type) {
    case "cpf":
      return digits.length === 11 ? digits : null;
    case "cnpj":
      return digits.length === 14 ? digits : null;
    case "phone": {
      // Aceita "(11) 99999-8888" (assume Brasil) ou já com código do país.
      const full = value.startsWith("+") ? digits : digits.length <= 11 ? `55${digits}` : digits;
      return /^[1-9]\d{10,14}$/.test(full) ? `+${full}` : null;
    }
    case "email":
      return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) && value.length <= 77 ? value.toLowerCase() : null;
    case "random":
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value.toLowerCase() : null;
  }
}

export type PixDisplay = {
  /** Chave para exibir/copiar (pode existir sem QR Code). */
  key: string | null;
  keyType: PixKeyType | null;
  /** Conteúdo do QR Code e do botão "Pix Copia e Cola". */
  qrPayload: string | null;
  qrSource: "official" | "generated" | null;
};

/**
 * Decide o que a página mostra, só com dados oficiais cadastrados:
 * 1º o Copia e Cola oficial (se o CRC conferir); 2º QR gerado a partir de
 * chave + nome + cidade; senão, só a chave; senão, nada ("em breve").
 */
export function resolvePixDisplay(settings: DonationSettings | null): PixDisplay {
  const key = settings?.pix_key?.trim() || null;
  const keyType = key ? settings?.pix_key_type ?? null : null;
  const official = settings?.pix_copy_paste?.trim();

  if (official && isValidPixPayload(official)) {
    return { key, keyType, qrPayload: official, qrSource: "official" };
  }

  const name = settings?.pix_merchant_name?.trim();
  const city = settings?.pix_merchant_city?.trim();
  if (key && name && city) {
    try {
      return { key, keyType, qrPayload: buildStaticPixPayload({ key, merchantName: name, merchantCity: city }), qrSource: "generated" };
    } catch {
      // Dados insuficientes depois da limpeza: mostra só a chave.
    }
  }

  return { key, keyType, qrPayload: null, qrSource: null };
}
