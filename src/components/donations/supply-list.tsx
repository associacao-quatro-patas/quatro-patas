import type { ReactNode } from "react";
import type { Supply } from "@/types/database";
import type { Loaded } from "@/lib/donations/queries";
import { BowlIcon, HandHeartIcon, SparkleCleanIcon, SyringeIcon, WhatsAppIcon } from "@/components/ui/icons";
import { whatsAppLink } from "@/lib/whatsapp";

const supplyMessage = (item?: string) =>
  item
    ? `Olá! Gostaria de doar ${item} para a ONG Protetora 4 Patas. Como posso fazer a entrega?`
    : "Olá! Gostaria de doar itens para a ONG Protetora 4 Patas. Quais são as necessidades no momento?";

/**
 * "Como você pode ajudar?": as 4 formas de doação do wireframe. Os insumos
 * ainda não têm categoria no banco, então os 3 primeiros cartões levam à lista
 * real de itens prioritários logo abaixo e o último leva ao Pix.
 */
export function HelpCategories() {
  const items: { title: ReactNode; icon: ReactNode; href: string; hint: string }[] = [
    { title: <>Ração e<br />mantimentos</>, icon: <BowlIcon />, href: "#itens-prioritarios", hint: "ver itens" },
    { title: <>Produtos de<br />higiene e limpeza</>, icon: <SparkleCleanIcon />, href: "#itens-prioritarios", hint: "ver itens" },
    { title: <>Medicamentos<br />e cuidados</>, icon: <SyringeIcon />, href: "#itens-prioritarios", hint: "ver itens" },
    { title: <>Doação<br />financeira</>, icon: <HandHeartIcon />, href: "#pix-titulo", hint: "doar via Pix" },
  ];
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map((item, i) => (
        <li key={i}>
          <a
            href={item.href}
            className="card flex h-full min-h-36 flex-col items-center justify-center gap-3 bg-rosa-pastel p-4 text-center transition-colors hover:border-rosa"
          >
            <span className="icon-circle size-12 [&>svg]:size-6">{item.icon}</span>
            <span className="text-sm leading-snug font-semibold text-cinza">{item.title}</span>
            <span className="sr-only">({item.hint})</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Lista real de insumos (Supabase): urgentes primeiro, com quantidade quando
 * houver. Com o WhatsApp da ONG configurado, cada item tem um botão "Quero doar
 * este item" e há um botão geral para combinar a doação.
 */
export function SupplyList({ supplies, whatsappNumber }: { supplies: Loaded<Supply[]>; whatsappNumber?: string | null }) {
  const items = supplies.status === "ok" ? supplies.data : [];

  return (
    <section aria-labelledby="itens-prioritarios" className="scroll-mt-24">
      <h3 id="itens-prioritarios" className="text-xl font-bold text-cinza">
        Itens prioritários
      </h3>
      <p className="mt-1 text-sm text-muted">
        Também recebemos doações de itens. Os marcados como urgentes são os que mais fazem falta agora.
      </p>

      {items.length === 0 ? (
        <p className="card mt-4 border-dashed p-6 text-center text-sm text-muted">
          {supplies.status === "ok"
            ? "No momento não há itens na lista. Volte em breve!"
            : "A lista de itens necessários será publicada aqui em breve."}
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((supply) => (
            <li key={supply.id} className={`card flex flex-col p-4 ${supply.is_urgent ? "border-vermelho" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold text-cinza">{supply.name}</h4>
                {supply.is_urgent && (
                  <span className="shrink-0 rounded-full bg-vermelho px-2.5 py-0.5 text-xs font-bold text-cinza">Urgente</span>
                )}
              </div>
              {supply.description && <p className="texto-justificado mt-1 text-sm whitespace-pre-line text-muted">{supply.description}</p>}
              {supply.quantity && (
                <p className="mt-3 text-sm">
                  <span className="text-muted">Quantidade necessária: </span>
                  <strong className="text-rosa-escuro">{supply.quantity}</strong>
                </p>
              )}
              {whatsappNumber && (
                <a
                  href={whatsAppLink(whatsappNumber, supplyMessage(supply.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp mt-4 min-h-11 w-full py-2 text-sm"
                  aria-label={`Quero doar ${supply.name} pelo WhatsApp (abre em nova aba)`}
                >
                  <WhatsAppIcon className="size-4" />
                  Quero doar este item
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {whatsappNumber && (
        <div className="card mt-5 flex flex-col items-center gap-3 bg-rosa-pastel p-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-cinza">Quer doar itens ou tem dúvidas sobre o que levar? Fale com a gente.</p>
          <a
            href={whatsAppLink(whatsappNumber, supplyMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp shrink-0"
          >
            <WhatsAppIcon className="size-5" />
            Combinar doação de itens pelo WhatsApp
          </a>
        </div>
      )}
    </section>
  );
}
