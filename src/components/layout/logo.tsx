import Image from "next/image";
import { siteConfig } from "@/config/site";

/**
 * Logo oficial (selo circular). Sempre em proporção 1:1, sem recolorir, sobre
 * fundo branco ou Rosa Pastel. O arquivo tem 150px: até ~75px fica nítido em
 * telas de alta densidade.
 */
export function Logo({ size, priority = false, className = "" }: { size: number; priority?: boolean; className?: string }) {
  return (
    <Image
      src={siteConfig.logo.src}
      alt={siteConfig.logo.alt}
      width={size}
      height={size}
      priority={priority}
      className={`shrink-0 rounded-full ${className}`}
    />
  );
}
