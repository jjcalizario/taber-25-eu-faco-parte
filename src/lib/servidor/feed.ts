import "server-only";
import { createHash } from "node:crypto";
import { supabaseServico } from "@/lib/supabase/servico";
import { CONFIG_PADRAO, type Configuracoes, type FeedTv, type ItemTv } from "@/lib/types";

export async function lerConfiguracoes(): Promise<Configuracoes & { updated_at?: string }> {
  const { data } = await supabaseServico().from("configuracoes").select("*").eq("id", 1).maybeSingle();
  return { ...CONFIG_PADRAO, ...(data ?? {}) };
}

/**
 * Monta o que a tela /tv pode ver. Filtros obrigatórios:
 * status aprovado + autorização de publicação + ativo na projeção + categoria ativa.
 */
export async function montarFeed(): Promise<FeedTv> {
  const config = await lerConfiguracoes();
  let itens: ItemTv[] = [];
  let assinaturaVersao = "";

  if (config.projecao_ativa && config.categorias_ativas.length) {
    const { data, error } = await supabaseServico()
      .from("relatos")
      .select("id, categoria, nome, relato, anonimo, imagem_path, imagem_largura, imagem_altura, exibir_imagem, ordem_exibicao, data_aprovacao, updated_at")
      .eq("status", "aprovado")
      .eq("autorizacao_publicacao", true)
      .eq("ativo_projecao", true)
      .in("categoria", config.categorias_ativas)
      .order("data_aprovacao", { ascending: true })
      .limit(500);
    if (error) throw error;

    itens = (data ?? []).map((r) => {
      const temImagem = config.mostrar_imagens && r.exibir_imagem && r.imagem_path && r.imagem_largura && r.imagem_altura;
      return {
        id: r.id,
        categoria: r.categoria,
        assinatura: !config.mostrar_nomes ? null : r.anonimo || !r.nome ? "Anônimo" : r.nome,
        texto: r.relato,
        imagem: temImagem
          ? {
              url: `/api/tv/imagem/${r.id}?v=${encodeURIComponent(r.updated_at)}`,
              largura: r.imagem_largura!,
              altura: r.imagem_altura!,
            }
          : null,
        ordem: r.ordem_exibicao,
        aprovadoEm: r.data_aprovacao,
      };
    });
    assinaturaVersao = (data ?? []).map((r) => `${r.id}:${r.updated_at}`).join("|");
  }

  const versao = createHash("sha1")
    .update(JSON.stringify(config) + assinaturaVersao)
    .digest("hex")
    .slice(0, 16);

  return { versao, geradoEm: new Date().toISOString(), config, itens };
}
