import Link from "next/link";
import { supabaseServico } from "@/lib/supabase/servico";
import { CATEGORIAS, INFO, STATUS, ROTULO_STATUS, isCategoria, isStatus } from "@/lib/categorias";
import { limparBusca } from "@/lib/sanitizar";
import { SeloCategoria, SeloStatus, formatarData } from "@/components/admin/Selos";

const POR_PAGINA = 40;
type Busca = { categoria?: string; status?: string; de?: string; ate?: string; q?: string; p?: string; excluido?: string };
const dataValida = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

export default async function ListaRelatos({ searchParams }: { searchParams: Promise<Busca> }) {
  const sp = await searchParams;
  const categoria = isCategoria(sp.categoria) ? sp.categoria : undefined;
  const status = isStatus(sp.status) ? sp.status : undefined;
  const de = dataValida(sp.de);
  const ate = dataValida(sp.ate);
  const q = sp.q ? limparBusca(sp.q) : "";
  const pagina = Math.max(1, Number(sp.p) || 1);

  let consulta = supabaseServico()
    .from("relatos")
    .select("id, categoria, nome, relato, anonimo, status, data_envio, imagem_path, autorizacao_publicacao, demo, editado", { count: "exact" })
    .order("data_envio", { ascending: false })
    .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
  if (categoria) consulta = consulta.eq("categoria", categoria);
  if (status) consulta = consulta.eq("status", status);
  if (de) consulta = consulta.gte("data_envio", `${de}T00:00:00-03:00`);
  if (ate) consulta = consulta.lte("data_envio", `${ate}T23:59:59-03:00`);
  if (q) consulta = consulta.or(`nome.ilike.%${q}%,relato.ilike.%${q}%`);

  const { data, count, error } = await consulta;
  const total = count ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const link = (p: number) => {
    const u = new URLSearchParams();
    if (categoria) u.set("categoria", categoria);
    if (status) u.set("status", status);
    if (de) u.set("de", de);
    if (ate) u.set("ate", ate);
    if (q) u.set("q", q);
    u.set("p", String(p));
    return `/admin/relatos?${u}`;
  };
  const campo = "h-11 rounded-xl border border-vinho/20 bg-white px-3 text-sm";

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Relatos</h1>
      {sp.excluido ? <p role="status" className="mt-3 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">Relato excluído.</p> : null}

      <form method="get" className="mt-6 grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]" role="search">
        <label className="flex flex-col gap-1 text-xs font-bold">
          Buscar por nome ou texto
          <input name="q" defaultValue={q} className={campo} placeholder="Ex.: Carla, UTI, perdão" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold">
          Categoria
          <select name="categoria" defaultValue={categoria ?? ""} className={campo}>
            <option value="">Todas</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{INFO[c].rotulo}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold">
          Status
          <select name="status" defaultValue={status ?? ""} className={campo}>
            <option value="">Todos</option>
            {STATUS.map((s) => <option key={s} value={s}>{ROTULO_STATUS[s]}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold">
          Enviado de
          <input type="date" name="de" defaultValue={de} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold">
          até
          <input type="date" name="ate" defaultValue={ate} className={campo} />
        </label>
        <div className="flex items-end gap-2">
          <button className="h-11 rounded-xl bg-vinho px-5 text-sm font-extrabold text-white">Filtrar</button>
          <Link href="/admin/relatos" className="grid h-11 place-items-center rounded-xl px-3 text-sm font-bold hover:bg-nevoa">Limpar</Link>
        </div>
      </form>

      <p className="mt-5 text-sm text-vinho/70" aria-live="polite">
        {error ? "Não foi possível carregar os relatos." : `${total} relato${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}`}
      </p>

      {data && data.length ? (
        <div className="mt-3 overflow-x-auto rounded-2xl bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <caption className="sr-only">Lista de relatos</caption>
            <thead className="border-b border-vinho/10 text-xs uppercase tracking-wide text-vinho/60">
              <tr>
                <th scope="col" className="px-4 py-3">Categoria</th>
                <th scope="col" className="px-4 py-3">Nome</th>
                <th scope="col" className="px-4 py-3">Relato</th>
                <th scope="col" className="px-4 py-3">Enviado</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b border-vinho/5 last:border-0 hover:bg-nevoa/60">
                  <td className="px-4 py-3 align-top"><SeloCategoria categoria={r.categoria} /></td>
                  <td className="px-4 py-3 align-top">
                    <span className="font-semibold">{r.nome || "Sem nome"}</span>
                    {r.anonimo ? <span className="block text-xs text-vinho/60">anônimo no telão</span> : null}
                  </td>
                  <td className="max-w-[420px] px-4 py-3 align-top">
                    <Link href={`/admin/relatos/${r.id}`} className="line-clamp-2 hover:underline">
                      {r.relato}
                    </Link>
                    <span className="mt-1 flex flex-wrap gap-2 text-xs text-vinho/60">
                      {r.imagem_path ? <span>📷 com foto</span> : null}
                      {!r.autorizacao_publicacao ? <span className="font-bold text-[#8f2322]">sem autorização</span> : null}
                      {r.editado ? <span>editado</span> : null}
                      {r.demo ? <span className="font-bold">DEMO</span> : null}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top tabular-nums">{formatarData(r.data_envio)}</td>
                  <td className="px-4 py-3 align-top"><SeloStatus status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !error ? (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-vinho/70">
          Nenhum relato com esses filtros. <Link href="/admin/relatos" className="font-bold underline">Ver todos</Link>
        </p>
      ) : null}

      {paginas > 1 ? (
        <nav aria-label="Paginação" className="mt-5 flex items-center justify-center gap-3 text-sm font-bold">
          {pagina > 1 ? <Link href={link(pagina - 1)} className="rounded-lg px-3 py-2 hover:bg-white">Anterior</Link> : null}
          <span>Página {pagina} de {paginas}</span>
          {pagina < paginas ? <Link href={link(pagina + 1)} className="rounded-lg px-3 py-2 hover:bg-white">Próxima</Link> : null}
        </nav>
      ) : null}
    </div>
  );
}
