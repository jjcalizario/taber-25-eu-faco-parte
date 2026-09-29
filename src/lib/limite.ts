/**
 * Limite simples de envios por IP (em memória, por instância).
 * Suficiente para conter abuso casual vindo de QR Code; para tráfego maior,
 * troque por Upstash/Redis sem mudar a interface.
 */
const janelas = new Map<string, number[]>();

export function permitirEnvio(chave: string, max = 5, janelaMs = 10 * 60 * 1000): boolean {
  const agora = Date.now();
  const lista = (janelas.get(chave) ?? []).filter((t) => agora - t < janelaMs);
  if (lista.length >= max) {
    janelas.set(chave, lista);
    return false;
  }
  lista.push(agora);
  janelas.set(chave, lista);
  if (janelas.size > 5000) janelas.clear();
  return true;
}
