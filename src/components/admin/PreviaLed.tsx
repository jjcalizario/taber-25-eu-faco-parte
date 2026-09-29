"use client";

import { useEffect, useState } from "react";
import { Palco } from "@/components/tv/Palco";
import { CenaRelato, FundoTv, GuiasTecnicas, type Fase } from "@/components/tv/Cena";
import { calcularLayout, duracaoPagina } from "@/lib/tv-layout";
import { INFO, type Categoria } from "@/lib/categorias";

/** Mostra exatamente como o relato ficará no LED (mesmos componentes da /tv). */
export function PreviaLed({
  categoria,
  texto,
  assinatura,
  imagem,
}: {
  categoria: Categoria;
  texto: string;
  assinatura: string | null;
  imagem: { url: string; largura: number; altura: number } | null;
}) {
  const layout = calcularLayout(texto, !!imagem, INFO[categoria].tituloTela);
  const [pagina, setPagina] = useState(0);
  const [guias, setGuias] = useState(false);
  const fase: Fase = "visivel";
  const p = Math.min(pagina, layout.paginas.length - 1);
  useEffect(() => setPagina(0), [texto]);

  const segundos = Math.round(layout.paginas.reduce((s, pg) => s + duracaoPagina(pg, 14, true), 0) / 1000);

  return (
    <div>
      <div className="overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "2688 / 1008" }}>
        <Palco>
          <FundoTv categoria={categoria} transicaoMs={600} />
          <CenaRelato
            categoria={categoria}
            texto={layout.paginas[p] ?? ""}
            assinatura={assinatura}
            imagem={imagem}
            layout={layout}
            fase={fase}
            transicaoMs={600}
            pagina={p}
            totalPaginas={layout.paginas.length}
          />
          {guias ? <GuiasTecnicas comImagem={layout.comImagem} /> : null}
        </Palco>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className={layout.paginas.length > 1 ? "font-bold text-[#7a3f12]" : "text-vinho/70"}>
          {layout.paginas.length > 1
            ? `Texto longo: aparece em ${layout.paginas.length} telas (≈${segundos}s). Considere encurtar.`
            : `Cabe em uma tela · fonte ${layout.tamanhoFonte}px no LED · ≈${segundos}s`}
        </span>
        {layout.paginas.length > 1 ? (
          <span className="flex gap-1" role="group" aria-label="Telas da prévia">
            {layout.paginas.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPagina(i)}
                aria-pressed={i === p}
                className={`h-8 min-w-8 rounded-lg px-2 font-bold ${i === p ? "bg-vinho text-white" : "bg-white"}`}
              >
                {i + 1}
              </button>
            ))}
          </span>
        ) : null}
        <label className="ml-auto flex items-center gap-2 text-vinho/70">
          <input type="checkbox" checked={guias} onChange={(e) => setGuias(e.target.checked)} className="accent-malva" />
          Mostrar área segura
        </label>
      </div>
    </div>
  );
}
