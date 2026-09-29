/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CATEGORIAS, INFO, type Categoria, type Status } from "@/lib/categorias";
import type { Relato } from "@/lib/types";
import { alternarCampo, excluirRelato, mudarStatus, removerImagem, salvarEdicao, type Resultado } from "@/app/admin/acoes";
import { PreviaLed } from "@/components/admin/PreviaLed";
import { SeloCategoria, SeloStatus, formatarData } from "@/components/admin/Selos";

export function EditorRelato({
  relato: r,
  urlImagem,
  mostrarNomes,
  mostrarImagens,
}: {
  relato: Relato;
  urlImagem: string | null;
  mostrarNomes: boolean;
  mostrarImagens: boolean;
}) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [aviso, setAviso] = useState<Resultado | null>(null);
  const [editando, setEditando] = useState(false);

  const [texto, setTexto] = useState(r.relato);
  const [nome, setNome] = useState(r.nome ?? "");
  const [anonimo, setAnonimo] = useState(r.anonimo);
  const [categoria, setCategoria] = useState<Categoria>(r.categoria);
  const [ordem, setOrdem] = useState(r.ordem_exibicao?.toString() ?? "");
  const alterado =
    texto !== r.relato || nome !== (r.nome ?? "") || anonimo !== r.anonimo || categoria !== r.categoria || ordem !== (r.ordem_exibicao?.toString() ?? "");

  const rodar = (fn: () => Promise<Resultado | void>) =>
    iniciar(async () => {
      const res = await fn();
      if (res) setAviso(res);
      router.refresh();
    });

  const salvar = async (): Promise<Resultado> => {
    const f = new FormData();
    f.set("id", r.id);
    f.set("relato", texto);
    f.set("nome", nome);
    f.set("anonimo", String(anonimo));
    f.set("categoria", categoria);
    f.set("ordem_exibicao", ordem);
    return salvarEdicao(null, f);
  };

  const status = (s: Status, confirmar?: string) => {
    if (confirmar && !window.confirm(confirmar)) return;
    rodar(async () => {
      if (s === "aprovado" && alterado) {
        const res = await salvar();
        if (!res.ok) return res;
      }
      return mudarStatus(r.id, s);
    });
  };

  const assinatura = !mostrarNomes ? null : anonimo || !nome.trim() ? "Anônimo" : nome.trim();
  const imagemPrevia =
    urlImagem && r.exibir_imagem && mostrarImagens && r.imagem_largura && r.imagem_altura
      ? { url: urlImagem, largura: r.imagem_largura, altura: r.imagem_altura }
      : null;
  const noTelao = r.status === "aprovado" && r.autorizacao_publicacao && r.ativo_projecao;
  const botao = "min-h-[44px] rounded-xl px-5 font-extrabold disabled:opacity-50";

  return (
    <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_minmax(0,1.35fr)]">
      {/* ---------- coluna do conteúdo ---------- */}
      <section aria-labelledby="t-relato" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <SeloCategoria categoria={r.categoria} />
          <SeloStatus status={r.status} />
          {r.demo ? <span className="rounded-full bg-vinho px-2.5 py-0.5 text-xs font-bold text-white">DEMONSTRAÇÃO</span> : null}
          {noTelao ? <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">no telão</span> : null}
        </div>
        <h1 id="t-relato" className="text-2xl font-extrabold">
          {r.nome || "Sem nome"} {r.anonimo ? <span className="text-base font-semibold text-vinho/60">(pediu anonimato)</span> : null}
        </h1>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-vinho/60">Enviado</dt><dd>{formatarData(r.data_envio)}</dd>
          <dt className="text-vinho/60">Aprovado</dt><dd>{formatarData(r.data_aprovacao)}</dd>
          <dt className="text-vinho/60">Publicação</dt>
          <dd className={r.autorizacao_publicacao ? "" : "font-bold text-[#8f2322]"}>
            {r.autorizacao_publicacao ? "autorizada pela pessoa" : "NÃO autorizada: não pode ir ao telão"}
          </dd>
        </dl>

        <div aria-live="polite">
          {aviso ? (
            <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${aviso.ok ? "bg-emerald-50 text-emerald-900" : "bg-brasa/10 text-[#8f2322]"}`}>
              {aviso.mensagem}
            </p>
          ) : null}
        </div>

        {!editando ? (
          <div className="rounded-2xl bg-white p-5">
            <p className="whitespace-pre-line text-[1.05rem] leading-relaxed">{r.relato}</p>
            {r.editado ? (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer font-bold text-vinho/70">Ver texto original enviado</summary>
                <p className="mt-2 whitespace-pre-line rounded-xl bg-nevoa p-3 text-vinho/80">{r.relato_original}</p>
              </details>
            ) : null}
            <button type="button" onClick={() => setEditando(true)} className={`${botao} mt-4 border-2 border-vinho/20`}>
              Editar
            </button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4 rounded-2xl bg-white p-5"
            onSubmit={(e) => {
              e.preventDefault();
              rodar(async () => {
                const res = await salvar();
                if (res.ok) setEditando(false);
                return res;
              });
            }}
          >
            <p className="text-sm text-vinho/70">
              Corrija ortografia, pontuação, quebras de linha ou encurte para o telão, sem mudar o sentido do testemunho.
            </p>
            <label className="flex flex-col gap-1 text-sm font-bold">
              Texto do relato
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={9}
                className="rounded-xl border border-vinho/20 p-3 text-base font-normal leading-relaxed"
              />
              <span className="font-normal text-vinho/60">{texto.trim().length} caracteres</span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-bold">
                Nome
                <input value={nome} onChange={(e) => setNome(e.target.value)} className="h-11 rounded-xl border border-vinho/20 px-3 font-normal" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Categoria
                <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)} className="h-11 rounded-xl border border-vinho/20 px-3 font-normal">
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{INFO[c].rotulo}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Ordem de exibição (opcional)
                <input value={ordem} onChange={(e) => setOrdem(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="h-11 rounded-xl border border-vinho/20 px-3 font-normal" />
                <span className="font-normal text-vinho/60">Menor número aparece antes no modo cronológico.</span>
              </label>
              <label className="flex items-center gap-2 self-center text-sm font-bold">
                <input type="checkbox" checked={anonimo} onChange={(e) => setAnonimo(e.target.checked)} className="h-5 w-5 accent-malva" />
                Exibir como anônimo
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button disabled={pendente || !alterado} className={`${botao} bg-vinho text-white`}>Salvar texto</button>
              <button
                type="button"
                onClick={() => {
                  setTexto(r.relato); setNome(r.nome ?? ""); setAnonimo(r.anonimo); setCategoria(r.categoria); setOrdem(r.ordem_exibicao?.toString() ?? "");
                  setEditando(false);
                }}
                className={`${botao} hover:bg-nevoa`}
              >
                Cancelar
              </button>
              {r.editado || texto !== r.relato_original ? (
                <button type="button" onClick={() => setTexto(r.relato_original)} className={`${botao} text-vinho/70 hover:bg-nevoa`}>
                  Restaurar original
                </button>
              ) : null}
            </div>
          </form>
        )}

        {/* ---------- decisão ---------- */}
        <div className="flex flex-wrap gap-2 border-t border-vinho/10 pt-5">
          {r.status !== "aprovado" ? (
            <button disabled={pendente} onClick={() => status("aprovado")} className={`${botao} bg-emerald-700 text-white`}>
              {alterado ? "Salvar e aprovar" : "Aprovar"}
            </button>
          ) : null}
          {r.status !== "rejeitado" ? (
            <button
              disabled={pendente}
              onClick={() => status("rejeitado", "Rejeitar este relato? Ele não aparecerá no telão.")}
              className={`${botao} border-2 border-brasa/60 text-[#8f2322]`}
            >
              Rejeitar
            </button>
          ) : null}
          {r.status !== "arquivado" ? (
            <button
              disabled={pendente}
              onClick={() => status("arquivado", "Arquivar este relato? Ele sai do telão no próximo ciclo.")}
              className={`${botao} border-2 border-vinho/25`}
            >
              Arquivar
            </button>
          ) : null}
          {r.status !== "pendente" ? (
            <button disabled={pendente} onClick={() => status("pendente")} className={`${botao} text-vinho/70 hover:bg-white`}>
              Voltar para pendente
            </button>
          ) : null}
        </div>

        <fieldset className="flex flex-col gap-3 rounded-2xl bg-white p-5 text-sm">
          <legend className="sr-only">Controles de projeção</legend>
          <label className="flex items-center justify-between gap-4 font-bold">
            Exibir no telão quando aprovado
            <input
              type="checkbox"
              checked={r.ativo_projecao}
              disabled={pendente}
              onChange={(e) => rodar(() => alternarCampo(r.id, "ativo_projecao", e.target.checked))}
              className="h-5 w-5 accent-malva"
            />
          </label>
          {r.imagem_path ? (
            <>
              <label className="flex items-center justify-between gap-4 font-bold">
                Mostrar a foto no telão
                <input
                  type="checkbox"
                  checked={r.exibir_imagem}
                  disabled={pendente}
                  onChange={(e) => rodar(() => alternarCampo(r.id, "exibir_imagem", e.target.checked))}
                  className="h-5 w-5 accent-malva"
                />
              </label>
              {!mostrarImagens ? <p className="text-vinho/60">As fotos estão desligadas para todo o telão nas configurações.</p> : null}
            </>
          ) : null}
        </fieldset>

        <details className="text-sm">
          <summary className="cursor-pointer font-bold text-vinho/60">Ações permanentes</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {r.imagem_path ? (
              <button
                disabled={pendente}
                onClick={() => window.confirm("Apagar a foto deste relato? Não dá para desfazer.") && rodar(() => removerImagem(r.id))}
                className={`${botao} border-2 border-brasa/40 text-[#8f2322]`}
              >
                Apagar foto
              </button>
            ) : null}
            <button
              disabled={pendente}
              onClick={() =>
                window.confirm("Excluir definitivamente este relato e sua foto? Use para pedidos de remoção. Não dá para desfazer.") &&
                rodar(() => excluirRelato(r.id))
              }
              className={`${botao} bg-[#8f2322] text-white`}
            >
              Excluir relato
            </button>
          </div>
        </details>
      </section>

      {/* ---------- coluna da prévia ---------- */}
      <section aria-labelledby="t-previa" className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <h2 id="t-previa" className="text-lg font-extrabold">Como vai aparecer no LED</h2>
        <PreviaLed categoria={categoria} texto={texto.trim() || " "} assinatura={assinatura} imagem={imagemPrevia} />
        {urlImagem ? (
          <div className="rounded-2xl bg-white p-4">
            <p className="mb-2 text-sm font-bold">Foto enviada</p>
            <a href={urlImagem} target="_blank" rel="noopener">
              <img src={urlImagem} alt={`Foto enviada com o relato de ${r.nome || "pessoa sem nome"}`} className="max-h-72 rounded-xl object-contain" />
            </a>
            <p className="mt-2 text-xs text-vinho/60">
              {r.imagem_largura}×{r.imagem_altura}px · metadados e localização removidos no envio
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
