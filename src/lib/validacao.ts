import { z } from "zod";
import { CATEGORIAS } from "./categorias";
import { limparTexto } from "./sanitizar";

export const LIMITE_RELATO = 1500;
export const MINIMO_RELATO = 20;
export const LIMITE_NOME = 80;
export const LIMITE_IMAGEM_BYTES = 10 * 1024 * 1024;
export const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

const bool = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === "true" || v === "on" || v === "1");

export const envioSchema = z
  .object({
    categoria: z.enum(CATEGORIAS),
    nome: z.string().max(200).default("").transform((v) => limparTexto(v, { multilinha: false })),
    relato: z.string().max(LIMITE_RELATO * 2).transform((v) => limparTexto(v)),
    anonimo: bool.default(false),
    autorizacao: bool.default(false),
  })
  .superRefine((d, ctx) => {
    if (!d.anonimo && d.nome.length < 2)
      ctx.addIssue({ code: "custom", path: ["nome"], message: "Escreva seu nome, ou marque a opção de envio anônimo." });
    if (d.nome.length > LIMITE_NOME)
      ctx.addIssue({ code: "custom", path: ["nome"], message: `Use no máximo ${LIMITE_NOME} caracteres.` });
    if (d.relato.length < MINIMO_RELATO)
      ctx.addIssue({ code: "custom", path: ["relato"], message: `Conte um pouco mais. O relato precisa de pelo menos ${MINIMO_RELATO} caracteres.` });
    if (d.relato.length > LIMITE_RELATO)
      ctx.addIssue({ code: "custom", path: ["relato"], message: `O relato pode ter até ${LIMITE_RELATO} caracteres.` });
  });

export const configSchema = z.object({
  projecao_ativa: bool,
  tempo_exibicao: z.coerce.number().int().min(5).max(120),
  ajuste_leitura: bool,
  tempo_transicao: z.coerce.number().int().min(200).max(5000),
  modo_ordem: z.enum(["categorias", "aleatorio", "cronologico"]),
  categorias_ativas: z.array(z.enum(CATEGORIAS)).min(1, "Escolha pelo menos uma categoria."),
  mostrar_imagens: bool,
  mostrar_nomes: bool,
  mostrar_qrcode: bool,
});

export const edicaoSchema = z.object({
  id: z.string().uuid(),
  relato: z.string().transform((v) => limparTexto(v)).pipe(z.string().min(MINIMO_RELATO).max(2000)),
  nome: z.string().max(200).transform((v) => limparTexto(v, { multilinha: false })).pipe(z.string().max(LIMITE_NOME)),
  categoria: z.enum(CATEGORIAS),
  anonimo: bool,
  ordem_exibicao: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(100000)])
    .transform((v) => (v === "" ? null : v)),
});
