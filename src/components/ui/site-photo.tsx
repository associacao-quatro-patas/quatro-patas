import Image from "next/image";
import type { SitePhotoView } from "@/lib/site-photos/queries";
import { PhotoPlaceholder } from "./illustrations";

/**
 * Foto de um espaço do site (cadastrada em "Fotos do site" no painel) ou, se
 * não houver, o espaço reservado com a pata da marca.
 */
export function SitePhotoFrame({
  photo,
  placeholderLabel,
  className = "aspect-[4/3] w-full rounded-card",
  sizes = "(min-width: 768px) 50vw, 100vw",
}: {
  photo?: SitePhotoView;
  placeholderLabel: string;
  className?: string;
  sizes?: string;
}) {
  if (!photo) return <PhotoPlaceholder label={placeholderLabel} className={className} />;
  return (
    <div className={`relative overflow-hidden bg-rosa-claro shadow-suave ${className}`}>
      <Image src={photo.url} alt={photo.alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
