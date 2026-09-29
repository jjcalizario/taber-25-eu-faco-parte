import type { Categoria } from "@/lib/categorias";
import type { ItemTv, ModoOrdem } from "@/lib/types";

const ORDEM_CATEGORIAS: Categoria[] = ["gratidao", "milagre", "transformacao"];

function cronologica(a: ItemTv, b: ItemTv) {
  const oa = a.ordem ?? Number.MAX_SAFE_INTEGER;
  const ob = b.ordem ?? Number.MAX_SAFE_INTEGER;
  if (oa !== ob) return oa - ob;
  return (a.aprovadoEm ?? "").localeCompare(b.aprovadoEm ?? "");
}

function embaralhar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Monta um ciclo completo de exibição. */
export function montarFila(itens: ItemTv[], modo: ModoOrdem, ultimoExibido?: string | null): string[] {
  let fila: ItemTv[];
  if (modo === "aleatorio") fila = embaralhar(itens);
  else if (modo === "cronologico") fila = [...itens].sort(cronologica);
  else {
    // Alterna as experiências: grato → milagre → transformação → grato…
    const grupos = ORDEM_CATEGORIAS.map((c) => itens.filter((i) => i.categoria === c).sort(cronologica));
    fila = [];
    const maior = Math.max(0, ...grupos.map((g) => g.length));
    for (let i = 0; i < maior; i++) grupos.forEach((g) => g[i] && fila.push(g[i]));
  }
  const ids = fila.map((i) => i.id);
  // evita repetir o mesmo relato na virada do ciclo
  if (ids.length > 1 && ids[0] === ultimoExibido) ids.push(ids.shift()!);
  return ids;
}
