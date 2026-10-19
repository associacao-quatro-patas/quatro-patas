"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState, useTransition } from "react";
import { FormMessage, inputClass } from "@/components/admin/form-ui";
import { MAX_ORIGINAL_BYTES, uploadPetPhoto } from "@/lib/pets/upload";
import { ALT_MAX_LENGTH, type SlotInfo } from "@/lib/site-photos/slots";
import { removeSitePhoto, saveSitePhoto } from "./actions";

type Props = {
  info: SlotInfo;
  current: { url: string; alt: string | null } | null;
  /** false enquanto a migração 006 não foi aplicada. */
  enabled: boolean;
};

/** Um espaço de foto do site: prévia, escolher/trocar, descrição, salvar e remover. */
export function SitePhotoCard(props: Props) {
  // Recriado ao esconder a página (Activity): sem prévias antigas ao voltar.
  const [resetKey, setResetKey] = useState(0);
  useLayoutEffect(() => () => setResetKey((k) => k + 1), []);
  return <SitePhotoCardInner key={`${resetKey}-${props.current?.url ?? "vazio"}`} {...props} />;
}

function SitePhotoCardInner({ info, current, enabled }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [alt, setAlt] = useState(current?.alt ?? "");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setMessage(null);
    if (selected && !selected.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Escolha um arquivo de imagem." });
      event.target.value = "";
      return;
    }
    if (selected && selected.size > MAX_ORIGINAL_BYTES) {
      setMessage({ type: "error", text: "Imagem muito grande (máximo de 20 MB)." });
      event.target.value = "";
      return;
    }
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      try {
        if (!file) {
          setMessage({ type: "error", text: "Escolha uma foto primeiro." });
          return;
        }
        // A foto vai direto do navegador para o bucket (com a sessão do admin).
        const path = await uploadPetPhoto(file);
        const result = await saveSitePhoto(info.slot, path, alt);
        setMessage({ type: result.ok ? "success" : "error", text: result.message });
        if (result.ok) router.refresh();
      } catch (error) {
        setMessage({ type: "error", text: `Falha ao enviar a foto: ${(error as Error).message}` });
      }
    });
  }

  function remove() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await removeSitePhoto(info.slot);
        setMessage({ type: result.ok ? "success" : "error", text: result.message });
        if (result.ok) router.refresh();
      } catch {
        setMessage({ type: "error", text: "Falha de conexão. Tente novamente." });
      }
    });
  }

  const shown = preview ?? current?.url ?? null;

  return (
    <li className="flex flex-col rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold text-muted uppercase">{info.page}</p>
      <h2 className="font-bold text-cinza">{info.label}</h2>
      <p className="text-sm text-muted">{info.where}</p>

      <div
        className={`mt-3 overflow-hidden bg-rosa-pastel ${info.shape === "redonda" ? "mx-auto aspect-square w-40 rounded-full" : "aspect-[4/3] w-full rounded-xl"}`}
      >
        {shown ? (
          // Prévia local (blob:) ou foto atual; <img> simples, sem otimização.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt={preview ? "Prévia da nova foto" : current?.alt ?? info.defaultAlt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-sm text-muted">Usando a ilustração padrão</div>
        )}
      </div>
      {preview && <p className="mt-2 text-center text-xs text-muted">Prévia: só é publicada ao clicar em “Salvar foto”.</p>}

      <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold hover:bg-border/40">
        {current || file ? "Trocar foto" : "Escolher foto"}
        <input type="file" accept="image/*" className="sr-only" onChange={choose} disabled={!enabled || pending} />
      </label>

      <label className="mt-3 block text-sm">
        <span className="font-semibold">Descrição da foto</span>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          maxLength={ALT_MAX_LENGTH}
          placeholder={info.defaultAlt}
          disabled={!enabled || pending}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-muted">Para leitores de tela. Ex.: “Cadela Mel em uma feirinha de adoção”.</span>
      </label>

      {message && (
        <div className="mt-3">
          <FormMessage type={message.type}>{message.text}</FormMessage>
        </div>
      )}

      <div className="mt-4 flex flex-1 flex-wrap items-end gap-2">
        <button
          type="button"
          onClick={save}
          disabled={!enabled || pending || !file}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar foto"}
        </button>
        {current && (
          <button
            type="button"
            onClick={remove}
            disabled={!enabled || pending}
            className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Remover foto
          </button>
        )}
      </div>
    </li>
  );
}
