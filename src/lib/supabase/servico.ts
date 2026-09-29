import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com a chave service role. SOMENTE no servidor.
 * Usado pelas rotas públicas (envio e feed da /tv), que fazem a própria validação e filtragem,
 * e pelo painel depois de exigirAdmin().
 */
export function supabaseServico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variáveis do Supabase não configuradas. Veja .env.example.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const BUCKET = "relatos";
