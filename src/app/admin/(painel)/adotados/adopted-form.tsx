"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useLayoutEffect, useState, type FormEvent } from "react";
import type { Pet, PetAdoption } from "@/types/database";
import { AdoptionFields } from "@/components/admin/adoption-fields";
import { Field, inputClass } from "@/components/admin/form-ui";
import { todayInManaus } from "@/lib/adoptions/validation";
import { LIMITS, SEX_LABELS, SIZE_LABELS, SPECIES_LABELS, petPhotoUrl } from "@/lib/pets/constants";
import { MAX_ORIGINAL_BYTES, uploadPetPhoto } from "@/lib/pets/upload";
import { saveAdoptedPet, type AdoptedFormState } from "./actions";

type Props = { pet?: Pet; adoption?: PetAdoption | null };

function Options({ labels }: { labels: Record<string, string> }) {
  return Object.entries(labels).map(([value, label]) => (
    <option key={value} value={value}>
      {label}
    </option>
  ));
}

/** Recria o formulário ao esconder a página (mesmo motivo do formulário de pets). */
export function AdoptedForm(props: Props) {
  const [resetKey, setResetKey] = useState(0);
  useLayoutEffect(() => () => setResetKey((key) => key + 1), []);
  return <AdoptedFormFields key={resetKey} {...props} />;
}

function AdoptedFormFields({ pet, adoption }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [today] = useState(todayInManaus);

  // Envia a foto (se houver) direto ao Storage e depois chama a Server Action.
  const [state, formAction, pending] = useActionState(
    async (prev: AdoptedFormState, formData: FormData): Promise<AdoptedFormState> => {
      formData.delete("photo");
      if (file) {
        try {
          formData.set("photo_path", await uploadPetPhoto(file));
        } catch (error) {
          return { message: `Falha ao enviar a foto: ${(error as Error).message}` };
        }
      }
      return saveAdoptedPet(pet?.id ?? null, prev, formData);
    },
    {},
  );

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const errors = state.errors ?? {};
  const shownPhoto = preview ?? (pet?.photo_path ? petPhotoUrl(pet.photo_path) : null);

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 pb-12 lg:grid-cols-[320px_1fr]">
      {/* Foto */}
      <div>
        <span className="text-sm font-semibold">Foto do animal</span>
        <div className="mt-1 aspect-square w-full overflow-hidden rounded-xl border border-border bg-border/40">
          {shownPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownPhoto} alt="Prévia da foto" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">Sem foto</div>
          )}
        </div>
        <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold hover:bg-border/40">
          {pet?.photo_path || file ? "Trocar foto" : "Escolher foto"}
          <input type="file" name="photo" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={pending} />
        </label>
        <p className="mt-2 text-xs text-muted">
          {preview ? "Prévia: a foto só é salva ao clicar em “Salvar”." : "A foto aparece na página Pets adotados do site."}
        </p>
        {(fileError || errors.photo) && <p className="mt-2 text-sm text-red-700">{fileError ?? errors.photo}</p>}
      </div>

      {/* Dados */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nome do animal *" error={errors.name}>
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

        <div className="sm:col-span-2">
          <AdoptionFields adoption={adoption} errors={errors} maxDate={today} />
        </div>

        {state.message && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">
            {state.message}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
          <Link
            href="/admin/adotados"
            className="rounded-lg border border-border px-5 py-3 text-center font-semibold hover:bg-border/40"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand px-5 py-3 font-semibold text-brand-foreground disabled:opacity-60"
          >
            {pending ? "Salvando…" : pet ? "Salvar alterações" : "Cadastrar adotado"}
          </button>
        </div>
      </div>
    </form>
  );
}
