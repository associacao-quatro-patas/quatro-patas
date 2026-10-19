import Link from "next/link";
import QRCode from "qrcode";
import type { DonationSettings, PixKeyType } from "@/types/database";
import type { Loaded } from "@/lib/donations/queries";
import { resolvePixDisplay } from "@/lib/donations/pix";
import { ArrowRightIcon, PixIcon } from "@/components/ui/icons";
import { CopyButton } from "./copy-button";

const KEY_TYPE_LABELS: Record<PixKeyType, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  email: "e-mail",
  phone: "celular",
  random: "chave aleatória",
};

/** Dados do Pix prontos para exibir (só dados oficiais cadastrados no painel). */
async function loadPix(settings: Loaded<DonationSettings | null>) {
  const data = settings.status === "ok" ? settings.data : null;
  const pix = resolvePixDisplay(data);
  // SVG gerado no servidor a partir do BR Code (validado em resolvePixDisplay).
  const qrSvg = pix.qrPayload
    ? await QRCode.toString(pix.qrPayload, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 1,
        color: { dark: "#2e2e2e", light: "#ffffff" },
      })
    : null;
  return {
    pix,
    qrSvg,
    data,
    recipient: data?.recipient_name?.trim() || data?.pix_merchant_name?.trim() || null,
    available: Boolean(pix.key || pix.qrPayload),
  };
}

function QrImage({ svg, className = "" }: { svg: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label="QR Code Pix para doação"
      className={`rounded-2xl border border-rosa-claro bg-white p-2 shadow-suave [&>svg]:h-auto [&>svg]:w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function KeyBox({ pixKey, keyType }: { pixKey: string; keyType: PixKeyType | null }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border-2 border-rosa-claro bg-white py-2 pr-2 pl-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">Chave Pix{keyType ? ` (${KEY_TYPE_LABELS[keyType]})` : ""}</p>
        <p className="font-semibold break-all text-cinza select-all">{pixKey}</p>
      </div>
      <CopyButton value={pixKey} variant="icon" label="Copiar chave Pix" />
    </div>
  );
}

/**
 * Bloco "Doe via Pix" (página Doações), como no wireframe: chave com botão de
 * copiar e QR Code. Sem dados oficiais: "disponível em breve".
 */
export async function PixCard({ settings }: { settings: Loaded<DonationSettings | null> }) {
  const { pix, qrSvg, data, recipient, available } = await loadPix(settings);

  return (
    <section aria-labelledby="pix-titulo" className="card bg-rosa-pastel p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="icon-circle">
          <PixIcon className="size-6" />
        </span>
        <div>
          <h2 id="pix-titulo" className="text-2xl font-bold text-cinza">
            Doe via Pix
          </h2>
          <p className="text-muted">É rápido, seguro e ajuda muito os nossos resgatados!</p>
        </div>
      </div>

      {!available ? (
        <p role="status" className="mt-5 rounded-2xl bg-white p-4 text-cinza">
          As doações via Pix estarão disponíveis em breve. Enquanto isso, você pode ajudar com os itens da lista de
          necessidades.
        </p>
      ) : (
        <div className={`mt-5 grid gap-5 ${qrSvg ? "md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8" : ""}`}>
          <div className="grid gap-4">
            {pix.key && <KeyBox pixKey={pix.key} keyType={pix.keyType} />}
            {pix.qrPayload && (
              <div>
                <CopyButton value={pix.qrPayload} label="Copiar Pix Copia e Cola" />
              </div>
            )}
            {recipient && (
              <p className="text-sm text-muted">
                Antes de confirmar, verifique se o recebedor é <strong className="text-cinza">{recipient}</strong>.
              </p>
            )}
            {data?.notes && <p className="texto-justificado text-sm whitespace-pre-line text-muted">{data.notes}</p>}
          </div>

          {qrSvg && (
            <div className="mx-auto text-center md:border-l md:border-rosa-claro md:pl-8">
              <QrImage svg={qrSvg} className="mx-auto w-44" />
              <p className="mt-2 text-sm text-muted">Aponte a câmera do seu celular</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Faixa "Faça uma doação" da página inicial (versão compacta do bloco Pix). */
export async function PixBand({ settings }: { settings: Loaded<DonationSettings | null> }) {
  const { pix, qrSvg, available } = await loadPix(settings);

  return (
    <section aria-labelledby="faixa-doacao" className="card bg-rosa-pastel p-5 sm:p-6">
      <div className="grid items-center gap-5 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.1fr)]">
        {qrSvg ? (
          <QrImage svg={qrSvg} className="mx-auto w-32 md:mx-0" />
        ) : (
          <span className="icon-circle mx-auto size-16 md:mx-0 [&>svg]:size-8">
            <PixIcon />
          </span>
        )}
        <div className="text-center md:border-r md:border-rosa-claro md:pr-5 md:text-left">
          <h2 id="faixa-doacao" className="text-2xl font-bold text-cinza">
            Faça uma doação
          </h2>
          <p className="text-muted">Sua ajuda faz toda a diferença!</p>
        </div>
        {available && pix.key ? (
          <KeyBox pixKey={pix.key} keyType={pix.keyType} />
        ) : (
          <div className="text-center md:text-left">
            <p className="text-sm text-cinza">
              {available ? "Use o QR Code ao lado ou veja os detalhes." : "As doações via Pix estarão disponíveis em breve."}
            </p>
            <Link href="/doacoes" className="btn-secondary mt-3">
              Outras formas de ajudar <ArrowRightIcon className="size-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
