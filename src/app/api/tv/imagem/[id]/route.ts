import { NextResponse } from "next/server";
import { supabaseServico, BUCKET } from "@/lib/supabase/servico";

export const dynamic = "force-dynamic";

/** Entrega a imagem de um relato SOMENTE se ele estiver liberado para o telão. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse(null, { status: 404 });

  const sb = supabaseServico();
  const { data: r } = await sb
    .from("relatos")
    .select("imagem_path, exibir_imagem, status, autorizacao_publicacao, ativo_projecao")
    .eq("id", id)
    .maybeSingle();

  if (!r?.imagem_path || !r.exibir_imagem || r.status !== "aprovado" || !r.autorizacao_publicacao || !r.ativo_projecao) {
    return new NextResponse(null, { status: 404 });
  }

  const { data: arquivo, error } = await sb.storage.from(BUCKET).download(r.imagem_path);
  if (error || !arquivo) return new NextResponse(null, { status: 404 });

  return new NextResponse(arquivo.stream(), {
    headers: {
      "Content-Type": "image/jpeg",
      // URL leva ?v=updated_at: qualquer alteração gera uma URL nova
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
