import type { Metadata } from "next";
import { FormLogin } from "./FormLogin";

export const metadata: Metadata = { title: "Entrar · Painel Taber 25" };

export default async function Login({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="painel grid min-h-dvh place-items-center bg-nevoa px-5 text-vinho">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/icone-taber.png" alt="" className="h-12 w-12 rounded-full bg-malva p-1" />
        <h1 className="mt-5 text-2xl font-extrabold">Painel dos relatos</h1>
        <p className="mt-1 text-sm text-vinho/70">Acesso restrito à equipe Taber Creative.</p>
        {erro === "acesso" ? (
          <p role="alert" className="mt-5 rounded-xl bg-brasa/10 px-4 py-3 text-sm font-semibold text-[#9b2c2b]">
            Este e-mail não tem permissão de administrador. Peça acesso ao responsável.
          </p>
        ) : null}
        <FormLogin />
      </div>
    </main>
  );
}
