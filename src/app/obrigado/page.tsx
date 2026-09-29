import Link from "next/link";
import { Moldura } from "@/components/publico/Moldura";
import { isCategoria } from "@/lib/categorias";

export default async function Obrigado({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  return (
    <Moldura categoria={isCategoria(c) ? c : undefined}>
      <section className="flex flex-1 flex-col justify-center py-16" aria-live="polite">
        <h1 className="text-[2.65rem] font-extrabold leading-[0.98] tracking-[-0.02em]">Recebemos sua história.</h1>
        <p className="mt-6 text-xl font-semibold leading-snug">Obrigado por fazer parte dos 25 anos do Taber.</p>
        <p className="mt-3 max-w-[34ch] text-base leading-snug text-white/90">
          Seu relato será analisado pela nossa equipe antes de aparecer nos telões.
        </p>
        <p className="mt-14 text-[1.05rem] font-extrabold uppercase leading-snug tracking-[0.01em]">
          Taber 25 anos | 23 a 25 de Outubro
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex min-h-[52px] items-center justify-center self-start rounded-full border-2 border-white/80 px-6 font-extrabold"
        >
          Contar outra história
        </Link>
      </section>
    </Moldura>
  );
}
