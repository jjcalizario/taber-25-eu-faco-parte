/**
 * Limpeza de texto enviado pelo público.
 * O conteúdo é sempre guardado e exibido como TEXTO PURO (o React escapa na renderização),
 * mas removemos tags, caracteres de controle e espaços excessivos para manter o banco limpo.
 */
export function limparTexto(entrada: string, { multilinha = true } = {}): string {
  let t = entrada.normalize("NFC");
  t = t.replace(/<[^>]*>/g, " ");                          // tags HTML
  t = t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, ""); // controle e direcionais
  t = t.replace(/\r\n?/g, "\n");
  if (!multilinha) t = t.replace(/\n+/g, " ");
  t = t.replace(/[ \t]+/g, " ");
  t = t.replace(/ *\n */g, "\n");
  t = t.replace(/\n{3,}/g, "\n\n");
  return t.trim();
}

/** Remove caracteres que têm significado na sintaxe de filtros do PostgREST. */
export function limparBusca(q: string): string {
  return limparTexto(q, { multilinha: false }).replace(/[%,()*\\:"']/g, " ").slice(0, 80).trim();
}
