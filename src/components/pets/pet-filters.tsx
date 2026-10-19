import Link from "next/link";
import { CheckIcon, CloseIcon, SearchIcon } from "@/components/ui/icons";
import {
  FILTER_GROUP_LABELS,
  FILTER_OPTIONS,
  FILTER_PARAMS,
  SEARCH_MAX_LENGTH,
  TOGGLE_LABELS,
  buildAdoptionHref,
  filterHref,
  hasActiveFilters,
  toggleHref,
  type PetFilters,
} from "@/lib/pets/filters";

const chip =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 text-sm font-semibold transition-colors";
// Rosa Escuro: texto branco de 14px precisa de 4,5:1 (Rosa Principal dá 4,3:1).
const chipOn = "border-rosa-escuro bg-rosa-escuro text-white";
const chipOff = "border-rosa-claro bg-white text-cinza hover:border-rosa";

/**
 * Filtros como links (sem JavaScript): cada clique muda a URL e o servidor
 * devolve a lista filtrada. Grupos se combinam; clicar na opção ativa a desliga.
 */
export function PetFiltersBar({ filters }: { filters: PetFilters }) {
  const groups = Object.keys(FILTER_OPTIONS) as (keyof typeof FILTER_OPTIONS)[];
  const toggles = Object.keys(TOGGLE_LABELS) as (keyof typeof TOGGLE_LABELS)[];

  return (
    <nav aria-label="Filtros de adoção" className="card mt-6 grid gap-4 p-4 sm:p-5">
      {/* Busca por nome (a mesma do ícone do cabeçalho) */}
      <form action="/adocao" role="search" className="flex gap-2">
        {/* mantém os demais filtros ao buscar */}
        {groups.map((k) => filters[k] && <input key={k} type="hidden" name={FILTER_PARAMS[k]} value={filters[k]} />)}
        {toggles.map((k) => filters[k] && <input key={k} type="hidden" name={FILTER_PARAMS[k]} value="sim" />)}
        <label htmlFor="busca-mural" className="sr-only">
          Buscar pelo nome
        </label>
        <input
          id="busca-mural"
          name={FILTER_PARAMS.search}
          type="search"
          defaultValue={filters.search ?? ""}
          maxLength={SEARCH_MAX_LENGTH}
          placeholder="Buscar pelo nome…"
          className="min-h-11 flex-1 rounded-full border-2 border-rosa-claro bg-white px-4 text-base outline-none focus:border-rosa"
        />
        <button type="submit" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-rosa text-white hover:bg-rosa-escuro" aria-label="Buscar">
          <SearchIcon className="size-5" />
        </button>
      </form>

      {groups.map((key) => (
        <div key={key} role="group" aria-labelledby={`filtro-${key}`} className="sm:flex sm:items-center sm:gap-4">
          <p id={`filtro-${key}`} className="mb-2 text-sm font-bold text-rosa-escuro sm:mb-0 sm:w-24 sm:shrink-0">
            {FILTER_GROUP_LABELS[key]}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={filterHref(filters, key, undefined)}
              scroll={false}
              aria-current={!filters[key] ? "true" : undefined}
              className={`${chip} ${!filters[key] ? chipOn : chipOff}`}
            >
              Todos
            </Link>
            {FILTER_OPTIONS[key].map((option) => {
              const active = filters[key] === option.value;
              return (
                <Link
                  key={option.value}
                  href={filterHref(filters, key, option.value)}
                  scroll={false}
                  aria-current={active ? "true" : undefined}
                  className={`${chip} ${active ? chipOn : chipOff}`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <div role="group" aria-labelledby="filtro-cuidados" className="sm:flex sm:items-center sm:gap-4">
        <p id="filtro-cuidados" className="mb-2 text-sm font-bold text-rosa-escuro sm:mb-0 sm:w-24 sm:shrink-0">
          Cuidados
        </p>
        <div className="flex flex-wrap gap-2">
          {toggles.map((key) => (
            <Link
              key={key}
              href={toggleHref(filters, key)}
              scroll={false}
              aria-pressed={filters[key] ? "true" : "false"}
              className={`${chip} ${filters[key] ? chipOn : chipOff}`}
            >
              {filters[key] && <CheckIcon className="size-4" />}
              {TOGGLE_LABELS[key]}
            </Link>
          ))}
        </div>
      </div>

      {hasActiveFilters(filters) && (
        <div className="flex flex-wrap items-center gap-3 border-t border-rosa-claro pt-3 text-sm">
          {filters.search && (
            <Link
              href={buildAdoptionHref({ ...filters, search: undefined })}
              scroll={false}
              className="inline-flex min-h-11 items-center gap-1 rounded-full bg-rosa-pastel px-3 font-semibold text-rosa-escuro"
            >
              Nome: “{filters.search}” <CloseIcon className="size-4" />
              <span className="sr-only">(remover busca)</span>
            </Link>
          )}
          <Link href="/adocao" scroll={false} className="inline-flex min-h-11 items-center font-semibold text-rosa-escuro hover:underline">
            Limpar todos os filtros
          </Link>
        </div>
      )}
    </nav>
  );
}
