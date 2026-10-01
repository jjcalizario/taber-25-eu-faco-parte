/**
 * Composição da tela de LED.
 * Todas as medidas estão em "pixels de design" de um palco 2688 × 1008 (proporção 2,67:1),
 * que depois é escalado proporcionalmente para qualquer janela — nada é esticado.
 */
export const PALCO = { largura: 2688, altura: 1008 } as const;
export const PROPORCAO_REFERENCIA = PALCO.largura / PALCO.altura; // 2,666…

/** Área segura: nenhum texto importante sai daqui. */
export const AREA_SEGURA = { x: 200, y: 96, largura: 2288, altura: 816 } as const;

/** Colunas da composição (x inicial e largura). */
export const COLUNAS = {
  lateralEsquerda: { x: 0, largura: 520 },          // grafismo do 25 (coração)
  textoSemImagem: { x: 560, largura: 1540 },
  imagem: { x: 290, largura: 680, altura: 700 },   // área máxima da foto
  textoComImagem: { x: 1050, largura: 1090 },
  lateralDireita: { x: 2188, largura: 300 },        // QR Code + assinatura da campanha
} as const;

const ALTURA_BLOCO = 780;              // altura útil do bloco (título + relato + assinatura) dentro da área segura
const ENTRELINHA = 1.24;
const LARGURA_MEDIA_CARACTERE = 0.54;  // Proxima Nova Semibold ≈ 0,52em; margem extra para fontes substitutas
const TAMANHOS = [92, 82, 74, 66, 60, 54, 50, 46, 42]; // reduz a fonte antes de dividir em telas
const TAMANHO_PAGINADO = 38;                            // só divide se nem em 42px couber

export type LayoutRelato = {
  comImagem: boolean;
  tamanhoTitulo: number;
  tamanhoFonte: number;
  larguraTexto: number;
  paginas: string[];
};

function linhasNecessarias(texto: string, caracteresPorLinha: number): number {
  return texto
    .split("\n")
    .reduce((soma, par) => soma + Math.max(1, Math.ceil(par.trim().length / caracteresPorLinha)), 0);
}

/** Título da categoria sempre em uma linha: reduz até caber na coluna. */
export function tamanhoTitulo(titulo: string, largura: number): number {
  const ideal = 88;
  const larguraEstimada = titulo.length * 0.68 * ideal; // Extrabold em caixa alta ≈ 0,62em
  return Math.max(54, Math.min(ideal, Math.floor((ideal * largura) / larguraEstimada)));
}

function capacidade(tamanho: number, largura: number, alturaTexto: number) {
  const cpl = Math.floor((largura / (tamanho * LARGURA_MEDIA_CARACTERE)) * 0.94); // margem para quebra de palavras
  const linhas = Math.floor(alturaTexto / (tamanho * ENTRELINHA));
  return { cpl, linhas };
}

/** Divide em frases sem alterar nenhuma palavra do texto. */
function frases(texto: string): string[] {
  const out: string[] = [];
  texto.split("\n").forEach((par, i, arr) => {
    const partes = par.match(/[^.!?…]+(?:[.!?…]+["”»')]*)?\s*/g) ?? [par];
    partes.forEach((p) => p.trim() && out.push(p.trim()));
    if (i < arr.length - 1 && out.length) out[out.length - 1] += "\n";
  });
  return out;
}

function paginar(texto: string, cpl: number, maxLinhas: number): string[] {
  const paginas: string[] = [];
  let atual = "";
  const cabe = (t: string) => linhasNecessarias(t, cpl) <= maxLinhas;
  const juntar = (a: string, b: string) => (a === "" ? b : a.endsWith("\n") ? a + b : a + " " + b);

  for (const frase of frases(texto)) {
    const tentativa = juntar(atual, frase);
    if (cabe(tentativa)) {
      atual = tentativa;
      continue;
    }
    if (atual) paginas.push(atual.trim());
    atual = "";
    if (cabe(frase)) {
      atual = frase;
      continue;
    }
    // frase maior que uma tela inteira: quebra por palavras
    for (const palavra of frase.split(/\s+/)) {
      const t = juntar(atual, palavra);
      if (cabe(t)) atual = t;
      else {
        paginas.push(atual.trim());
        atual = palavra;
      }
    }
  }
  if (atual.trim()) paginas.push(atual.trim());
  return paginas;
}

export function calcularLayout(texto: string, comImagem: boolean, titulo = "EU VIVI UMA TRANSFORMAÇÃO."): LayoutRelato {
  const largura = comImagem ? COLUNAS.textoComImagem.largura : COLUNAS.textoSemImagem.largura;
  const tituloPx = tamanhoTitulo(titulo, largura);
  // desconta título, espaço entre blocos e assinatura
  const alturaTexto = ALTURA_BLOCO - tituloPx - 52 - 44 - 56;
  const base = { comImagem, tamanhoTitulo: tituloPx, larguraTexto: largura };
  for (const tamanho of TAMANHOS) {
    const { cpl, linhas } = capacidade(tamanho, largura, alturaTexto);
    if (linhasNecessarias(texto, cpl) <= linhas) return { ...base, tamanhoFonte: tamanho, paginas: [texto] };
  }
  const { cpl, linhas } = capacidade(TAMANHO_PAGINADO, largura, alturaTexto);
  return { ...base, tamanhoFonte: TAMANHO_PAGINADO, paginas: paginar(texto, cpl, linhas) };
}

/** Tempo de cada tela: o mínimo configurado, mais tempo de leitura para textos longos (~3 palavras/s à distância). */
export function duracaoPagina(pagina: string, tempoBase: number, ajusteLeitura: boolean): number {
  if (!ajusteLeitura) return tempoBase * 1000;
  const palavras = pagina.split(/\s+/).filter(Boolean).length;
  return Math.max(tempoBase, 3 + palavras / 3) * 1000;
}

/** Dimensões da foto dentro da área reservada, preservando a proporção original. */
export function encaixarImagem(largura: number, altura: number) {
  const { largura: maxL, altura: maxA } = COLUNAS.imagem;
  const escala = Math.min(maxL / largura, maxA / altura);
  return { largura: Math.round(largura * escala), altura: Math.round(altura * escala) };
}
