"use client";

import { useActionState } from "react";
import { entrar } from "../acoes";

export function FormLogin() {
  const [estado, acao, pendente] = useActionState(entrar, null);
  return (
    <form action={acao} className="mt-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-bold">
        E-mail
        <input name="email" type="email" required autoComplete="username" className="h-12 rounded-xl border border-vinho/20 bg-white px-3 text-base font-normal" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Senha
        <input name="senha" type="password" required autoComplete="current-password" className="h-12 rounded-xl border border-vinho/20 bg-white px-3 text-base font-normal" />
      </label>
      {estado && !estado.ok ? <p role="alert" className="text-sm font-semibold text-[#9b2c2b]">{estado.mensagem}</p> : null}
      <button disabled={pendente} className="h-12 rounded-xl bg-vinho font-extrabold text-white disabled:opacity-60">
        {pendente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
