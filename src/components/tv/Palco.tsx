"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { PALCO } from "@/lib/tv-layout";

/**
 * Palco de 2688 × 1008 escalado proporcionalmente para o espaço disponível.
 * Nunca estica: usa a menor escala entre largura e altura e centraliza (sobra vira faixa preta).
 */
export function Palco({
  children,
  onEscala,
  className = "",
}: {
  children: ReactNode;
  onEscala?: (escala: number) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => {
      const r = el.getBoundingClientRect();
      const e = Math.min(r.width / PALCO.largura, r.height / PALCO.altura);
      setEscala(e);
      onEscala?.(e);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onEscala]);

  return (
    <div ref={ref} className={`relative h-full w-full overflow-hidden bg-black ${className}`}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: PALCO.largura,
          height: PALCO.altura,
          transform: `translate(-50%, -50%) scale(${escala})`,
          transformOrigin: "center center",
          visibility: escala ? "visible" : "hidden",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
