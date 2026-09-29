import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/auth";
import { supabaseServico, BUCKET } from "@/lib/supabase/servico";

export const dynamic = "force-dynamic";

/** Imagem de qualquer relato (inclusive pendente), apenas para administradores. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse(null, { status: 404 });

  const sb = supabaseServico();
  const { data: r } = await sb.from("relatos").select("imagem_path").eq("id", id).maybeSingle();
  if (!r?.imagem_path) return new NextResponse(null, { status: 404 });

  const { data: arquivo } = await sb.storage.from(BUCKET).download(r.imagem_path);
  if (!arquivo) return new NextResponse(null, { status: 404 });

  return new NextResponse(arquivo.stream(), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=300" },
  });
}
