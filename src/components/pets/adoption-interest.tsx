import { adoptionInterestMessage, getInstitutionWhatsApp, whatsAppLink } from "@/lib/whatsapp";

type Props = {
  petName: string;
  petSlug: string;
  inProgress: boolean;
};

/**
 * Botão "Tenho interesse": abre o WhatsApp da instituição com uma mensagem
 * pronta. Sem número configurado (ou com número inválido), mostra um aviso
 * em vez de gerar um link quebrado.
 */
export function AdoptionInterest({ petName, petSlug, inProgress }: Props) {
  const whatsapp = getInstitutionWhatsApp();

  if (whatsapp.status !== "ok") {
    return (
      <p role="status" className="mt-5 rounded-2xl bg-amarelo/40 p-4 text-sm text-cinza">
        {whatsapp.status === "missing"
          ? "O contato por WhatsApp ainda não foi configurado. Em breve você poderá demonstrar interesse por aqui."
          : "O número de WhatsApp da instituição está configurado em um formato inválido. Por favor, tente novamente mais tarde."}
      </p>
    );
  }

  // O link do perfil só entra na mensagem quando o site tem endereço público
  // configurado (evita mandar "localhost" para a instituição).
  const publicSite = process.env.NEXT_PUBLIC_SITE_URL;
  const petUrl =
    publicSite && !/localhost|127\.0\.0\.1/.test(publicSite)
      ? `${publicSite.replace(/\/$/, "")}/adocao/${petSlug}`
      : undefined;

  return (
    <div className="mt-5">
      <a
        href={whatsAppLink(whatsapp.number, adoptionInterestMessage(petName, petUrl))}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp w-full sm:w-auto"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
        </svg>
        Quero adotar pelo WhatsApp
      </a>
      <p className="mt-2 text-xs text-muted">
        Abre o WhatsApp da instituição com uma mensagem sobre {petName}.
        {inProgress && " Este animal já está em processo de adoção, mas você ainda pode perguntar sobre ele."}
      </p>
    </div>
  );
}
