import { lerConfiguracoes } from "@/lib/servidor/feed";
import { FormConfiguracoes } from "./FormConfiguracoes";
import { QrCodeCampanha } from "./QrCodeCampanha";

export default async function Configuracoes() {
  const config = await lerConfiguracoes();
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_1fr]">
      <section>
        <h1 className="text-3xl font-extrabold">Telão</h1>
        <p className="mt-1 text-vinho/70">Tudo aqui vale para a tela /tv em até 10 segundos, sem recarregar o navegador do técnico.</p>
        <FormConfiguracoes config={config} />
      </section>
      <aside className="flex flex-col gap-6">
        <div className="rounded-2xl bg-white p-5">
          <h2 className="font-extrabold">Abrir a projeção</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-vinho/80">
            <li>No computador ligado ao LED, abra o endereço /tv.</li>
            <li>Pressione F (ou dê duplo clique) para tela cheia.</li>
            <li>Envie essa tela para o processador do LED.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
            <a href="/tv" target="_blank" rel="noopener" className="rounded-xl bg-vinho px-4 py-2.5 text-white">Abrir /tv</a>
            <a href="/tv?tecnico=1" target="_blank" rel="noopener" className="rounded-xl border-2 border-vinho/25 px-4 py-2.5">Modo técnico</a>
          </div>
          <p className="mt-3 text-xs text-vinho/60">No /tv: Shift+T mostra o modo técnico, Shift+G mostra a área segura.</p>
        </div>
        <QrCodeCampanha base={base} />
      </aside>
    </div>
  );
}
