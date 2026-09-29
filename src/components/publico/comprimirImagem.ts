/**
 * Reduz a foto no próprio celular antes do envio: menos dados móveis, envio mais rápido
 * e fotos HEIC do iPhone viram JPEG. Se o navegador não conseguir decodificar, envia o original.
 */
export async function comprimirImagem(arquivo: File, lado = 2000, qualidade = 0.85): Promise<File> {
  try {
    const bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" } as ImageBitmapOptions);
    const escala = Math.min(1, lado / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * escala);
    const h = Math.round(bitmap.height * escala);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return arquivo;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", qualidade));
    if (!blob) return arquivo;
    return new File([blob], "foto.jpg", { type: "image/jpeg" });
  } catch {
    return arquivo;
  }
}
