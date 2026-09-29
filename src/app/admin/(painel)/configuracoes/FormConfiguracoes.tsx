"use client";

import { useActionState } from "react";
import { salvarConfiguracoes } from "@/app/admin/acoes";
import { CATEGORIAS, INFO } from "@/lib/categorias";
import type { Configuracoes } from "@/lib/types";

function Interruptor({ nome, rotulo, ajuda, padrao }: { nome: string; rotulo: string; ajuda?: string; padrao: boolean }) {
  return (
    <label className="flex items-start justify-between gap-6 py-3">
      <span>
        <span className="block font-bold">{rotulo}</span>
        {ajuda ? <span className="block text-sm text-vinho/65">{ajuda}</span> : null}
      </span>
      <input type="checkbox" name={nome} value="true" defaultChecked={padrao} className="mt-1 h-5 w-5 shrink-0 accent-malva" />
    </label>
  );
}

export function FormConfiguracoes({ config }: { config: Configuracoes }) {
  const [estado, acao, pendente] = useActionState(salvarConfiguracoes, null);
  const campo = "h-11 w-28 rounded-xl border border-vinho/20 bg-white px-3 tabular-nums";

  return (
    <form action={acao} className="mt-6 flex flex-col gap-6">
      <div className="divide-y divide-vinho/10 rounded-2xl bg-white px-5">
        <Interruptor nome="projecao_ativa" rotulo="Projeção ativa" ajuda="Desligado, o telão mostra só a tela de convite da campanha." padrao={config.projecao_ativa} />
        <Interruptor nome="mostrar_imagens" rotulo="Mostrar fotos enviadas" ajuda="Relatos com foto ganham a composição com imagem." padrao={config.mostrar_imagens} />
        <Interruptor nome="mostrar_nomes" rotulo="Mostrar nomes" ajuda="Desligado, nenhum relato mostra assinatura." padrao={config.mostrar_nomes} />
        <Interruptor nome="mostrar_qrcode" rotulo="Mostrar QR Code no telão" ajuda="Convite lateral para as pessoas enviarem o próprio relato." padrao={config.mostrar_qrcode} />
      </div>

      <fieldset className="rounded-2xl bg-white p-5">
        <legend className="px-1 font-extrabold">Categorias no telão</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {CATEGORIAS.map((c) => (
            <label key={c} className="flex min-h-[44px] items-center gap-2 font-bold">
              <input type="checkbox" name="categorias_ativas" value={c} defaultChecked={config.categorias_ativas.includes(c)} className="h-5 w-5 accent-malva" />
              {INFO[c].emoji} {INFO[c].rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-2xl bg-white p-5">
        <legend className="px-1 font-extrabold">Ordem</legend>
        <div className="mt-2 flex flex-col gap-2">
          {[
            { v: "categorias", r: "Alternar experiências", a: "Grato, milagre, transformação, e assim por diante." },
            { v: "aleatorio", r: "Aleatória", a: "Embaralha a cada ciclo completo." },
            { v: "cronologico", r: "Cronológica", a: "Pela ordem definida no relato, depois pela data de aprovação." },
          ].map((o) => (
            <label key={o.v} className="flex items-start gap-3 py-1">
              <input type="radio" name="modo_ordem" value={o.v} defaultChecked={config.modo_ordem === o.v} className="mt-1 h-5 w-5 accent-malva" />
              <span>
                <span className="block font-bold">{o.r}</span>
                <span className="block text-sm text-vinho/65">{o.a}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-5 rounded-2xl bg-white p-5 sm:grid-cols-2">
        <legend className="px-1 font-extrabold">Tempo</legend>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Tempo de exibição (segundos)
          <input type="number" name="tempo_exibicao" min={5} max={120} defaultValue={config.tempo_exibicao} className={campo} />
          <span className="font-normal text-vinho/65">Mínimo por tela de relato.</span>
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Duração da transição (ms)
          <input type="number" name="tempo_transicao" min={200} max={5000} step={100} defaultValue={config.tempo_transicao} className={campo} />
          <span className="font-normal text-vinho/65">1000 a 1500 fica suave sem atrasar a leitura.</span>
        </label>
        <div className="sm:col-span-2">
          <Interruptor nome="ajuste_leitura" rotulo="Dar mais tempo para textos longos" ajuda="Soma tempo de leitura (cerca de 3 palavras por segundo) acima do mínimo." padrao={config.ajuste_leitura} />
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <button disabled={pendente} className="min-h-[48px] rounded-xl bg-vinho px-6 font-extrabold text-white disabled:opacity-60">
          {pendente ? "Salvando…" : "Salvar configurações"}
        </button>
        <p aria-live="polite" className={`text-sm font-semibold ${estado?.ok ? "text-emerald-800" : "text-[#8f2322]"}`}>
          {estado?.mensagem}
        </p>
      </div>
    </form>
  );
}
