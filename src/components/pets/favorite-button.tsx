"use client";

import { useEffect, useState } from "react";
import { HeartIcon, HeartOutlineIcon } from "@/components/ui/icons";

const STORAGE_KEY = "4patas:favoritos";

function readFavorites(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Coração para favoritar um animal. Fica salvo só neste navegador (não é
 * enviado a ninguém). Se o armazenamento estiver bloqueado, funciona até
 * recarregar a página.
 */
export function FavoriteButton({ petId, petName }: { petId: string; petName: string }) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    // Sincroniza com o armazenamento do navegador depois de montar (evita
    // diferença entre o HTML do servidor e o do navegador).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorite(readFavorites().includes(petId));
  }, [petId]);

  function toggle() {
    const next = !favorite;
    setFavorite(next);
    try {
      const list = readFavorites().filter((id) => id !== petId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next ? [...list, petId] : list));
    } catch {
      // armazenamento indisponível: mantém só na tela
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={favorite}
      aria-label={favorite ? `Remover ${petName} dos favoritos` : `Favoritar ${petName}`}
      className="relative z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/95 text-rosa shadow-suave transition-transform hover:scale-105"
    >
      {favorite ? <HeartIcon className="size-6" /> : <HeartOutlineIcon className="size-6" />}
    </button>
  );
}
