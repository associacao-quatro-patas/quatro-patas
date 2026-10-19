"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState, useTransition } from "react";
import { deletePet } from "./actions";

/**
 * Exclusão em duas etapas com confirmação NA PRÓPRIA PÁGINA.
 * Não usamos window.confirm(): navegadores embutidos (como o do app Claude)
 * e alguns navegadores móveis bloqueiam caixas nativas e ela devolve `false`
 * na hora, sem mostrar nada, e o botão parecia "não funcionar".
 */
export function DeletePetButton({ petId, petName }: { petId: string; petName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // A lista fica guardada (escondida) ao navegar; ao voltar, a confirmação
  // e mensagens antigas não devem continuar abertas.
  useLayoutEffect(
    () => () => {
      setConfirming(false);
      setError(null);
      setWarning(null);
    },
    [],
  );

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deletePet(petId);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        if (result.warning) {
          // Mostra o aviso na tela; a lista é atualizada quando o usuário fechar.
          setWarning(result.warning);
          return;
        }
        setConfirming(false);
        router.refresh();
      } catch {
        setError("Falha de conexão ao excluir. Verifique a internet e tente novamente.");
      }
    });
  }

  if (warning) {
    return (
      <div role="status" className="basis-full rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <p>{warning}</p>
        <button
          type="button"
          onClick={() => {
            setWarning(null);
            setConfirming(false);
            router.refresh();
          }}
          className="mt-2 rounded-lg border border-amber-300 bg-surface px-3 py-1.5 font-semibold"
        >
          OK
        </button>
      </div>
    );
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
    <div
      role="alertdialog"
      aria-label={`Confirmar exclusão de ${petName}`}
      className="basis-full rounded-lg border border-red-200 bg-red-50 p-3"
    >
      <p className="text-sm text-red-900">
        Excluir <strong>{petName}</strong>? A foto também será apagada. Esta ação não pode ser desfeita.
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
