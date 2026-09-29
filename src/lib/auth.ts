import "server-only";
import { redirect } from "next/navigation";
import { supabaseSessao } from "./supabase/server";
import { supabaseServico } from "./supabase/servico";

/** Garante que existe um usuário logado E que o e-mail dele está na tabela admins. */
export async function exigirAdmin() {
  const sb = await supabaseSessao();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user?.email) redirect("/admin/login");

  const { data: admin } = await supabaseServico()
    .from("admins")
    .select("email, nome")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (!admin) {
    await sb.auth.signOut();
    redirect("/admin/login?erro=acesso");
  }
  return { email: admin.email as string, nome: (admin.nome as string | null) ?? null };
}
