import { connection } from "next/server";
import { WhatsAppIcon } from "@/components/ui/icons";
import { getInstitutionWhatsApp, whatsAppLink } from "@/lib/whatsapp";

/**
 * Botão flutuante de WhatsApp (Verde Sucesso), só no celular. Aparece apenas
 * quando INSTITUTION_WHATSAPP está configurado (lido a cada visita).
 */
export async function WhatsAppFloat() {
  await connection();
  const whatsapp = getInstitutionWhatsApp();
  if (whatsapp.status !== "ok") return null;

  return (
    <a
      href={whatsAppLink(whatsapp.number, "Olá! Vim pelo site da ONG Protetora 4 Patas e gostaria de mais informações.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale com a ONG pelo WhatsApp (abre em nova aba)"
      className="fixed right-4 bottom-4 z-50 inline-flex size-14 items-center justify-center rounded-full bg-verde text-cinza shadow-lg ring-4 ring-white md:hidden"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
