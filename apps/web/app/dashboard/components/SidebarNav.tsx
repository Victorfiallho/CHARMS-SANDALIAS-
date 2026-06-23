"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

type Props = {
  stageCounts: Record<string, number>;
  total: number;
  totalWpp: number;
  totalIg: number;
};

const Icons = {
  pipeline: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="3" width="4" height="14" rx="1"/>
      <rect x="8" y="3" width="4" height="10" rx="1"/>
      <rect x="14" y="3" width="4" height="6" rx="1"/>
    </svg>
  ),
  contacts: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path d="M2 17a7 7 0 0114 0"/>
    </svg>
  ),
  reports: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 17L7 11l4 3 4-6 2-2"/>
    </svg>
  ),
  settings: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="2.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"/>
    </svg>
  ),
};

const NAV = [
  { href: "/dashboard",               label: "Pipeline",      icon: Icons.pipeline },
  { href: "/dashboard/contatos",      label: "Contatos",      icon: Icons.contacts },
  { href: "/dashboard/relatorios",    label: "Relatórios",    icon: Icons.reports  },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Icons.settings },
];

export default function SidebarNav({ stageCounts, total }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">C</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">Charms</div>
          <div className="sidebar-logo-sub">CRM</div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-section-label" style={{ marginTop: "1rem" }}>Menu</div>
      <nav className="sidebar-nav">
        {NAV.map(({ href, label, icon }) => (
          <Link key={href} href={href} className={`nav-link${isActive(href) ? " active" : ""}`}>
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      {/* Sumário de pipeline — compacto, no rodapé */}
      <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="sidebar-section-label" style={{ marginTop: 0, marginBottom: "0.5rem" }}>
          Pipeline
        </div>
        {[
          { key: "novo",        label: "Novo",        color: "#6B7280" },
          { key: "qualificado", label: "Qualificado", color: "#1D4ED8" },
          { key: "negociacao",  label: "Negociação",  color: "#A16207" },
          { key: "fechamento",  label: "Fechamento",  color: "#15803D" },
          { key: "pos-venda",   label: "Pós-venda",   color: "#374151" },
        ].map((s) => {
          const pct = total ? Math.round((stageCounts[s.key] ?? 0) / total * 100) : 0;
          return (
            <div key={s.key} style={{ marginBottom: "0.4rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.15rem" }}>
                <span style={{ fontSize: "0.68rem", color: "rgba(148,163,184,0.7)", fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: "0.65rem", color: s.color, fontWeight: 700 }}>{stageCounts[s.key] ?? 0}</span>
              </div>
              <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: s.color, borderRadius: 99 }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
