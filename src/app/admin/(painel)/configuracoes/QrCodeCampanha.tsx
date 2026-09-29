"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** QR Code da URL curta, pronto para baixar e aplicar nas peças impressas. */
export function QrCodeCampanha({ base }: { base: string }) {
  const [url, setUrl] = useState("");
  const [svg, setSvg] = useState("");
  const [png, setPng] = useState("");

  useEffect(() => {
    const u = `${(base || window.location.origin).replace(/\/$/, "")}/25anos`;
    setUrl(u);
    const opcoes = { margin: 2, errorCorrectionLevel: "H" as const, color: { dark: "#2E1729", light: "#FFFFFF" } };
    QRCode.toString(u, { ...opcoes, type: "svg" }).then(setSvg);
    QRCode.toDataURL(u, { ...opcoes, width: 2000 }).then(setPng);
  }, [base]);

  return (
    <div className="rounded-2xl bg-white p-5">
      <h2 className="font-extrabold">QR Code da campanha</h2>
      <p className="mt-1 break-all text-sm text-vinho/70">{url}</p>
      {svg ? <div className="mx-auto mt-4 w-48" dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label={`QR Code para ${url}`} /> : null}
      <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
        {svg ? (
          <a download="qrcode-taber-25anos.svg" href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} className="rounded-xl border-2 border-vinho/25 px-4 py-2.5">
            Baixar SVG (gráfica)
          </a>
        ) : null}
        {png ? (
          <a download="qrcode-taber-25anos.png" href={png} className="rounded-xl border-2 border-vinho/25 px-4 py-2.5">
            Baixar PNG
          </a>
        ) : null}
      </div>
    </div>
  );
}
