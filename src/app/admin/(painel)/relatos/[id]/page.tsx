import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServico } from "@/lib/supabase/servico";
import { lerConfiguracoes } from "@/lib/servidor/feed";
import type { Relato } from "@/lib/types";
import { EditorRelato } from "./EditorRelato";

export default async function DetalheRelato({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ data }, config] = await Promise.all([
    supabaseServico().from("relatos").select("*").eq("id", id).maybeSingle(),
    lerConfiguracoes(),
  ]);
  if (!data) notFound();
  const relato = data as Relato;

  return (
    <div>
      <Link href="/admin/relatos" className="text-sm font-bold text-vinho/70 hover:underline">← Voltar para relatos</Link>
      <EditorRelato
        relato={relato}
        urlImagem={relato.imagem_path ? `/api/admin/imagem/${relato.id}?v=${encodeURIComponent(relato.updated_at)}` : null}
        mostrarNomes={config.mostrar_nomes}
        mostrarImagens={config.mostrar_imagens}
      />
    </div>
  );
}
