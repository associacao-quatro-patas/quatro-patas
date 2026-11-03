import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { HeartIcon, IconCircle, PawIcon } from "@/components/ui/icons";
import { PhotoPlaceholder } from "@/components/ui/illustrations";
import { getAdoptionMural } from "@/lib/adoptions/queries";
import { petPhotoUrl } from "@/lib/pets/constants";
import type { MuralPet } from "@/types/database";

export const metadata: Metadata = {
  title: "Pets adotados",
  description: "Pets adotados da ONG Protetora 4 Patas: os resgatados que já encontraram um lar cheio de amor.",
};

// Pequenas inclinações alternadas, como fotos presas num mural de verdade.
const TILTS = [-3, 2, -1.5, 3, -2.5, 1.5, -1, 2.5];

export default function MuralDeAdocoesPage() {
  return (
    <section className="py-8 sm:py-12">
      <div className="card flex items-center gap-4 bg-gradient-to-br from-rosa-pastel to-white p-5 sm:p-8">
        <IconCircle size="lg">
          <HeartIcon />
        </IconCircle>
        <div>
          <h1 className="text-3xl font-bold text-rosa-escuro sm:text-4xl">Pets adotados</h1>
          <p className="mt-1 text-cinza">Eles foram resgatados e hoje vivem em um lar cheio de amor.</p>
        </div>
      </div>
      <Suspense fallback={<p className="mt-8 text-muted">Carregando os pets adotados…</p>}>
        <Mural />
      </Suspense>
    </section>
  );
}

async function Mural() {
  const pets = await getAdoptionMural();

  if (pets.length === 0) {
    return (
      <div className="card mt-6 border-dashed bg-rosa-pastel p-8 text-center">
        <PawIcon className="mx-auto size-10 text-rosa" />
        <p className="mt-3 font-semibold text-cinza">Em breve, as fotos dos nossos adotados aparecerão aqui.</p>
        <Link href="/adocao" className="btn-secondary mt-4">
          Conheça quem espera por um lar
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 rounded-[1.5rem] border border-rosa-claro bg-[#fffaf3] bg-[radial-gradient(rgb(255_214_231/0.7)_1.5px,transparent_1.5px)] [background-size:22px_22px] px-3 py-8 sm:px-8 sm:py-12">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4">
          {pets.map((pet, index) => (
            <li key={pet.id}>
              <Polaroid pet={pet} tilt={TILTS[index % TILTS.length]} priority={index < 4} />
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-8 text-center text-cinza">
        Quer ser o próximo final feliz?{" "}
        <Link href="/adocao" className="font-semibold text-rosa-escuro underline underline-offset-4">
          Veja os animais disponíveis para adoção
        </Link>
      </p>
    </>
  );
}

function Polaroid({ pet, tilt, priority }: { pet: MuralPet; tilt: number; priority: boolean }) {
  return (
    <figure
      style={{ rotate: `${tilt}deg` }}
      className="relative mx-auto max-w-64 bg-white p-2.5 pb-3 shadow-[0_10px_24px_-10px_rgb(46_46_46/0.35)] transition-[rotate,scale] duration-300 hover:z-10 hover:scale-105 hover:rotate-0 motion-reduce:transition-none sm:p-3 sm:pb-4"
    >
      {/* Fita adesiva rosa segurando a foto */}
      <span
        aria-hidden="true"
        className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[-4deg] rounded-sm bg-rosa-claro/80 shadow-sm"
      />
      <div className="relative aspect-square overflow-hidden bg-rosa-pastel">
        {pet.photo_path ? (
          <Image
            src={petPhotoUrl(pet.photo_path)}
            alt={`Foto de ${pet.name}`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 256px, (min-width: 640px) 30vw, 45vw"
            className="object-cover"
          />
        ) : (
          <PhotoPlaceholder label={`${pet.name} (sem foto)`} className="h-full w-full" />
        )}
      </div>
      <figcaption className="mt-2.5 truncate text-center text-base font-semibold text-cinza sm:mt-3 sm:text-lg">
        {pet.name}
      </figcaption>
    </figure>
  );
}
