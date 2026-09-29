import Link from "next/link";
import { supabaseServico } from "@/lib/supabase/servico";
import { CATEGORIAS, INFO, STATUS, ROTULO_STATUS, type Categoria, type Status } from "@/lib/categorias";

export default async function VisaoGeral() {
  const { data } = await supabaseServico().from("relatos").select("status, categoria, autorizacao_publicacao, ativo_projecao");
  const linhas = data ?? [];
  const porStatus = Object.fromEntries(STATUS.map((s) => [s, 0])) as Record<Status, number>;
  const porCategoria = Object.fromEntries(CATEGORIAS.map((c) => [c, 0])) as Record<Categoria, number>;
  let noTelao = 0;
  linhas.forEach((r) => {
    porStatus[r.status as Status]++;
    porCategoria[r.categoria as Categoria]++;
    if (r.status === "aprovado" && r.autorizacao_publicacao && r.ativo_projecao) noTelao++;
  });

  const CORES_STATUS: Record<Status, string> = {
    pendente: "border-l-cobre",
    aprovado: "border-l-emerald-600",
    rejeitado: "border-l-brasa",
    arquivado: "border-l-vinho/40",
  };

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="t-status">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 id="t-status" className="text-3xl font-extrabold">Visão geral</h1>
            <p className="mt-1 text-vinho/70">
              {linhas.length} relatos recebidos · {noTelao} rodando no telão agora
            </p>
          </div>
          {porStatus.pendente > 0 ? (
            <Link href="/admin/relatos?status=pendente" className="rounded-xl bg-vinho px-5 py-3 font-extrabold text-white">
              Revisar {porStatus.pendente} pendente{porStatus.pendente > 1 ? "s" : ""}
            </Link>
          ) : null}
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-2xl bg-vinho p-5 text-white">
            <dt className="text-sm font-semibold text-white/75">Total</dt>
            <dd className="mt-1 text-4xl font-extrabold tabular-nums">{linhas.length}</dd>
          </div>
          {STATUS.map((s) => (
            <Link key={s} href={`/admin/relatos?status=${s}`} className={`rounded-2xl border-l-[6px] bg-white p-5 hover:shadow-md ${CORES_STATUS[s]}`}>
              <dt className="text-sm font-semibold text-vinho/70">{ROTULO_STATUS[s]}</dt>
              <dd className="mt-1 text-4xl font-extrabold tabular-nums">{porStatus[s]}</dd>
            </Link>
          ))}
        </dl>
      </section>

      <section aria-labelledby="t-cat">
        <h2 id="t-cat" className="text-xl font-extrabold">Por experiência</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {CATEGORIAS.map((c) => (
            <Link
              key={c}
              href={`/admin/relatos?categoria=${c}`}
              className="superficie-25 relative overflow-hidden rounded-2xl p-5 text-white"
              data-categoria={c}
            >
              <span className="absolute inset-0 bg-vinho/25" aria-hidden />
              <dt className="relative font-bold">{INFO[c].emoji} {INFO[c].rotulo}</dt>
              <dd className="relative mt-1 text-4xl font-extrabold tabular-nums">{porCategoria[c]}</dd>
            </Link>
          ))}
        </dl>
      </section>

      <section className="flex flex-wrap gap-3">
        <a href="/tv" target="_blank" rel="noopener" className="rounded-xl border-2 border-vinho px-5 py-3 font-bold">Abrir /tv</a>
        <a href="/tv?tecnico=1" target="_blank" rel="noopener" className="rounded-xl border-2 border-vinho/30 px-5 py-3 font-bold">Abrir /tv no modo técnico</a>
        <a href="/25anos" target="_blank" rel="noopener" className="rounded-xl border-2 border-vinho/30 px-5 py-3 font-bold">Ver página pública</a>
      </section>
    </div>
  );
}
