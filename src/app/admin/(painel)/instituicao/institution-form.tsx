"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Field, FormMessage, inputClass } from "@/components/admin/form-ui";
import { aboutContent as fallback } from "@/content/sobre";
import { INSTITUTION_LIMITS as L } from "@/lib/institution/content";
import type { InstitutionContent, NamedItem } from "@/types/database";
import { saveInstitutionContent, type InstitutionFormState } from "./actions";

/**
 * Recriado do zero quando o Next esconde a página ao navegar (Activity), para
 * não reaparecerem edições não salvas.
 */
export function InstitutionForm({ content }: { content: InstitutionContent | null }) {
  const [resetKey, setResetKey] = useState(0);
  useLayoutEffect(() => () => setResetKey((key) => key + 1), []);
  return <InstitutionFormInner key={resetKey} content={content} />;
}

function SourceBadge({ saved }: { saved: boolean }) {
  return saved ? (
    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">Cadastrado</span>
  ) : (
    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
      Usando texto provisório
    </span>
  );
}

function InstitutionFormInner({ content }: { content: InstitutionContent | null }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<InstitutionFormState, FormData>(saveInstitutionContent, {});

  // Depois de salvar, recarrega os dados gravados (o formulário é recriado
  // pela key abaixo, com os valores já normalizados pelo servidor).
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [state, router]);

  // onSubmit preserva o que foi digitado quando o servidor devolve erros.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const e = state.errors ?? {};

  return (
    <form key={content?.updated_at ?? "vazio"} onSubmit={handleSubmit} className="grid gap-6 pb-12">
      <fieldset className="grid gap-5 rounded-2xl border border-border bg-surface p-5">
        <legend className="px-1 font-bold">Textos da página Sobre</legend>
        <TextSection
          name="intro_text"
          label="Apresentação"
          saved={content?.intro_text ?? null}
          provisional={fallback.intro.text}
          max={L.intro}
          rows={3}
          error={e.intro_text}
        />
        <TextSection
          name="history_text"
          label="Nossa história"
          saved={content?.history_text ?? null}
          provisional={null}
          emptyNote={`Sem história cadastrada, o site mostra: “${fallback.history.pendingMessage}”`}
          hint="Cada linha vira um parágrafo."
          max={L.history}
          rows={8}
          error={e.history_text}
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <TextSection
            name="mission_text"
            label="Missão"
            saved={content?.mission_text ?? null}
            provisional={fallback.mission.text}
            max={L.mission}
            rows={4}
            error={e.mission_text}
          />
          <TextSection
            name="vision_text"
            label="Visão"
            saved={content?.vision_text ?? null}
            provisional={fallback.vision.text}
            max={L.vision}
            rows={4}
            error={e.vision_text}
          />
        </div>
        <ItemsEditor
          prefix="values"
          label="Valores"
          saved={content?.values_items ?? null}
          provisional={fallback.values.items}
          limits={L.values}
          error={e.values_items}
        />
        <TextSection
          name="work_intro"
          label="Introdução de “Nosso trabalho”"
          saved={content?.work_intro ?? null}
          provisional={fallback.work.intro}
          max={L.workIntro}
          rows={2}
          error={e.work_intro}
        />
        <ItemsEditor
          prefix="work"
          label="Frentes de trabalho"
          saved={content?.work_items ?? null}
          provisional={fallback.work.items}
          limits={L.work}
          error={e.work_items}
        />
      </fieldset>

      <fieldset className="grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
        <legend className="px-1 font-bold">Contatos (opcionais)</legend>
        <p className="text-sm text-muted sm:col-span-2">
          Só aparecem na página Sobre se forem preenchidos. Use apenas canais oficiais da instituição. O WhatsApp continua
          sendo configurado no servidor (variável INSTITUTION_WHATSAPP).
        </p>
        <Field label="E-mail" error={e.contact_email}>
          <input
            name="contact_email"
            type="email"
            defaultValue={content?.contact_email ?? ""}
            maxLength={L.email}
            autoComplete="off"
            className={inputClass}
          />
        </Field>
        <Field label="Instagram" error={e.instagram_url} hint="@perfil ou o link do perfil.">
          <input
            name="instagram_url"
            defaultValue={content?.instagram_url ?? ""}
            maxLength={L.instagram}
            autoComplete="off"
            className={inputClass}
          />
        </Field>
        <Field label="Telefone" error={e.phone} hint="Ex.: (11) 3333-4444">
          <input name="phone" type="tel" defaultValue={content?.phone ?? ""} maxLength={30} className={inputClass} />
        </Field>
        <Field label="Endereço" error={e.address}>
          <textarea name="address" defaultValue={content?.address ?? ""} maxLength={L.address} rows={2} className={inputClass} />
        </Field>
      </fieldset>

      {state.message && <FormMessage type={state.status === "success" ? "success" : "error"}>{state.message}</FormMessage>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/sobre" target="_blank" className="text-sm font-semibold text-brand hover:underline">
          Ver página Sobre ↗
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-5 py-3 font-semibold text-brand-foreground disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

function TextSection({
  name,
  label,
  saved,
  provisional,
  emptyNote,
  hint,
  max,
  rows,
  error,
}: {
  name: string;
  label: string;
  saved: string | null;
  provisional: string | null;
  emptyNote?: string;
  hint?: string;
  max: number;
  rows: number;
  error?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [length, setLength] = useState(saved?.length ?? 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={name} className="text-sm font-semibold">
          {label}
        </label>
        <SourceBadge saved={saved !== null} />
      </div>
      <textarea
        ref={ref}
        id={name}
        name={name}
        defaultValue={saved ?? ""}
        maxLength={max}
        rows={rows}
        onChange={(ev) => setLength(ev.target.value.length)}
        className={inputClass}
      />
      <div className="mt-1 flex flex-wrap items-start justify-between gap-2 text-xs text-muted">
        <span>
          {hint ? `${hint} ` : ""}
          {saved === null &&
            (provisional ? (
              <>
                Vazio = o site usa o texto provisório: <em>“{provisional}”</em>{" "}
                <button
                  type="button"
                  className="font-semibold text-brand hover:underline"
                  onClick={() => {
                    if (ref.current) {
                      ref.current.value = provisional;
                      setLength(provisional.length);
                      ref.current.focus();
                    }
                  }}
                >
                  Copiar para editar
                </button>
              </>
            ) : (
              emptyNote
            ))}
        </span>
        <span className="shrink-0 tabular-nums">
          {length}/{max}
        </span>
      </div>
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}

type Row = NamedItem & { key: number };

// Chave estável para cada linha da lista (identifica a linha ao remover).
let rowKeyCounter = 0;
const newRowKey = () => ++rowKeyCounter;
const withKeys = (items: readonly NamedItem[]): Row[] => items.map((item) => ({ ...item, key: newRowKey() }));

function ItemsEditor({
  prefix,
  label,
  saved,
  provisional,
  limits,
  error,
}: {
  prefix: "values" | "work";
  label: string;
  saved: NamedItem[] | null;
  provisional: readonly NamedItem[];
  limits: { maxItems: number; name: number; text: number };
  error?: string;
}) {
  const [rows, setRows] = useState<Row[]>(() => withKeys(saved ?? []));

  const update = (key: number, field: "name" | "text", value: string) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: value } : row)));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <SourceBadge saved={saved !== null} />
      </div>

      {rows.length === 0 && (
        <div className="mt-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted">
          Lista vazia: o site usa os itens provisórios ({provisional.map((i) => i.name).join(", ")}).{" "}
          <button
            type="button"
            className="font-semibold text-brand hover:underline"
            onClick={() => setRows(withKeys(provisional))}
          >
            Copiar para editar
          </button>
        </div>
      )}

      <ol className="mt-2 grid gap-3">
        {rows.map((row, i) => (
          <li key={row.key} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-start">
            <input
              name={`${prefix}_name`}
              value={row.name}
              onChange={(ev) => update(row.key, "name", ev.target.value)}
              maxLength={limits.name}
              placeholder={`Nome do item ${i + 1}`}
              aria-label={`${label}: nome do item ${i + 1}`}
              className={`${inputClass} mt-0`}
            />
            <textarea
              name={`${prefix}_text`}
              value={row.text}
              onChange={(ev) => update(row.key, "text", ev.target.value)}
              maxLength={limits.text}
              rows={2}
              placeholder="Descrição"
              aria-label={`${label}: descrição do item ${i + 1}`}
              className={`${inputClass} mt-0`}
            />
            <button
              type="button"
              onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Remover
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
        <button
          type="button"
          disabled={rows.length >= limits.maxItems}
          onClick={() => setRows((current) => [...current, { name: "", text: "", key: newRowKey() }])}
          className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-border/40 disabled:opacity-50"
        >
          + Adicionar item
        </button>
        <span>
          {rows.length}/{limits.maxItems} itens. Remover todos e salvar = volta aos itens provisórios.
        </span>
      </div>
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}
