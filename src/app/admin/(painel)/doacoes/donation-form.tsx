"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useLayoutEffect, useState, type FormEvent } from "react";
import type { DonationSettings, PixKeyType } from "@/types/database";
import { Field, FormMessage, inputClass } from "@/components/admin/form-ui";
import { resolvePixDisplay } from "@/lib/donations/pix";
import { DONATION_LIMITS, PIX_KEY_TYPE_OPTIONS } from "@/lib/donations/validation";
import { saveDonationSettings, type DonationFormState } from "./actions";

/**
 * Recriado do zero quando o Next esconde a página ao navegar (Activity),
 * para não reaparecerem edições não salvas. Depois de salvar, os campos são
 * recarregados com os valores gravados (já normalizados pelo servidor).
 */
export function DonationForm({ settings }: { settings: DonationSettings | null }) {
  const [resetKey, setResetKey] = useState(0);
  useLayoutEffect(() => () => setResetKey((key) => key + 1), []);
  return <DonationFormInner key={resetKey} settings={settings} />;
}

const SITE_SHOWS: Record<string, string> = {
  official: "QR Code a partir do Pix Copia e Cola oficial, além da chave (se houver).",
  generated: "QR Code gerado a partir da chave, do nome do estabelecimento e da cidade.",
  keyOnly: "Apenas a chave com botão de copiar (sem QR Code: faltam nome do estabelecimento e cidade, ou o Copia e Cola).",
  none: "A mensagem “As doações via Pix estarão disponíveis em breve”.",
};

function DonationFormInner({ settings }: { settings: DonationSettings | null }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<DonationFormState, FormData>(saveDonationSettings, {});
  const [keyType, setKeyType] = useState<PixKeyType | "">(settings?.pix_key_type ?? "");

  // Recarrega os dados do servidor depois de salvar com sucesso.
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [state, router]);

  // onSubmit (em vez de <form action>) evita que o React limpe os campos
  // quando o servidor devolve erros de validação.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const errors = state.errors ?? {};
  const display = resolvePixDisplay(settings);
  const shows = display.qrSource ?? (display.key ? "keyOnly" : "none");
  const placeholder = PIX_KEY_TYPE_OPTIONS.find((o) => o.value === keyType)?.placeholder ?? "";

  return (
    <div className="grid gap-6 pb-12">
      <div className="rounded-xl border border-border bg-surface p-4 text-sm">
        <p className="font-semibold">Hoje a página de Doações mostra:</p>
        <p className="mt-1 text-muted">{SITE_SHOWS[shows]}</p>
        <Link href="/doacoes" target="_blank" className="mt-2 inline-block font-semibold text-brand hover:underline">
          Abrir página pública ↗
        </Link>
      </div>

      {/* key: ao recarregar após salvar, os campos assumem os valores gravados. */}
      <form key={settings?.updated_at ?? "novo"} onSubmit={handleSubmit} className="grid gap-6">
        <fieldset className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
          <legend className="px-1 font-bold">Chave Pix</legend>

          <Field label="Tipo da chave" error={errors.pix_key_type}>
            <select
              name="pix_key_type"
              value={keyType}
              onChange={(e) => setKeyType(e.target.value as PixKeyType | "")}
              className={inputClass}
            >
              <option value="">Sem chave Pix</option>
              {PIX_KEY_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Chave Pix"
            error={errors.pix_key}
            hint={keyType ? "Pode digitar com pontuação: o sistema salva no formato oficial." : "Escolha o tipo primeiro."}
          >
            <input
              name="pix_key"
              defaultValue={settings?.pix_key ?? ""}
              placeholder={placeholder}
              disabled={!keyType}
              autoComplete="off"
              className={`${inputClass} disabled:opacity-60`}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field
              label="Nome do destinatário"
              error={errors.recipient_name}
              hint="Exibido no site para a pessoa conferir no app do banco antes de confirmar."
            >
              <input
                name="recipient_name"
                defaultValue={settings?.recipient_name ?? ""}
                maxLength={DONATION_LIMITS.recipientName}
                className={inputClass}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
          <legend className="px-1 font-bold">QR Code</legend>
          <p className="text-sm text-muted sm:col-span-2">
            Preencha <strong>uma</strong> das opções. Se as duas estiverem preenchidas, o site usa o Copia e Cola.
          </p>

          <p className="text-sm font-semibold sm:col-span-2">Opção 1 · gerar a partir da chave</p>
          <Field
            label="Nome do estabelecimento"
            error={errors.pix_merchant_name}
            hint={`Como está no cadastro do banco. Máx. ${DONATION_LIMITS.merchantName} caracteres.`}
          >
            <input
              name="pix_merchant_name"
              defaultValue={settings?.pix_merchant_name ?? ""}
              maxLength={DONATION_LIMITS.merchantName}
              className={inputClass}
            />
          </Field>
          <Field
            label="Cidade"
            error={errors.pix_merchant_city}
            hint={`Máx. ${DONATION_LIMITS.merchantCity} caracteres.`}
          >
            <input
              name="pix_merchant_city"
              defaultValue={settings?.pix_merchant_city ?? ""}
              maxLength={DONATION_LIMITS.merchantCity}
              className={inputClass}
            />
          </Field>

          <p className="text-sm font-semibold sm:col-span-2">Opção 2 · código fornecido pelo banco</p>
          <div className="sm:col-span-2">
            <Field
              label="Pix Copia e Cola"
              error={errors.pix_copy_paste}
              hint="Cole o código de um QR Code estático gerado no app ou internet banking da instituição. Ele é conferido antes de salvar."
            >
              <textarea
                name="pix_copy_paste"
                defaultValue={settings?.pix_copy_paste ?? ""}
                rows={3}
                spellCheck={false}
                autoComplete="off"
                className={`${inputClass} font-mono text-sm break-all`}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="grid gap-4 rounded-xl border border-border bg-surface p-4">
          <legend className="px-1 font-bold">Observações</legend>
          <Field
            label="Observações para quem vai doar"
            error={errors.notes}
            hint={`Aparece na página pública. Não coloque informações internas. Máx. ${DONATION_LIMITS.notes} caracteres.`}
          >
            <textarea
              name="notes"
              defaultValue={settings?.notes ?? ""}
              maxLength={DONATION_LIMITS.notes}
              rows={3}
              className={inputClass}
            />
          </Field>
        </fieldset>

        {state.message && <FormMessage type={state.status === "success" ? "success" : "error"}>{state.message}</FormMessage>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand px-5 py-3 font-semibold text-brand-foreground disabled:opacity-60 sm:w-auto"
          >
            {pending ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
