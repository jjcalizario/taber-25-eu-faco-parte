import Link from "next/link";
import { CATEGORIAS, INFO } from "@/lib/categorias";
import { Moldura } from "@/components/publico/Moldura";

const TINTAS: Record<string, string> = {
  gratidao: "linear-gradient(120deg, rgba(237,189,129,.42), rgba(212,124,60,.30))",
  milagre: "linear-gradient(120deg, rgba(209,74,73,.55), rgba(193,75,87,.35))",
  transformacao: "linear-gradient(120deg, rgba(123,95,144,.60), rgba(166,84,106,.35))",
};

export default function Inicio() {
  return (
    <Moldura>
      <section className="pt-14">
        <h1 className="text-[2.65rem] font-extrabold leading-[0.98] tracking-[-0.02em] sm:text-5xl">
          Você faz parte dessa história.
        </h1>
        <p className="mt-5 max-w-[34ch] text-lg leading-snug text-white/95">
          Há 25 anos, Deus tem escrito uma história nesta casa. E, de alguma forma, você também faz parte dela.
        </p>
      </section>

      <section aria-labelledby="escolha" className="mt-12">
        <h2 id="escolha" className="text-[1.35rem] font-extrabold leading-tight">
          Como o Taber faz parte da sua história?
        </h2>
        <ul className="mt-5 flex flex-col gap-3">
          {CATEGORIAS.map((c) => (
            <li key={c}>
              <Link
                href={`/${c}`}
                className="group flex min-h-[92px] items-center gap-4 rounded-[22px] border border-white/35 px-4 py-4 backdrop-blur-[2px] transition-colors active:bg-white/15"
                style={{ background: TINTAS[c] }}
              >
                <span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/20 text-[1.7rem]">
                  {INFO[c].emoji}
                </span>
                <span className="flex-1">
                  <span className="block text-[1.2rem] font-extrabold leading-tight">{INFO[c].titulo}</span>
                  <span className="mt-1 block text-[0.95rem] leading-snug text-white/90">{INFO[c].chamada}</span>
                </span>
                <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" className="shrink-0 opacity-80 transition-transform group-hover:translate-x-0.5">
                  <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-12 text-[1.05rem] font-extrabold leading-snug">
        23 a 25 de Outubro
        <br />
        <span className="font-normal text-white/90"></span>
      </p>
    </Moldura>
  );
}
