"use client";

import { Children, useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type CarouselProps = {
  /** Nome acessível do carrossel (ex.: "Destaques"). */
  label: string;
  children: ReactNode;
  /** Largura de cada slide (classes Tailwind), ex.: "basis-full" ou "basis-[80%] md:basis-1/3". */
  itemClassName?: string;
  className?: string;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Carrossel acessível baseado em rolagem com "snap": funciona com toque,
 * mouse, setas na tela e setas do teclado. Sem rotação automática (WCAG 2.2.2)
 * e sem animação quando o usuário prefere movimento reduzido.
 */
export function Carousel({ label, children, itemClassName = "basis-full", className = "" }: CarouselProps) {
  const track = useRef<HTMLUListElement>(null);
  const slides = Children.toArray(children);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const total = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
    setPages(total);
    setPage(Math.min(total - 1, Math.round(el.scrollLeft / el.clientWidth)));
  }, []);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, slides.length]);

  const goTo = (target: number) => {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(pages - 1, target));
    el.scrollTo({ left: next * el.clientWidth, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(page + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(page - 1);
    }
  };

  const arrow =
    "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-rosa-claro bg-white text-rosa-escuro shadow-suave transition-opacity hover:bg-rosa-pastel disabled:pointer-events-none disabled:opacity-0 sm:inline-flex";

  return (
    <section aria-roledescription="carrossel" aria-label={label} className={`relative ${className}`}>
      <div className="relative">
        <button type="button" onClick={() => goTo(page - 1)} disabled={page === 0} aria-label="Anterior" className={`${arrow} left-2`}>
          <ChevronLeftIcon />
        </button>
        <ul
          ref={track}
          tabIndex={0}
          onScroll={measure}
          onKeyDown={onKeyDown}
          aria-label={`${label}: use as setas do teclado para navegar`}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto rounded-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, i) => (
            <li
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${slides.length}`}
              className={`shrink-0 snap-start ${itemClassName}`}
            >
              {slide}
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => goTo(page + 1)} disabled={page >= pages - 1} aria-label="Próximo" className={`${arrow} right-2`}>
          <ChevronRightIcon />
        </button>
      </div>

      {pages > 1 && (
        <div className="mt-3 flex justify-center gap-1">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir para a página ${i + 1} de ${pages}`}
              aria-current={i === page ? "true" : undefined}
              className="inline-flex size-6 items-center justify-center"
            >
              <span className={`block h-2.5 rounded-full transition-all ${i === page ? "w-6 bg-rosa" : "w-2.5 bg-rosa-claro"}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
