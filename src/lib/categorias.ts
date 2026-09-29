export const CATEGORIAS = ["gratidao", "milagre", "transformacao"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const STATUS = ["pendente", "aprovado", "rejeitado", "arquivado"] as const;
export type Status = (typeof STATUS)[number];

type InfoCategoria = {
  slug: Categoria;
  emoji: string;
  titulo: string;        // como aparece na página pública
  tituloTela: string;    // como aparece no LED
  chamada: string;       // frase curta da escolha
  perguntaForm: string;  // título do formulário
  dicaForm: string;
  rotulo: string;        // nome curto no painel
};

export const INFO: Record<Categoria, InfoCategoria> = {
  gratidao: {
    slug: "gratidao",
    emoji: "🙏",
    titulo: "Eu sou grato",
    tituloTela: "EU SOU GRATO.",
    chamada: "Compartilhe algo pelo qual você é grato ao Taber.",
    perguntaForm: "Pelo que você é grato?",
    dicaForm: "Uma pessoa, um momento, um culto, uma fase da sua vida nesta casa.",
    rotulo: "Gratidão",
  },
  milagre: {
    slug: "milagre",
    emoji: "✨",
    titulo: "Eu vivi um milagre",
    tituloTela: "EU VIVI UM MILAGRE.",
    chamada: "Conte um milagre que Deus fez na sua vida.",
    perguntaForm: "Qual milagre Deus fez na sua vida?",
    dicaForm: "Uma cura, uma porta aberta, uma oração respondida.",
    rotulo: "Milagre",
  },
  transformacao: {
    slug: "transformacao",
    emoji: "❤️",
    titulo: "Eu vivi uma transformação",
    tituloTela: "EU VIVI UMA TRANSFORMAÇÃO.",
    chamada: "Conte algo que Deus transformou na sua vida.",
    perguntaForm: "O que Deus transformou em você?",
    dicaForm: "Como era antes, e o que mudou depois.",
    rotulo: "Transformação",
  },
};

export const ROTULO_STATUS: Record<Status, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  arquivado: "Arquivado",
};

export function isCategoria(v: unknown): v is Categoria {
  return typeof v === "string" && (CATEGORIAS as readonly string[]).includes(v);
}
export function isStatus(v: unknown): v is Status {
  return typeof v === "string" && (STATUS as readonly string[]).includes(v);
}
