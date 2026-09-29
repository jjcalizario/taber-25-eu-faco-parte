import { INFO, ROTULO_STATUS, type Categoria, type Status } from "@/lib/categorias";

const COR_STATUS: Record<Status, string> = {
  pendente: "bg-aurora/40 text-[#7a3f12]",
  aprovado: "bg-emerald-100 text-emerald-900",
  rejeitado: "bg-brasa/15 text-[#8f2322]",
  arquivado: "bg-vinho/10 text-vinho/80",
};
const COR_CATEGORIA: Record<Categoria, string> = {
  gratidao: "bg-cobre/15 text-[#7a3f12]",
  milagre: "bg-brasa/15 text-[#8f2322]",
  transformacao: "bg-violeta/15 text-[#4a3460]",
};

export function SeloStatus({ status }: { status: Status }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${COR_STATUS[status]}`}>{ROTULO_STATUS[status]}</span>;
}
export function SeloCategoria({ categoria }: { categoria: Categoria }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${COR_CATEGORIA[categoria]}`}>
      {INFO[categoria].emoji} {INFO[categoria].rotulo}
    </span>
  );
}

export const formatarData = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(iso))
    : "—";
