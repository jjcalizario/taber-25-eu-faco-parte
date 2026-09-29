import type { Categoria, Status } from "./categorias";

export type Relato = {
  id: string;
  categoria: Categoria;
  nome: string | null;
  relato: string;
  relato_original: string;
  anonimo: boolean;
  autorizacao_publicacao: boolean;
  status: Status;
  imagem_path: string | null;
  imagem_largura: number | null;
  imagem_altura: number | null;
  exibir_imagem: boolean;
  ativo_projecao: boolean;
  ordem_exibicao: number | null;
  demo: boolean;
  editado: boolean;
  data_envio: string;
  data_aprovacao: string | null;
  data_publicacao: string | null;
  updated_at: string;
};

export type ModoOrdem = "categorias" | "aleatorio" | "cronologico";

export type Configuracoes = {
  projecao_ativa: boolean;
  tempo_exibicao: number;
  ajuste_leitura: boolean;
  tempo_transicao: number;
  modo_ordem: ModoOrdem;
  categorias_ativas: Categoria[];
  mostrar_imagens: boolean;
  mostrar_nomes: boolean;
  mostrar_qrcode: boolean;
};

export const CONFIG_PADRAO: Configuracoes = {
  projecao_ativa: true,
  tempo_exibicao: 14,
  ajuste_leitura: true,
  tempo_transicao: 1200,
  modo_ordem: "categorias",
  categorias_ativas: ["gratidao", "milagre", "transformacao"],
  mostrar_imagens: true,
  mostrar_nomes: true,
  mostrar_qrcode: true,
};

/** O que a tela /tv recebe. Nunca inclui dados que não vão ao telão. */
export type ItemTv = {
  id: string;
  categoria: Categoria;
  /** "Nome", "Anônimo" ou null (quando os nomes estão desligados na configuração). */
  assinatura: string | null;
  texto: string;
  imagem: { url: string; largura: number; altura: number } | null;
  ordem: number | null;
  aprovadoEm: string | null;
};

export type FeedTv = {
  versao: string;
  geradoEm: string;
  config: Configuracoes;
  itens: ItemTv[];
};
