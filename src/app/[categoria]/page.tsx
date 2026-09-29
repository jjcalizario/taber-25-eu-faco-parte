import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIAS, INFO, isCategoria } from "@/lib/categorias";
import { Moldura } from "@/components/publico/Moldura";
import { FormRelato } from "@/components/publico/FormRelato";

export const dynamicParams = false;
export function generateStaticParams() {
  return CATEGORIAS.map((categoria) => ({ categoria }));
}

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }): Promise<Metadata> {
  const { categoria } = await params;
  return isCategoria(categoria) ? { title: `${INFO[categoria].titulo} · Taber 25 anos` } : {};
}

export default async function PaginaCategoria({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  if (!isCategoria(categoria)) notFound();
  const info = INFO[categoria];

  return (
    <Moldura categoria={categoria} rodape={false}>
      <Link href="/" className="mt-6 inline-flex min-h-[44px] items-center gap-1 self-start text-sm font-semibold text-white/90">
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24">
          <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Escolher outra opção
      </Link>

      <section className="pb-8 pt-4">
        <p aria-hidden className="text-[2.2rem] leading-none">{info.emoji}</p>
        <h1 className="mt-3 text-[2.35rem] font-extrabold leading-[0.98] tracking-[-0.02em]">{info.titulo}.</h1>
        <p className="mt-3 text-lg leading-snug text-white/95">{info.chamada}</p>
      </section>

      <div className="-mx-5 flex-1 rounded-t-[28px] bg-white px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-7 text-vinho">
        <FormRelato categoria={categoria} pergunta={info.perguntaForm} dica={info.dicaForm} />
      </div>
    </Moldura>
  );
}
