/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { INFO, type Categoria } from "@/lib/categorias";
import { AREA_SEGURA, COLUNAS, PALCO, encaixarImagem, type LayoutRelato } from "@/lib/tv-layout";

export type Fase = "entrada" | "visivel" | "saida";

/* ------------------------------------------------------------------ */
/* Fundo: degradê oficial + coração do 25 + assinatura lateral        */
/* ------------------------------------------------------------------ */
export function FundoTv({
  categoria,
  transicaoMs,
  qrSvg,
  urlCurta,
}: {
  categoria: Categoria | "neutro";
  transicaoMs: number;
  qrSvg?: string | null;
  urlCurta?: string;
}) {
  const estilo = { "--t": `${transicaoMs}ms` } as CSSProperties;
  return (
    <div className="absolute inset-0" style={estilo} aria-hidden>
      <div className="tv-deriva">
        {(["milagre", "gratidao", "transformacao", "neutro"] as const).map((c) => (
          <div key={c} className="tv-camada" data-cat={c} data-ativa={String(categoria === c)} />
        ))}
      </div>

      {/* véu para garantir contraste do texto branco em qualquer região do degradê */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 48% 62% at 50% 50%, rgba(46,23,41,.34), rgba(46,23,41,0) 78%), linear-gradient(90deg, rgba(46,23,41,.12), rgba(46,23,41,0) 30%, rgba(46,23,41,0) 70%, rgba(46,23,41,.12))",
        }}
      />

      {/* 25 em forma de coração, sangrando pela lateral esquerda */}
      <img
        src="/brand/icone-25.png"
        alt=""
        style={{ position: "absolute", left: -210, top: -150, height: 1240, width: "auto", opacity: 0.11 }}
      />

      {/* lateral direita: convite + assinatura da campanha */}
      <div
        className="absolute flex flex-col items-center justify-between"
        style={{
          left: COLUNAS.lateralDireita.x,
          width: COLUNAS.lateralDireita.largura,
          top: AREA_SEGURA.y + 40,
          height: AREA_SEGURA.altura - 40,
        }}
      >
        {qrSvg ? (
          <div className="flex flex-col items-center text-white" style={{ gap: 18 }}>
            <div
              style={{ width: 210, height: 210, padding: 16, background: "#fff", borderRadius: 22 }}
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, textAlign: "center" }}>
              Conte a sua
              <br />
              história
            </p>
            {urlCurta ? <p style={{ fontSize: 20, opacity: 0.85, fontWeight: 600 }}>{urlCurta}</p> : null}
          </div>
        ) : (
          <span />
        )}
        <img src="/brand/taber-25.png" alt="" style={{ width: 300, height: "auto" }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Um relato                                                           */
/* ------------------------------------------------------------------ */
export function CenaRelato({
  categoria,
  texto,
  assinatura,
  imagem,
  layout,
  fase,
  transicaoMs,
  pagina,
  totalPaginas,
}: {
  categoria: Categoria;
  texto: string;
  assinatura: string | null;
  imagem: { url: string; largura: number; altura: number } | null;
  layout: LayoutRelato;
  fase: Fase;
  transicaoMs: number;
  pagina: number;
  totalPaginas: number;
}) {
  const col = layout.comImagem ? COLUNAS.textoComImagem : COLUNAS.textoSemImagem;
  // Entre telas do mesmo relato, só o texto troca: a categoria permanece.
  const faseCategoria: Fase =
    (fase === "saida" && pagina < totalPaginas - 1) || (fase === "entrada" && pagina > 0) ? "visivel" : fase;
  const foto = imagem ? encaixarImagem(imagem.largura, imagem.altura) : null;
  const estilo = { "--t": `${transicaoMs}ms` } as CSSProperties;

  return (
    <div className="absolute inset-0 text-white" style={estilo}>
      {imagem && foto ? (
        <div
          data-fase={faseCategoria}
          className="absolute flex items-center justify-center"
          style={{
            left: COLUNAS.imagem.x,
            width: COLUNAS.imagem.largura,
            top: (PALCO.altura - COLUNAS.imagem.altura) / 2,
            height: COLUNAS.imagem.altura,
          }}
        >
          <img
            src={imagem.url}
            alt=""
            className="tv-anim tv-foto"
            style={{
              width: foto.largura,
              height: foto.altura,
              objectFit: "cover",
              borderRadius: 28,
              boxShadow: "0 30px 80px rgba(46,23,41,.45)",
              outline: "6px solid rgba(255,255,255,.9)",
              outlineOffset: -1,
            }}
          />
        </div>
      ) : null}

      <div
        className="absolute flex flex-col justify-center"
        style={{ left: col.x, width: col.largura, top: AREA_SEGURA.y, height: AREA_SEGURA.altura, overflow: "visible" }}
      >
        <div data-fase={faseCategoria}>
          <h2
            className="tv-anim"
            style={{ fontSize: layout.tamanhoTitulo, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.012em", margin: 0, whiteSpace: "nowrap" }}
          >
            {INFO[categoria].tituloTela}
          </h2>
        </div>

        <div data-fase={fase} style={{ position: "relative", marginTop: 52 }}>
          {!layout.comImagem && (
            <span className="tv-anim tv-atraso-1" aria-hidden style={{ position: "absolute", left: -28, top: -layout.tamanhoFonte * 0.62 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 240,
                  lineHeight: 1,
                  fontWeight: 900,
                  opacity: 0.32,
                  transform: "translateX(-100%)",
                }}
              >
                “
              </span>
            </span>
          )}
          <p
            className="tv-anim tv-atraso-1"
            style={{
              fontSize: layout.tamanhoFonte,
              lineHeight: 1.24,
              fontWeight: 600,
              margin: 0,
              whiteSpace: "pre-line",
              textWrap: "pretty",
              textShadow: "0 2px 24px rgba(46,23,41,.25)",
            } as CSSProperties}
          >
            {texto}
          </p>

          {(assinatura || totalPaginas > 1) && (
            <div className="tv-anim tv-atraso-2 flex items-center" style={{ marginTop: 44, gap: 36 }}>
              {assinatura ? (
                <p style={{ fontSize: 46, fontWeight: 400, margin: 0, opacity: 0.92 }}>— {assinatura}</p>
              ) : null}
              {totalPaginas > 1 ? (
                <div className="flex" style={{ gap: 12 }} aria-hidden>
                  {Array.from({ length: totalPaginas }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: i === pagina ? 40 : 14,
                        height: 14,
                        borderRadius: 7,
                        background: "#fff",
                        opacity: i === pagina ? 0.95 : 0.4,
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tela de espera (sem relatos aprovados ou projeção pausada)          */
/* ------------------------------------------------------------------ */
export function CenaEspera({ transicaoMs }: { transicaoMs: number }) {
  const estilo = { "--t": `${transicaoMs}ms` } as CSSProperties;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white" style={estilo}>
      <div data-fase="visivel" className="flex flex-col items-center" style={{ gap: 56 }}>
        <p className="tv-anim" style={{ fontSize: 112, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.015em", margin: 0 }}>
          Você faz parte dessa história.
        </p>
        <p className="tv-anim tv-atraso-1" style={{ fontSize: 50, fontWeight: 400, margin: 0, opacity: 0.92 }}>
          25 anos. Uma história que continua sendo escrita.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Guias do modo técnico                                               */
/* ------------------------------------------------------------------ */
export function GuiasTecnicas({ comImagem }: { comImagem: boolean }) {
  const texto = comImagem ? COLUNAS.textoComImagem : COLUNAS.textoSemImagem;
  const caixa = (x: number, y: number, w: number, h: number, cor: string, rotulo: string) => (
    <div
      key={rotulo}
      style={{ position: "absolute", left: x, top: y, width: w, height: h, border: `3px dashed ${cor}` }}
    >
      <span style={{ position: "absolute", left: 8, top: 6, fontSize: 22, color: cor, fontFamily: "system-ui" }}>{rotulo}</span>
    </div>
  );
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {caixa(AREA_SEGURA.x, AREA_SEGURA.y, AREA_SEGURA.largura, AREA_SEGURA.altura, "#7CFFB2", "área segura")}
      {caixa(texto.x, AREA_SEGURA.y, texto.largura, AREA_SEGURA.altura, "#FFE07C", "texto")}
      {comImagem &&
        caixa(COLUNAS.imagem.x, (PALCO.altura - COLUNAS.imagem.altura) / 2, COLUNAS.imagem.largura, COLUNAS.imagem.altura, "#7CD3FF", "imagem")}
      {caixa(COLUNAS.lateralDireita.x, AREA_SEGURA.y, COLUNAS.lateralDireita.largura, AREA_SEGURA.altura, "#FF9CE0", "lateral")}
    </div>
  );
}
