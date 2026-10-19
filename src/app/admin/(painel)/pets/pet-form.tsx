"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useLayoutEffect, useState, type FormEvent } from "react";
import type { Pet } from "@/types/database";
import {
  LIMITS,
  SEX_LABELS,
  SIZE_LABELS,
  SPECIES_LABELS,
  STATUS_LABELS,
  petPhotoUrl,
} from "@/lib/pets/constants";
import { MAX_ORIGINAL_BYTES, uploadPetPhoto } from "@/lib/pets/upload";
import { savePet, type PetFormState } from "./actions";

const inputClass =
  "mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-sm text-red-700">{error}</span>}
    </label>
  );
}

function Options({ labels }: { labels: Record<string, string> }) {
  return Object.entries(labels).map(([value, label]) => (
    <option key={value} value={value}>
      {label}
    </option>
  ));
}

/**
 * Com Cache Components, o Next não desmonta a página ao navegar: ele a esconde
 * com <Activity> e a restaura ao voltar, com tudo o que estava digitado.
 * Para um formulário de cadastro isso deixa rascunhos antigos na tela, então
 * recriamos o formulário do zero sempre que a página é escondida (inclusive
 * depois de salvar, quando a Server Action redireciona para a lista).
 * Erros de validação NÃO escondem a página, então os dados digitados ficam.
 */
export function PetForm({ pet }: { pet?: Pet }) {
  const [resetKey, setResetKey] = useState(0);
  useLayoutEffect(() => () => setResetKey((key) => key + 1), []);
  return <PetFormFields key={resetKey} pet={pet} />;
}

function PetFormFields({ pet }: { pet?: Pet }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Envia a foto (se houver) direto ao Storage e depois chama a Server Action.
  const [state, formAction, pending] = useActionState(
    async (prev: PetFormState, formData: FormData): Promise<PetFormState> => {
      formData.delete("photo");
      if (file) {
        try {
          formData.set("photo_path", await uploadPetPhoto(file));
        } catch (error) {
          return { message: `Falha ao enviar a foto: ${(error as Error).message}` };
        }
      }
      return savePet(pet?.id ?? null, prev, formData);
    },
    {},
  );

  // Libera a memória da prévia anterior.
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFileError(null);
    if (selected && !selected.type.startsWith("image/")) {
      setFileError("Escolha um arquivo de imagem.");
      event.target.value = "";
      return;
    }
    if (selected && selected.size > MAX_ORIGINAL_BYTES) {
      setFileError("Imagem muito grande (máximo de 20 MB).");
      event.target.value = "";
      return;
    }
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  // onSubmit (em vez de <form action>) evita que o React limpe os campos
  // quando o servidor devolve erros de validação.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const errors = state.errors ?? {};
  const currentPhoto = pet?.photo_path ? petPhotoUrl(pet.photo_path) : null;
  const shownPhoto = preview ?? currentPhoto;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 pb-12 lg:grid-cols-[320px_1fr]">
      {/* Foto */}
      <div>
        <span className="text-sm font-semibold">Foto</span>
        <div className="mt-1 aspect-square w-full overflow-hidden rounded-xl border border-border bg-border/40">
          {shownPhoto ? (
            // Prévia local (blob:) ou foto atual; <img> simples porque não precisa de otimização.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownPhoto} alt="Prévia da foto" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">Sem foto</div>
          )}
        </div>
        <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold hover:bg-border/40">
          {pet?.photo_path || file ? "Trocar foto" : "Escolher foto"}
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            disabled={pending}
          />
        </label>
        {preview && (
          <p className="mt-2 text-xs text-muted">Prévia: a foto só é salva ao clicar em “Salvar”.</p>
        )}
        {(fileError || errors.photo) && (
          <p className="mt-2 text-sm text-red-700">{fileError ?? errors.photo}</p>
        )}
      </div>

      {/* Dados */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nome *" error={errors.name}>
            <input name="name" defaultValue={pet?.name} required maxLength={LIMITS.name} className={inputClass} />
          </Field>
        </div>

        <Field label="Espécie *" error={errors.species}>
          <select name="species" defaultValue={pet?.species ?? ""} required className={inputClass}>
            <option value="" disabled>
              Selecione
            </option>
            <Options labels={SPECIES_LABELS} />
          </select>
        </Field>

        <Field label="Sexo *" error={errors.sex}>
          <select name="sex" defaultValue={pet?.sex ?? ""} required className={inputClass}>
            <option value="" disabled>
              Selecione
            </option>
            <Options labels={SEX_LABELS} />
          </select>
        </Field>

        <Field label="Porte *" error={errors.size}>
          <select name="size" defaultValue={pet?.size ?? ""} required className={inputClass}>
            <option value="" disabled>
              Selecione
            </option>
            <Options labels={SIZE_LABELS} />
          </select>
        </Field>

        <Field label="Idade" error={errors.age} hint="Ex.: 2 anos, filhote, cerca de 6 meses">
          <input name="age" defaultValue={pet?.age ?? ""} maxLength={LIMITS.age} className={inputClass} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Status *" error={errors.status} hint="Animais adotados não aparecem no site.">
            <select name="status" defaultValue={pet?.status ?? "available"} required className={inputClass}>
              <Options labels={STATUS_LABELS} />
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3 sm:col-span-2">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="is_neutered" defaultChecked={pet?.is_neutered} className="size-5 accent-brand" />
            <span>Castrado</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="is_vaccinated" defaultChecked={pet?.is_vaccinated} className="size-5 accent-brand" />
            <span>Vacinado</span>
          </label>
        </div>

        <div className="sm:col-span-2">
          <Field label="Descrição" error={errors.description} hint="Temperamento, cuidados, com quem se dá bem.">
            <textarea
              name="description"
              defaultValue={pet?.description ?? ""}
              maxLength={LIMITS.description}
              rows={4}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="História" error={errors.story} hint="Como o animal chegou à instituição.">
            <textarea
              name="story"
              defaultValue={pet?.story ?? ""}
              maxLength={LIMITS.story}
              rows={5}
              className={inputClass}
            />
          </Field>
        </div>

        {state.message && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">
            {state.message}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
          <Link
            href="/admin/pets"
            className="rounded-lg border border-border px-5 py-3 text-center font-semibold hover:bg-border/40"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand px-5 py-3 font-semibold text-brand-foreground disabled:opacity-60"
          >
            {pending ? "Salvando…" : pet ? "Salvar alterações" : "Cadastrar animal"}
          </button>
        </div>
      </div>
    </form>
  );
}
