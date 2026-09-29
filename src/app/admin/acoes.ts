"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirAdmin } from "@/lib/auth";
import { supabaseSessao } from "@/lib/supabase/server";
import { supabaseServico, BUCKET } from "@/lib/supabase/servico";
import { configSchema, edicaoSchema } from "@/lib/validacao";
import { isStatus, type Status } from "@/lib/categorias";

export type Resultado = { ok: boolean; mensagem: string };

/* ---------------- sessão ---------------- */
export async function entrar(_: Resultado | null, form: FormData): Promise<Resultado> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const senha = String(form.get("senha") ?? "");
  if (!email || !senha) return { ok: false, mensagem: "Informe e-mail e senha." };
  const sb = await supabaseSessao();
  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) return { ok: false, mensagem: "E-mail ou senha incorretos." };
  redirect("/admin");
}

export async function sair() {
  const sb = await supabaseSessao();
  await sb.auth.signOut();
  redirect("/admin/login");
}

/* ---------------- relatos ---------------- */
const idSchema = z.string().uuid();

function atualizarTelas(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/relatos");
  if (id) revalidatePath(`/admin/relatos/${id}`);
}

export async function mudarStatus(id: string, status: Status): Promise<Resultado> {
  await exigirAdmin();
  if (!idSchema.safeParse(id).success || !isStatus(status)) return { ok: false, mensagem: "Pedido inválido." };
  const sb = supabaseServico();
  const { data: r } = await sb.from("relatos").select("data_aprovacao, data_publicacao, autorizacao_publicacao").eq("id", id).single();
  const agora = new Date().toISOString();
  const patch: Record<string, unknown> = { status };
  if (status === "aprovado") {
    patch.data_aprovacao = agora;
    if (r?.autorizacao_publicacao && !r?.data_publicacao) patch.data_publicacao = agora;
  }
  const { error } = await sb.from("relatos").update(patch).eq("id", id);
  if (error) return { ok: false, mensagem: "Não foi possível alterar o status." };
  atualizarTelas(id);
  const msg: Record<Status, string> = {
    aprovado: r?.autorizacao_publicacao ? "Relato aprovado. Ele entra no telão no próximo ciclo." : "Relato aprovado, mas sem autorização de publicação: não vai ao telão.",
    rejeitado: "Relato rejeitado.",
    arquivado: "Relato arquivado.",
    pendente: "Relato voltou para pendentes.",
  };
  return { ok: true, mensagem: msg[status] };
}

export async function salvarEdicao(_: Resultado | null, form: FormData): Promise<Resultado> {
  await exigirAdmin();
  const parsed = edicaoSchema.safeParse({
    id: form.get("id"),
    relato: String(form.get("relato") ?? ""),
    nome: String(form.get("nome") ?? ""),
    categoria: form.get("categoria"),
    anonimo: String(form.get("anonimo") ?? "false"),
    ordem_exibicao: String(form.get("ordem_exibicao") ?? ""),
  });
  if (!parsed.success) return { ok: false, mensagem: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const d = parsed.data;
  const sb = supabaseServico();
  const { data: atual } = await sb.from("relatos").select("relato_original").eq("id", d.id).single();
  const { error } = await sb
    .from("relatos")
    .update({
      relato: d.relato,
      nome: d.nome || null,
      categoria: d.categoria,
      anonimo: d.anonimo,
      ordem_exibicao: d.ordem_exibicao,
      editado: atual ? d.relato !== atual.relato_original : true,
    })
    .eq("id", d.id);
  if (error) return { ok: false, mensagem: "Não foi possível salvar." };
  atualizarTelas(d.id);
  return { ok: true, mensagem: "Alterações salvas." };
}

export async function alternarCampo(
  id: string,
  campo: "ativo_projecao" | "exibir_imagem",
  valor: boolean
): Promise<Resultado> {
  await exigirAdmin();
  if (!idSchema.safeParse(id).success || !["ativo_projecao", "exibir_imagem"].includes(campo)) {
    return { ok: false, mensagem: "Pedido inválido." };
  }
  const { error } = await supabaseServico().from("relatos").update({ [campo]: !!valor }).eq("id", id);
  if (error) return { ok: false, mensagem: "Não foi possível alterar." };
  atualizarTelas(id);
  return { ok: true, mensagem: "Atualizado." };
}

export async function removerImagem(id: string): Promise<Resultado> {
  await exigirAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, mensagem: "Pedido inválido." };
  const sb = supabaseServico();
  const { data: r } = await sb.from("relatos").select("imagem_path").eq("id", id).single();
  if (r?.imagem_path) await sb.storage.from(BUCKET).remove([r.imagem_path]);
  await sb.from("relatos").update({ imagem_path: null, imagem_largura: null, imagem_altura: null }).eq("id", id);
  atualizarTelas(id);
  return { ok: true, mensagem: "Imagem apagada." };
}

export async function excluirRelato(id: string): Promise<Resultado> {
  await exigirAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, mensagem: "Pedido inválido." };
  const sb = supabaseServico();
  const { data: r } = await sb.from("relatos").select("imagem_path").eq("id", id).single();
  if (r?.imagem_path) await sb.storage.from(BUCKET).remove([r.imagem_path]);
  const { error } = await sb.from("relatos").delete().eq("id", id);
  if (error) return { ok: false, mensagem: "Não foi possível excluir." };
  atualizarTelas();
  redirect("/admin/relatos?excluido=1");
}

/* ---------------- configurações ---------------- */
export async function salvarConfiguracoes(_: Resultado | null, form: FormData): Promise<Resultado> {
  await exigirAdmin();
  const parsed = configSchema.safeParse({
    projecao_ativa: String(form.get("projecao_ativa") ?? "false"),
    tempo_exibicao: form.get("tempo_exibicao"),
    ajuste_leitura: String(form.get("ajuste_leitura") ?? "false"),
    tempo_transicao: form.get("tempo_transicao"),
    modo_ordem: form.get("modo_ordem"),
    categorias_ativas: form.getAll("categorias_ativas").map(String),
    mostrar_imagens: String(form.get("mostrar_imagens") ?? "false"),
    mostrar_nomes: String(form.get("mostrar_nomes") ?? "false"),
    mostrar_qrcode: String(form.get("mostrar_qrcode") ?? "false"),
  });
  if (!parsed.success) return { ok: false, mensagem: parsed.error.issues[0]?.message ?? "Valores inválidos." };
  const { error } = await supabaseServico().from("configuracoes").update(parsed.data).eq("id", 1);
  if (error) return { ok: false, mensagem: "Não foi possível salvar." };
  revalidatePath("/admin/configuracoes");
  return { ok: true, mensagem: "Configurações salvas. O telão aplica em até 10 segundos." };
}
