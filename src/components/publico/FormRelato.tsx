/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Categoria } from "@/lib/categorias";
import { LIMITE_NOME, LIMITE_RELATO, MINIMO_RELATO } from "@/lib/validacao";
import { comprimirImagem } from "./comprimirImagem";

type Erros = Partial<Record<"nome" | "relato" | "imagem" | "geral", string>>;
const LIMITE_ENVIO_BYTES = 4 * 1024 * 1024; // limite seguro para hospedagens serverless
const AVISO_TEXTO_LONGO = 450;

export function FormRelato({ categoria, pergunta, dica }: { categoria: Categoria; pergunta: string; dica: string }) {
  const router = useRouter();
  const id = useId();
  const inicio = useRef(Date.now());
  const inputFoto = useRef<HTMLInputElement>(null);
  const refNome = useRef<HTMLInputElement>(null);
  const refRelato = useRef<HTMLTextAreaElement>(null);
  const refResumo = useRef<HTMLDivElement>(null);

  const [nome, setNome] = useState("");
  const [relato, setRelato] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [autorizacao, setAutorizacao] = useState(false); // consentimento precisa ser ativo (LGPD)
  const [foto, setFoto] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [preparandoFoto, setPreparandoFoto] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa); }, [previa]);

  function validar(): Erros {
    const e: Erros = {};
    const n = nome.trim();
    const r = relato.trim();
    if (!anonimo && n.length < 2) e.nome = "Escreva seu nome, ou marque a opção de envio anônimo.";
    if (n.length > LIMITE_NOME) e.nome = `Use no máximo ${LIMITE_NOME} caracteres.`;
    if (r.length < MINIMO_RELATO) e.relato = `Conte um pouco mais. O relato precisa de pelo menos ${MINIMO_RELATO} caracteres.`;
    if (r.length > LIMITE_RELATO) e.relato = `O relato pode ter até ${LIMITE_RELATO} caracteres.`;
    return e;
  }

  function focarPrimeiroErro(e: Erros) {
    if (e.nome) refNome.current?.focus();
    else if (e.relato) refRelato.current?.focus();
    else refResumo.current?.focus();
  }

  async function escolherFoto(arquivo: File | undefined) {
    setErros((e) => ({ ...e, imagem: undefined }));
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/") && !/\.(heic|heif)$/i.test(arquivo.name)) {
      setErros((e) => ({ ...e, imagem: "Escolha um arquivo de imagem (foto)." }));
      return;
    }
    setPreparandoFoto(true);
    const pronta = await comprimirImagem(arquivo);
    setPreparandoFoto(false);
    if (pronta.size > LIMITE_ENVIO_BYTES) {
      setErros((e) => ({ ...e, imagem: "Essa foto é pesada demais. Tente uma captura de tela ou outra foto." }));
      return;
    }
    if (previa) URL.revokeObjectURL(previa);
    setFoto(pronta);
    setPrevia(URL.createObjectURL(pronta));
  }

  function removerFoto() {
    if (previa) URL.revokeObjectURL(previa);
    setFoto(null);
    setPrevia(null);
    if (inputFoto.current) inputFoto.current.value = "";
  }

  async function enviar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (enviando || preparandoFoto) return;
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) return focarPrimeiroErro(e);

    const dados = new FormData();
    dados.set("categoria", categoria);
    dados.set("nome", nome);
    dados.set("relato", relato);
    dados.set("anonimo", String(anonimo));
    dados.set("autorizacao", String(autorizacao));
    dados.set("_t", String(inicio.current));
    dados.set("site", (ev.currentTarget.elements.namedItem("site") as HTMLInputElement)?.value ?? "");
    if (foto) dados.set("imagem", foto);

    setEnviando(true);
    try {
      const resp = await fetch("/api/relatos", { method: "POST", body: dados });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const novos: Erros = { ...(json.campos ?? {}), geral: json.erro ?? "Não foi possível enviar. Tente novamente." };
        setErros(novos);
        focarPrimeiroErro(novos);
        return;
      }
      router.push(`/obrigado?c=${categoria}`);
    } catch {
      const novos = { geral: "Sem conexão no momento. Verifique a internet e toque em enviar de novo." };
      setErros(novos);
      refResumo.current?.focus();
    } finally {
      setEnviando(false);
    }
  }

  const campo =
    "mt-2 w-full rounded-2xl border-2 bg-nevoa px-4 text-[1.05rem] text-vinho placeholder:text-vinho/45 focus:border-malva focus:bg-white focus:outline-none";
  const borda = (erro?: string) => (erro ? "border-brasa" : "border-transparent");
  const tamanho = relato.trim().length;

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-7">
      <div ref={refResumo} tabIndex={-1} aria-live="assertive" className="outline-none">
        {erros.geral ? (
          <p className="rounded-2xl bg-brasa/10 px-4 py-3 text-[0.95rem] font-semibold text-[#9b2c2b]">{erros.geral}</p>
        ) : null}
      </div>

      {/* armadilha para robôs: invisível para pessoas e leitores de tela */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Site <input name="site" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor={`${id}-nome`} className="text-[1.05rem] font-extrabold">
          {anonimo ? "Seu nome (opcional)" : "Seu nome"}
        </label>
        {anonimo ? <p className="mt-1 text-sm text-vinho/70">Só a equipe verá. No telão aparece “Anônimo”.</p> : null}
        <input
          ref={refNome}
          id={`${id}-nome`}
          name="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="next"
          maxLength={LIMITE_NOME + 20}
          aria-invalid={!!erros.nome}
          aria-describedby={erros.nome ? `${id}-nome-erro` : undefined}
          className={`${campo} ${borda(erros.nome)} h-14`}
        />
        {erros.nome ? <p id={`${id}-nome-erro`} className="mt-2 text-sm font-semibold text-[#9b2c2b]">{erros.nome}</p> : null}
      </div>

      <div>
        <label htmlFor={`${id}-relato`} className="text-[1.05rem] font-extrabold">{pergunta}</label>
        <p id={`${id}-relato-dica`} className="mt-1 text-sm text-vinho/70">{dica}</p>
        <textarea
          ref={refRelato}
          id={`${id}-relato`}
          name="relato"
          value={relato}
          onChange={(e) => setRelato(e.target.value)}
          rows={7}
          maxLength={LIMITE_RELATO}
          aria-invalid={!!erros.relato}
          aria-describedby={`${id}-relato-dica ${id}-relato-contador${erros.relato ? ` ${id}-relato-erro` : ""}`}
          className={`${campo} ${borda(erros.relato)} min-h-[200px] resize-y py-3 leading-relaxed`}
        />
        <div className="mt-2 flex items-start justify-between gap-4 text-sm">
          <p className="text-vinho/70">
            {tamanho > AVISO_TEXTO_LONGO ? "Texto longo" : ""}
          </p>
          <p id={`${id}-relato-contador`} className={`shrink-0 tabular-nums ${tamanho > LIMITE_RELATO ? "font-bold text-[#9b2c2b]" : "text-vinho/60"}`}>
            {tamanho}/{LIMITE_RELATO}
          </p>
        </div>
        {erros.relato ? <p id={`${id}-relato-erro`} className="mt-1 text-sm font-semibold text-[#9b2c2b]">{erros.relato}</p> : null}
      </div>

      <div>
        <p className="text-[1.05rem] font-extrabold" id={`${id}-foto-titulo`}>Uma foto desse momento <span className="font-normal text-vinho/60">(opcional)</span></p>
        <p className="mt-1 text-sm text-vinho/70" id={`${id}-foto-dica`}>
          Ela pode aparecer no telão junto com o seu relato. Envie só fotos suas ou de quem autorizou.
        </p>
        <input
          ref={inputFoto}
          id={`${id}-foto`}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-labelledby={`${id}-foto-titulo`}
          aria-describedby={`${id}-foto-dica`}
          onChange={(e) => escolherFoto(e.target.files?.[0])}
        />
        {previa ? (
          <div className="mt-3 flex items-center gap-4">
            <img src={previa} alt="Prévia da foto escolhida" className="h-24 w-24 rounded-2xl object-cover" />
            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-foto`} className="inline-flex min-h-[44px] cursor-pointer items-center font-bold text-malva underline underline-offset-4">
                Trocar foto
              </label>
              <button type="button" onClick={removerFoto} className="inline-flex min-h-[44px] items-center font-bold text-vinho/70 underline underline-offset-4">
                Remover foto
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor={`${id}-foto`}
            className="mt-3 flex min-h-[64px] cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-malva/40 px-4 font-bold text-malva active:bg-nevoa"
          >
            <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <circle cx="12" cy="12" r="3.2" />
              <path d="M8 5l1.5-2h5L16 5" />
            </svg>
            {preparandoFoto ? "Preparando a foto…" : "Adicionar foto"}
          </label>
        )}
        {erros.imagem ? <p className="mt-2 text-sm font-semibold text-[#9b2c2b]" role="alert">{erros.imagem}</p> : null}
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">Privacidade e autorização</legend>
        <label className="flex min-h-[52px] cursor-pointer items-start gap-3 rounded-2xl bg-nevoa px-4 py-3">
          <input
            type="checkbox"
            checked={anonimo}
            onChange={(e) => setAnonimo(e.target.checked)}
            className="mt-0.5 h-6 w-6 shrink-0 accent-malva"
          />
          <span>
            <span className="block font-bold">Quero enviar anonimamente</span>
            <span className="block text-sm text-vinho/70">Seu nome não aparece no telão.</span>
          </span>
        </label>
        <label className="flex min-h-[52px] cursor-pointer items-start gap-3 rounded-2xl bg-nevoa px-4 py-3">
          <input
            type="checkbox"
            checked={autorizacao}
            onChange={(e) => setAutorizacao(e.target.checked)}
            className="mt-0.5 h-6 w-6 shrink-0 accent-malva"
          />
          <span className="text-[0.95rem] leading-snug">
            Autorizo o Tabernáculo de Davi a utilizar este relato nos telões e em materiais de comunicação da igreja, incluindo a celebração dos 25 anos.
{foto ? " Isso inclui a foto enviada." : ""}
          </span>
        </label>
        {!autorizacao ? (
          <p className="px-1 text-sm text-vinho/75">
          </p>
        ) : null}
      </fieldset>

      <button
        type="submit"
        disabled={enviando || preparandoFoto}
        className="min-h-[60px] w-full rounded-full bg-vinho px-6 text-[1.05rem] font-extrabold uppercase tracking-[0.02em] text-white transition-opacity disabled:opacity-60"
      >
        {enviando ? "Enviando…" : "Enviar meu relato"}
      </button>
    </form>
  );
}
