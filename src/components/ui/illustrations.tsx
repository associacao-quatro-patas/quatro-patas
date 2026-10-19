import { HeartIcon, PawIcon } from "./icons";

/**
 * Silhuetas de cão e gato sentados, de perfil, com coração (como no wireframe),
 * nas cores da marca. Usada nos banners enquanto a ONG não fornece fotos
 * próprias. Decorativa.
 */
export function PetsIllustration({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 320" className={className}>
      {/* Fundo: mancha suave */}
      <path
        d="M64 214c-18-70 30-150 116-164 70-12 150 8 178 70 26 58 6 132-60 158-74 30-214 22-234-64Z"
        fill="#ffd6e7"
      />
      <ellipse cx="214" cy="300" rx="150" ry="10" fill="#ffd6e7" />

      {/* Coração em contorno */}
      <path
        d="M318 58c-7-14-28-14-33 2-5-16-26-16-33-2-8 16 7 31 33 47 26-16 41-31 33-47Z"
        fill="none"
        stroke="#e91e7a"
        strokeWidth="7"
        strokeLinejoin="round"
      />

      {/* Cão sentado, de perfil (olhando para a direita) */}
      <g fill="#e91e7a">
        {/* rabo */}
        <path d="M104 282c-26-4-36-30-24-52" fill="none" stroke="#e91e7a" strokeWidth="14" strokeLinecap="round" />
        {/* corpo e quadril */}
        <path d="M100 300c-6-52 8-96 44-120 30-20 66-14 80 14 12 24 10 66 8 106Z" />
        {/* peito e pescoço */}
        <path d="M168 182c4-26 18-44 40-50l26 8c8 26 6 56-6 80-18 6-44 2-60-38Z" />
        {/* cabeça */}
        <ellipse cx="214" cy="118" rx="38" ry="34" />
        {/* focinho */}
        <path d="M236 104c18 0 34 8 36 22 2 12-10 20-26 20-14 0-24-6-26-16Z" />
        {/* pata dianteira */}
        <rect x="204" y="222" width="22" height="80" rx="11" />
        {/* pata traseira */}
        <ellipse cx="142" cy="294" rx="34" ry="10" />
      </g>
      {/* orelha caída e nariz */}
      <path d="M196 92c-16-2-28 16-26 40 2 18 14 26 22 20 6-18 10-40 4-60Z" fill="#b3125b" />
      <ellipse cx="270" cy="118" rx="7" ry="6" fill="#b3125b" />

      {/* Gato sentado, de perfil (olhando para a esquerda) */}
      <g fill="#b3125b">
        {/* rabo */}
        <path d="M338 296c34 0 46-26 32-50" fill="none" stroke="#b3125b" strokeWidth="12" strokeLinecap="round" />
        {/* corpo */}
        <path d="M282 300c-10-40-4-78 18-100 20-18 42-12 50 12 10 30 8 62 0 88Z" />
        {/* cabeça */}
        <circle cx="302" cy="186" r="28" />
        {/* orelhas */}
        <path d="M279 178l3-36 20 18Z" />
        <path d="M304 160l20-20 4 32Z" />
        {/* focinho */}
        <path d="M278 192c-8 0-12 6-8 10 4 4 12 2 16-2Z" />
        {/* pata dianteira */}
        <rect x="286" y="244" width="16" height="58" rx="8" />
      </g>
    </svg>
  );
}

/** Espaço reservado para fotos: pata da marca sobre Rosa Claro (até haver fotos reais da ONG). */
export function PhotoPlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div role="img" aria-label={label} className={`flex items-center justify-center bg-rosa-claro ${className}`}>
      <PawIcon className="size-1/3 max-h-28 max-w-28 text-white" />
    </div>
  );
}

/** Mini ilustração para os slides do banner (coração + pata). */
export function HeartPawIllustration({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute inset-[6%] rounded-full bg-rosa-claro" />
      <div className="absolute inset-[20%] rounded-full bg-rosa-pastel" />
      <PawIcon className="relative size-[44%] text-rosa" />
      <HeartIcon className="absolute top-[10%] right-[12%] size-[18%] text-rosa-escuro" />
    </div>
  );
}
