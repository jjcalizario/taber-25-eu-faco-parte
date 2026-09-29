/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ReactNode } from "react";
import type { Categoria } from "@/lib/categorias";

/** Superfície da campanha: degradê oficial, coração do 25 e assinatura. */
export function Moldura({
  children,
  categoria,
  rodape = true,
}: {
  children: ReactNode;
  categoria?: Categoria;
  rodape?: boolean;
}) {
  return (
    <div className="superficie-25 relative min-h-dvh overflow-hidden text-white" data-categoria={categoria}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(46,23,41,.10), rgba(46,23,41,.32) 70%, rgba(46,23,41,.45))" }}
      />
      <img
        src="/brand/icone-25.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-10 w-[440px] max-w-none opacity-[.13] md:-right-10 md:w-[620px]"
      />
      <div className={`relative mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] ${rodape ? "pb-[max(1.5rem,env(safe-area-inset-bottom))]" : ""}`}>
        <header className="flex items-center">
          <Link href="/" aria-label="Taber 25 anos, início">
            <img src="/brand/taber-25.png" alt="Taber 25 anos" width={150} height={34} className="h-auto w-[150px]" />
          </Link>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
        {rodape ? (
          <footer className="mt-12 flex items-center gap-3 text-white/90">
            <img src="/brand/icone-taber.png" alt="" aria-hidden width={34} height={34} className="h-[34px] w-[34px]" />
            <p className="text-[0.8rem] font-semibold leading-tight">
              Tabernáculo de Davi
              <br />
              <span className="font-normal text-white/80">Movidos pelo amor de Deus</span>
            </p>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
