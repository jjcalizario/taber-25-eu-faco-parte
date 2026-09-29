import type { Metadata } from "next";
import { exigirAdmin } from "@/lib/auth";
import { sair } from "../acoes";
import { NavPainel } from "./NavPainel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Painel · Taber 25", robots: { index: false } };

export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const admin = await exigirAdmin();
  return (
    <div className="painel min-h-dvh bg-nevoa text-vinho">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Ir para o conteúdo
      </a>
      <header className="border-b border-vinho/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-5 py-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/icone-25.png" alt="" className="h-9 w-9 rounded-lg bg-malva p-1" />
            <span className="font-extrabold leading-tight">Relatos 25 anos</span>
          </div>
          <NavPainel />
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-vinho/60 sm:inline">{admin.nome ?? admin.email}</span>
            <form action={sair}>
              <button className="rounded-lg px-3 py-2 font-bold hover:bg-nevoa">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <main id="conteudo" className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
