"use client";

import Link from "next/link";
import { startTransition, useActionState, useLayoutEffect, useState, type FormEvent } from "react";
import type { Supply } from "@/types/database";
import { Checkbox, Field, FormMessage, inputClass } from "@/components/admin/form-ui";
import { SUPPLY_LIMITS } from "@/lib/donations/validation";
import { saveSupply, type SupplyFormState } from "./actions";

/** Recriado ao esconder a página (Activity): um novo cadastro sempre começa vazio. */
export function SupplyForm({ supply }: { supply?: Supply }) {
  const [resetKey, setResetKey] = useState(0);
  useLayoutEffect(() => () => setResetKey((key) => key + 1), []);
  return <SupplyFormFields key={resetKey} supply={supply} />;
}

function SupplyFormFields({ supply }: { supply?: Supply }) {
  const [state, formAction, pending] = useActionState<SupplyFormState, FormData>(
    saveSupply.bind(null, supply?.id ?? null),
    {},
  );

  // onSubmit preserva os campos quando o servidor devolve erros de validação.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const errors = state.errors ?? {};

  return (
    <form onSubmit={handleSubmit} className="grid max-w-2xl gap-4 pb-12 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Nome *" error={errors.name} hint="Ex.: Ração para cães adultos, Sachê para gatos, Água sanitária.">
          <input name="name" defaultValue={supply?.name} required maxLength={SUPPLY_LIMITS.name} className={inputClass} />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <Field label="Descrição" error={errors.description} hint="Detalhes que ajudam quem vai doar (marca, tamanho, tipo).">
          <textarea
            name="description"
            defaultValue={supply?.description ?? ""}
            maxLength={SUPPLY_LIMITS.description}
            rows={3}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Quantidade ou necessidade" error={errors.quantity} hint="Ex.: 10 kg, 20 unidades, sempre bem-vindo.">
        <input name="quantity" defaultValue={supply?.quantity ?? ""} maxLength={SUPPLY_LIMITS.quantity} className={inputClass} />
      </Field>

      <Field label="Ordem de exibição" error={errors.sort_order} hint="Menor aparece primeiro (urgentes sempre no topo).">
        <input
          name="sort_order"
          type="number"
          inputMode="numeric"
          min={0}
          max={SUPPLY_LIMITS.sortOrder}
          step={1}
          defaultValue={supply?.sort_order ?? 0}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
        <Checkbox name="is_urgent" label="Urgente" defaultChecked={supply?.is_urgent} hint="Destacado e listado primeiro." />
        <Checkbox
          name="is_active"
          label="Ativo (visível no site)"
          defaultChecked={supply?.is_active ?? true}
          hint="Desmarque para ocultar sem excluir."
        />
      </div>

      {state.message && (
        <div className="sm:col-span-2">
          <FormMessage type="error">{state.message}</FormMessage>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
        <Link
          href="/admin/insumos"
          className="rounded-lg border border-border px-5 py-3 text-center font-semibold hover:bg-border/40"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-5 py-3 font-semibold text-brand-foreground disabled:opacity-60"
        >
          {pending ? "Salvando…" : supply ? "Salvar alterações" : "Adicionar insumo"}
        </button>
      </div>
    </form>
  );
}
