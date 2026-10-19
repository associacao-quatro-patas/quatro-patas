// Ícones do guia de estilos (SVG inline, herdam a cor do texto via currentColor).
// Mapa: casa (Início) · pata (Adoção) · coração (Doação/favoritar) · WhatsApp
// (Contato) · seringa (Cuidados) · estrela (Histórias) · mão com coração (Doar)
// · varinha (MatchPet) · X (fechar).

import type { ReactNode } from "react";

type IconProps = { className?: string };

function Svg({ className = "size-6", children, fill = true }: IconProps & { children: ReactNode; fill?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? undefined : "currentColor"}
      strokeWidth={fill ? undefined : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function PawIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <ellipse cx="6.2" cy="9" rx="2.1" ry="2.7" />
      <ellipse cx="10" cy="5.6" rx="2.1" ry="2.8" />
      <ellipse cx="14.4" cy="5.6" rx="2.1" ry="2.8" />
      <ellipse cx="18" cy="9" rx="2.1" ry="2.7" />
      <path d="M12 11.3c-3.2 0-6.3 3.6-6.3 6.4 0 1.9 1.4 2.8 3 2.8 1.4 0 2.2-.8 3.3-.8s1.9.8 3.3.8c1.6 0 3-.9 3-2.8 0-2.8-3.1-6.4-6.3-6.4Z" />
    </Svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3.1 4.5 6.7 4.5c2 0 3.5 1.1 4.3 2.4.8-1.3 2.3-2.4 4.3-2.4 3.6 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21Z" />
    </Svg>
  );
}

export function HeartOutlineIcon({ className }: IconProps) {
  return (
    <Svg className={className} fill={false}>
      <path d="M12 20s-7-4.3-8.9-8.6C1.7 8.2 3.7 5 7 5c1.9 0 3.2 1 5 3 1.8-2 3.1-3 5-3 3.3 0 5.3 3.2 3.9 6.4C19 15.7 12 20 12 20Z" />
    </Svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3.2 2.5 11h2.8v9.3h5.1v-6h3.2v6h5.1V11h2.8L12 3.2Z" />
    </Svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </Svg>
  );
}

export function SyringeIcon({ className }: IconProps) {
  return (
    <Svg className={className} fill={false}>
      <path d="m18 2 4 4M17 7l3-3M19 9 8.7 19.3a2 2 0 0 1-2.8 0l-1.2-1.2a2 2 0 0 1 0-2.8L15 5M9 11l4 4M5 19l-3 3M14 4l6 6" />
    </Svg>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m12 2.8 2.8 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3-4.6-4.4 6.3-.8L12 2.8Z" />
    </Svg>
  );
}

/** Mão com coração (Doar). */
export function HandHeartIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 11.5S8 9.2 8 6.6C8 5.1 9.1 4 10.4 4c.7 0 1.3.3 1.6.8.3-.5.9-.8 1.6-.8C14.9 4 16 5.1 16 6.6c0 2.6-4 4.9-4 4.9Z" />
      <path d="M2 14.5h3.2l1.3.9c.8.6 1.8.9 2.8.9H13a1.3 1.3 0 0 1 0 2.6H9.5v.6h4.2c.6 0 1.2-.2 1.7-.5l4.4-3a1.6 1.6 0 0 1 2 2.4l-5.3 4.2c-.7.5-1.5.9-2.4.9H2v-9Z" />
    </Svg>
  );
}

/** Varinha mágica (MatchPet). */
export function WandIcon({ className }: IconProps) {
  return (
    <Svg className={className} fill={false}>
      <path d="m15 4-11 11 5 5 11-11-5-5ZM13 6l5 5M19 2v3M17.5 3.5h3M3 3v2M2 4h2M20 16v2M19 17h2" />
    </Svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Svg className={className} fill={false}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <Svg className={className} fill={false}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Svg className={className} fill={false}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <Svg className={className} fill={false}>
      <path d="m15 5-7 7 7 7" />
    </Svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <Svg className={className} fill={false}>
      <path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <Svg className={className} fill={false}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <Svg className={className} fill={false}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </Svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Svg className={className} fill={false}>
      <path d="M5 12l5 5L20 7" />
    </Svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="9" cy="8" r="3.5" />
      <circle cx="17" cy="9" r="2.8" />
      <path d="M2 19.5c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5V20H2v-.5ZM16.8 20v-.5c0-1.9-.7-3.5-2-4.6.6-.2 1.4-.3 2.2-.3 3 0 5 1.7 5 4.4V20h-5.2Z" />
    </Svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <Svg className={className} fill={false}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </Svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10.5H7.8v3h2.6V21h3.1Z" />
    </Svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Zm3 4a1.5 1.5 0 0 0-1 2.6V18h2v-1.4a1.5 1.5 0 0 0-1-2.6Z" />
    </Svg>
  );
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V8h4.5L13 3.5ZM8 12v1.6h8V12H8Zm0 3.4V17h8v-1.6H8Z" />
    </Svg>
  );
}

export function PixIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M17.6 16.9a2.9 2.9 0 0 1-2-.8l-2.9-2.9a.6.6 0 0 0-.8 0l-2.9 2.9a2.9 2.9 0 0 1-2 .8H6.4l3.7 3.7a2.7 2.7 0 0 0 3.8 0l3.7-3.7h0ZM7 7.1a2.9 2.9 0 0 1 2 .8l2.9 2.9a.6.6 0 0 0 .8 0l2.9-2.9a2.9 2.9 0 0 1 2-.8h.4l-3.7-3.7a2.7 2.7 0 0 0-3.8 0L6.6 7.1H7Zm13.6 3L18.4 8a.4.4 0 0 1-.2 0h-1a2 2 0 0 0-1.4.6l-2.9 2.9a1.4 1.4 0 0 1-2 0L8 8.6A2 2 0 0 0 6.6 8H5.4a.4.4 0 0 1-.2 0L3 10.1a2.7 2.7 0 0 0 0 3.8l2.2 2.2a.4.4 0 0 1 .2 0h1.2a2 2 0 0 0 1.4-.6l2.9-2.9a1.4 1.4 0 0 1 2 0l2.9 2.9a2 2 0 0 0 1.4.6h1a.4.4 0 0 1 .2 0l2.2-2.2a2.7 2.7 0 0 0 0-3.8Z" />
    </Svg>
  );
}

export function BowlIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 11h18a9 9 0 0 1-6 7.5V20H9v-1.5A9 9 0 0 1 3 11Zm5.5-4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4-2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
    </Svg>
  );
}

export function SparkleCleanIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M9 3h6v3h-1v2.2c2.3.7 4 2.8 4 5.3V21H6v-7.5c0-2.5 1.7-4.6 4-5.3V6H9V3Zm10.5 0 .6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4Z" />
    </Svg>
  );
}

/** Ícone em círculo Rosa Principal com símbolo branco (padrão do guia). */
export function IconCircle({ children, size = "md" }: { children: ReactNode; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "size-9 [&>svg]:size-5", md: "size-11 [&>svg]:size-6", lg: "size-14 [&>svg]:size-7" };
  return <span className={`icon-circle ${sizes[size]}`}>{children}</span>;
}
