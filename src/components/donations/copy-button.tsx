"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";

/** Copia via API moderna; se o navegador bloquear, usa o método antigo. */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  /** "button": pílula com texto · "icon": só o ícone (dentro da caixa da chave). */
  variant?: "button" | "icon";
};

export function CopyButton({ value, label = "Copiar chave", copiedLabel = "Copiado!", variant = "button" }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleClick() {
    const ok = await copyText(value);
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2500);
  }

  const copied = state === "copied";

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label={copied ? copiedLabel : label}
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors ${
            copied ? "bg-verde text-cinza" : "bg-white text-rosa-escuro hover:bg-rosa-pastel"
          }`}
        >
          {copied ? <CheckIcon className="size-5" /> : <CopyIcon className="size-5" />}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={copied ? "btn-whatsapp w-full sm:w-auto" : "btn-primary w-full sm:w-auto"}
        >
          {copied ? <CheckIcon className="size-5" /> : <CopyIcon className="size-5" />}
          {copied ? copiedLabel : label}
        </button>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Copiado para a área de transferência." : ""}
      </span>
      {state === "failed" && (
        <p className="mt-2 text-sm text-cinza">Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.</p>
      )}
    </>
  );
}
