import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-extrabold">Página não encontrada</h1>
      <Link href="/" className="rounded-lg bg-brand px-4 py-2 font-semibold text-brand-foreground">
        Voltar para o início
      </Link>
    </main>
  );
}
