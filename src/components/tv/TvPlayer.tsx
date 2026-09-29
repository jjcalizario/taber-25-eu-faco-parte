"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { Palco } from "./Palco";
import { CenaEspera, CenaRelato, FundoTv, GuiasTecnicas, type Fase } from "./Cena";
import { montarFila } from "./fila";
import { calcularLayout, duracaoPagina, PROPORCAO_REFERENCIA, type LayoutRelato } from "@/lib/tv-layout";
import { CONFIG_PADRAO, type Configuracoes, type FeedTv, type ItemTv } from "@/lib/types";
import { INFO } from "@/lib/categorias";

const INTERVALO_FEED_MS = 8000;

type Exibicao = { item: ItemTv; layout: LayoutRelato; pagina: number; chave: number };
type Conexao = { ok: boolean; ultimaSincronizacao: number | null; falhasSeguidas: number };

/** Carrega a foto antes de exibir; se falhar, o relato aparece sem ela (nunca trava a tela). */
function prepararItem(item: ItemTv): Promise<ItemTv> {
  if (!item.imagem) return Promise.resolve(item);
  return new Promise((resolve) => {
    const img = new Image();
    const semFoto = () => resolve({ ...item, imagem: null });
    const t = setTimeout(semFoto, 5000);
    img.onload = () => { clearTimeout(t); resolve(item); };
    img.onerror = () => { clearTimeout(t); semFoto(); };
    img.src = item.imagem!.url;
  });
}

export function TvPlayer() {
  const params = useSearchParams();
  const [config, setConfig] = useState<Configuracoes>(CONFIG_PADRAO);
  const [atual, setAtual] = useState<Exibicao | null>(null);
  const [fase, setFase] = useState<Fase>("entrada");
  const [totalItens, setTotalItens] = useState(0);
  const [conexao, setConexao] = useState<Conexao>({ ok: true, ultimaSincronizacao: null, falhasSeguidas: 0 });
  const [tecnico, setTecnico] = useState(params.get("tecnico") === "1");
  const [guias, setGuias] = useState(false);
  const [controlesVisiveis, setControlesVisiveis] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  const [janela, setJanela] = useState({ w: 0, h: 0 });
  const [escala, setEscala] = useState(0);
  const [qr, setQr] = useState<{ svg: string; curta: string } | null>(null);

  const itensRef = useRef(new Map<string, ItemTv>());
  const filaRef = useRef<string[]>([]);
  const posRef = useRef(-1);
  const ultimoRef = useRef<string | null>(null);
  const configRef = useRef(config);
  const atualRef = useRef(atual);
  const versaoRef = useRef("");
  const avancandoRef = useRef(false);
  configRef.current = config;
  atualRef.current = atual;

  /* ---------------- próximo relato ---------------- */
  const avancar = useCallback(async () => {
    if (avancandoRef.current) return;
    avancandoRef.current = true;
    try {
      const itens = itensRef.current;
      if (!itens.size) {
        setAtual(null);
        return;
      }
      let pos = posRef.current + 1;
      while (pos < filaRef.current.length && !itens.has(filaRef.current[pos])) pos++;
      if (pos >= filaRef.current.length) {
        filaRef.current = montarFila([...itens.values()], configRef.current.modo_ordem, ultimoRef.current);
        pos = 0;
      }
      posRef.current = pos;
      const item = await prepararItem(itens.get(filaRef.current[pos])!);
      ultimoRef.current = item.id;

      // pré-carrega a foto do próximo
      const proximo = itens.get(filaRef.current[pos + 1] ?? "");
      if (proximo?.imagem) new Image().src = proximo.imagem.url;

      setAtual({ item, layout: calcularLayout(item.texto, !!item.imagem, INFO[item.categoria].tituloTela), pagina: 0, chave: Date.now() });
      setFase("entrada");
    } finally {
      avancandoRef.current = false;
    }
  }, []);

  /* ---------------- feed (atualização automática) ---------------- */
  const carregarFeed = useCallback(async () => {
    try {
      const resp = await fetch("/api/tv/feed", { cache: "no-store" });
      if (!resp.ok) throw new Error(String(resp.status));
      const feed = (await resp.json()) as FeedTv;
      setConexao({ ok: true, ultimaSincronizacao: Date.now(), falhasSeguidas: 0 });
      if (feed.versao === versaoRef.current) return;
      versaoRef.current = feed.versao;

      const mapa = new Map(feed.itens.map((i) => [i.id, i]));
      // novos relatos aprovados entram no ciclo atual, sem recarregar a página
      feed.itens.forEach((i) => {
        if (!itensRef.current.has(i.id) && !filaRef.current.includes(i.id)) filaRef.current.push(i.id);
      });
      if (feed.config.modo_ordem !== configRef.current.modo_ordem) {
        filaRef.current = filaRef.current.slice(0, posRef.current + 1); // novo modo vale a partir do próximo relato
      }
      itensRef.current = mapa;
      setConfig(feed.config);
      setTotalItens(mapa.size);

      if (!atualRef.current && mapa.size) avancar();
      if (atualRef.current && !mapa.size) setFase("saida"); // projeção pausada ou nada aprovado
    } catch {
      setConexao((c) => ({ ...c, ok: false, falhasSeguidas: c.falhasSeguidas + 1 }));
      // continua exibindo o que já tinha carregado
    }
  }, [avancar]);

  useEffect(() => {
    carregarFeed();
    const t = setInterval(carregarFeed, INTERVALO_FEED_MS);
    return () => clearInterval(t);
  }, [carregarFeed]);

  /* ---------------- máquina de tempo ---------------- */
  useEffect(() => {
    if (!atual) return;
    let t: ReturnType<typeof setTimeout>;
    let raf = 0;
    if (fase === "entrada") {
      raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => setFase("visivel"))));
    } else if (fase === "visivel") {
      const texto = atual.layout.paginas[atual.pagina] ?? "";
      t = setTimeout(
        () => setFase("saida"),
        duracaoPagina(texto, config.tempo_exibicao, config.ajuste_leitura) + config.tempo_transicao
      );
    } else {
      t = setTimeout(() => {
        if (atual.pagina < atual.layout.paginas.length - 1 && itensRef.current.size) {
          setAtual({ ...atual, pagina: atual.pagina + 1 });
          setFase("entrada");
        } else {
          avancar();
        }
      }, config.tempo_transicao + 150);
    }
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [atual, fase, config.tempo_exibicao, config.tempo_transicao, config.ajuste_leitura, avancar]);

  /* ---------------- QR Code do convite ---------------- */
  useEffect(() => {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
    const url = `${base}/25anos`;
    QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#2E1729", light: "#FFFFFF" } })
      .then((svg) => setQr({ svg, curta: url.replace(/^https?:\/\//, "") }))
      .catch(() => setQr(null));
  }, []);

  /* ---------------- tela cheia, teclado, cursor, tela sempre acesa ---------------- */
  const alternarTelaCheia = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const medir = () => setJanela({ w: window.innerWidth, h: window.innerHeight });
    const fs = () => setTelaCheia(!!document.fullscreenElement);
    const teclas = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") alternarTelaCheia();
      if (e.shiftKey && (e.key === "T" || e.key === "t")) setTecnico((v) => !v);
      if (e.shiftKey && (e.key === "G" || e.key === "g")) setGuias((v) => !v);
    };
    let esconder: ReturnType<typeof setTimeout>;
    const mouse = () => {
      setControlesVisiveis(true);
      clearTimeout(esconder);
      esconder = setTimeout(() => setControlesVisiveis(false), 3000);
    };
    medir();
    window.addEventListener("resize", medir);
    document.addEventListener("fullscreenchange", fs);
    window.addEventListener("keydown", teclas);
    window.addEventListener("mousemove", mouse);

    // impede que o computador do técnico apague a tela
    let trava: { release: () => Promise<void> } | null = null;
    const pedirTrava = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trava = await (navigator as any).wakeLock?.request("screen");
      } catch {}
    };
    pedirTrava();
    const vis = () => document.visibilityState === "visible" && pedirTrava();
    document.addEventListener("visibilitychange", vis);

    return () => {
      window.removeEventListener("resize", medir);
      document.removeEventListener("fullscreenchange", fs);
      window.removeEventListener("keydown", teclas);
      window.removeEventListener("mousemove", mouse);
      document.removeEventListener("visibilitychange", vis);
      clearTimeout(esconder);
      trava?.release().catch(() => {});
    };
  }, [alternarTelaCheia]);

  const categoriaFundo = atual?.item.categoria ?? "neutro";
  const proporcaoAtual = janela.h ? janela.w / janela.h : 0;

  return (
    <div
      className="fixed inset-0 select-none bg-black"
      style={{ cursor: controlesVisiveis ? "default" : "none" }}
      onDoubleClick={alternarTelaCheia}
    >
      <Palco onEscala={setEscala}>
        <FundoTv
          categoria={categoriaFundo}
          transicaoMs={config.tempo_transicao}
          qrSvg={config.mostrar_qrcode ? qr?.svg : null}
          urlCurta={qr?.curta}
        />
        {atual ? (
          <CenaRelato
            key={atual.chave}
            categoria={atual.item.categoria}
            texto={atual.layout.paginas[atual.pagina] ?? ""}
            assinatura={atual.item.assinatura}
            imagem={atual.item.imagem}
            layout={atual.layout}
            fase={fase}
            transicaoMs={config.tempo_transicao}
            pagina={atual.pagina}
            totalPaginas={atual.layout.paginas.length}
          />
        ) : (
          <CenaEspera transicaoMs={config.tempo_transicao} />
        )}
        {guias ? <GuiasTecnicas comImagem={!!atual?.layout.comImagem} /> : null}
      </Palco>

      {!telaCheia && controlesVisiveis && !tecnico ? (
        <button
          onClick={alternarTelaCheia}
          className="fixed bottom-5 right-5 rounded-full bg-white/90 px-5 py-3 text-sm font-bold text-vinho shadow-lg"
        >
          Tela cheia (F)
        </button>
      ) : null}

      {tecnico ? (
        <div
          role="dialog"
          aria-label="Modo técnico"
          className="fixed left-4 top-4 z-50 w-[340px] rounded-2xl bg-black/85 p-5 font-sans text-[13px] leading-relaxed text-white shadow-2xl"
          style={{ cursor: "default" }}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <strong className="text-[15px]">Modo técnico</strong>
            <button onClick={() => setTecnico(false)} className="rounded px-2 py-1 hover:bg-white/10" aria-label="Fechar modo técnico">✕</button>
          </div>
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
            <dt className="text-white/60">Janela</dt><dd>{janela.w} × {janela.h}</dd>
            <dt className="text-white/60">Proporção atual</dt><dd>{proporcaoAtual.toFixed(3)} : 1</dd>
            <dt className="text-white/60">Referência</dt><dd>2688:1008 ({PROPORCAO_REFERENCIA.toFixed(3)} : 1)</dd>
            <dt className="text-white/60">Escala do palco</dt><dd>{(escala * 100).toFixed(1)}%</dd>
            <dt className="text-white/60">Pixels do palco</dt><dd>{Math.round(2688 * escala)} × {Math.round(1008 * escala)}</dd>
            <dt className="text-white/60">Conexão</dt>
            <dd className={conexao.ok ? "text-emerald-300" : "text-amber-300"}>
              {conexao.ok ? "online" : `falhou ${conexao.falhasSeguidas}×`}
            </dd>
            <dt className="text-white/60">Última sincronização</dt>
            <dd>{conexao.ultimaSincronizacao ? new Date(conexao.ultimaSincronizacao).toLocaleTimeString("pt-BR") : "—"}</dd>
            <dt className="text-white/60">Relatos carregados</dt><dd>{totalItens}</dd>
            <dt className="text-white/60">Posição no ciclo</dt><dd>{atual ? `${posRef.current + 1} de ${filaRef.current.length}` : "—"}</dd>
            <dt className="text-white/60">Exibindo</dt>
            <dd>{atual ? `${INFO[atual.item.categoria].rotulo} · tela ${atual.pagina + 1}/${atual.layout.paginas.length}` : "espera"}</dd>
            <dt className="text-white/60">Projeção</dt><dd>{config.projecao_ativa ? "ativa" : "pausada"}</dd>
          </dl>
          {Math.abs(proporcaoAtual - PROPORCAO_REFERENCIA) > 0.02 ? (
            <p className="mt-3 rounded-lg bg-amber-400/15 px-3 py-2 text-amber-200">
              A janela não está em 2,67:1. O conteúdo continua proporcional, com faixas pretas nas sobras.
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={alternarTelaCheia} className="rounded-lg bg-white px-3 py-2 font-bold text-black">
              {telaCheia ? "Sair da tela cheia" : "Tela cheia"}
            </button>
            <button onClick={() => { versaoRef.current = ""; carregarFeed(); }} className="rounded-lg bg-white/15 px-3 py-2 font-bold">
              Sincronizar agora
            </button>
            <button onClick={() => setGuias((v) => !v)} className="rounded-lg bg-white/15 px-3 py-2 font-bold">
              {guias ? "Ocultar guias" : "Área segura"}
            </button>
          </div>
          <p className="mt-3 text-white/50">Atalhos: F tela cheia · Shift+T modo técnico · Shift+G guias · duplo clique tela cheia</p>
        </div>
      ) : null}
    </div>
  );
}
