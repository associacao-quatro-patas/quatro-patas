"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState, useTransition } from "react";
import { deleteSupply } from "./actions";

/** Mesma confirmação na página usada para os pets (sem window.confirm). */
export function DeleteSupplyButton({ supplyId, supplyName }: { supplyId: string; supplyName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useLayoutEffect(
    () => () => {
      setConfirming(false);
      setError(null);
    },
    [],
  );

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteSupply(supplyId);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setConfirming(false);
        router.replace("/admin/insumos?status=excluido");
        router.refresh();
      } catch {
        setError("Falha de conexão ao excluir. Verifique a internet e tente novamente.");
      }
    });
  }

  if (!confirming) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
        >
          Excluir
        </button>
        {error && (
          <p role="alert" className="basis-full text-sm text-red-700">
            {error}
          </p>
        )}
      </>
    );
  }

  return (
    <div role="alertdialog" aria-label={`Confirmar exclusão de ${supplyName}`} className="basis-full rounded-lg border border-red-200 bg-red-50 p-3">
      <p className="text-sm text-red-900">
        Excluir <strong>{supplyName}</strong>? Para só tirar do site, prefira desmarcar “Ativo” na edição.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Excluindo…" : "Sim, excluir"}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          disabled={pending}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
