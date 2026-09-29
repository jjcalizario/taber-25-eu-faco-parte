"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", rotulo: "Visão geral" },
  { href: "/admin/relatos", rotulo: "Relatos" },
  { href: "/admin/configuracoes", rotulo: "Telão" },
];

export function NavPainel() {
  const path = usePathname();
  return (
    <nav aria-label="Painel" className="flex gap-1 text-sm font-bold">
      {LINKS.map((l) => {
        const ativo = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={ativo ? "page" : undefined}
            className={`rounded-lg px-3 py-2 ${ativo ? "bg-vinho text-white" : "hover:bg-nevoa"}`}
          >
            {l.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
