import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { envioSchema, LIMITE_IMAGEM_BYTES } from "@/lib/validacao";
import { supabaseServico, BUCKET } from "@/lib/supabase/servico";
import { permitirEnvio } from "@/lib/limite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEMPO_MINIMO_MS = 4000; // bots preenchem formulários instantaneamente

function erro(mensagem: string, status = 400, campos?: Record<string, string>) {
  return NextResponse.json({ erro: mensagem, campos }, { status });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anon";
  if (!permitirEnvio(ip)) {
    return erro("Recebemos muitos envios deste aparelho em pouco tempo. Tente novamente em alguns minutos.", 429);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return erro("Não conseguimos ler o envio. Tente novamente.");
  }

  // Armadilhas anti-robô: campo invisível preenchido ou envio rápido demais → finge sucesso e descarta.
  const iniciadoEm = Number(form.get("_t") ?? 0);
  if (String(form.get("site") ?? "") !== "" || (iniciadoEm && Date.now() - iniciadoEm < TEMPO_MINIMO_MS)) {
    return NextResponse.json({ ok: true });
  }

  const parsed = envioSchema.safeParse({
    categoria: form.get("categoria"),
    nome: String(form.get("nome") ?? ""),
    relato: String(form.get("relato") ?? ""),
    anonimo: String(form.get("anonimo") ?? "false"),
    autorizacao: String(form.get("autorizacao") ?? "false"),
  });
  if (!parsed.success) {
    const campos: Record<string, string> = {};
    parsed.error.issues.forEach((i) => {
      const k = String(i.path[0] ?? "geral");
      campos[k] ??= i.message;
    });
    return erro("Revise os campos destacados.", 422, campos);
  }
  const d = parsed.data;

  // ---------- imagem opcional ----------
  const arquivo = form.get("imagem");
  let imagem: { path: string; largura: number; altura: number; buffer: Buffer } | null = null;

  if (arquivo instanceof File && arquivo.size > 0) {
    if (arquivo.size > LIMITE_IMAGEM_BYTES) {
      return erro("A imagem é muito grande.", 422, { imagem: "Envie uma imagem de até 10 MB." });
    }
    try {
      const entrada = Buffer.from(await arquivo.arrayBuffer());
      const meta = await sharp(entrada, { failOn: "error" }).metadata();
      if (!meta.format || !["jpeg", "png", "webp", "heif"].includes(meta.format)) throw new Error("formato");
      // Reprocessa: corrige rotação, limita tamanho e REMOVE metadados (inclui localização GPS do celular).
      const { data, info } = await sharp(entrada, { failOn: "error" })
        .rotate()
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 86, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });
      imagem = { path: `${d.categoria}/${randomUUID()}.jpg`, largura: info.width, altura: info.height, buffer: data };
    } catch {
      return erro("Não conseguimos abrir essa imagem.", 422, { imagem: "Use uma foto JPG, PNG ou WEBP." });
    }
  }

  const sb = supabaseServico();

  if (imagem) {
    const { error } = await sb.storage.from(BUCKET).upload(imagem.path, imagem.buffer, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) {
      console.error("upload imagem", error);
      return erro("Não conseguimos salvar a imagem. Tente enviar sem ela ou tente de novo.", 500);
    }
  }

  const { error } = await sb.from("relatos").insert({
    categoria: d.categoria,
    nome: d.nome || null,
    relato: d.relato,
    relato_original: d.relato,
    anonimo: d.anonimo,
    autorizacao_publicacao: d.autorizacao,
    status: "pendente",
    imagem_path: imagem?.path ?? null,
    imagem_largura: imagem?.largura ?? null,
    imagem_altura: imagem?.altura ?? null,
  });

  if (error) {
    console.error("insert relato", error);
    if (imagem) await sb.storage.from(BUCKET).remove([imagem.path]);
    return erro("Não conseguimos salvar seu relato agora. Tente novamente em instantes.", 500);
  }

  return NextResponse.json({ ok: true });
}
