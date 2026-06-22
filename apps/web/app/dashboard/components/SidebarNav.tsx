"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const STAGES = [
  { key: "novo",        label: "Novo",        color: "#64748b" },
  { key: "qualificado", label: "Qualificado", color: "#3b82f6" },
  { key: "negociacao",  label: "Negociação",  color: "#f59e0b" },
  { key: "fechamento",  label: "Fechamento",  color: "#10b981" },
  { key: "pos-venda",   label: "Pós-venda",   color: "#8b5cf6" },
];

type Props = {
  stageCounts: Record<string, number>;
  total: number;
  totalWpp: number;
  totalIg: number;
};

const Icons = {
  pipeline: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="currentColor">
      <rect x="1" y="3"  width="5" height="14" rx="1.5"/>
      <rect x="8" y="3"  width="5" height="10" rx="1.5"/>
      <rect x="15" y="3" width="4" height="6"  rx="1.5"/>
    </svg>
  ),
  contacts: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
    </svg>
  ),
  reports: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3 17L7 11l4 3 4-6 2-2"/>
      <circle cx="7" cy="11" r="1" fill="currentColor" stroke="none"/>
      <circle cx="11" cy="14" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  settings: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="3"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/>
    </svg>
  ),
};

const NAV = [
  { href: "/dashboard",               label: "Pipeline",        icon: Icons.pipeline  },
  { href: "/dashboard/contatos",      label: "Contatos",        icon: Icons.contacts  },
  { href: "/dashboard/relatorios",    label: "Relatórios",      icon: Icons.reports   },
  { href: "/dashboard/configuracoes", label: "Configurações",   icon: Icons.settings  },
];

export default function SidebarNav({ stageCounts, total, totalWpp, totalIg }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">CS</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">Charms</div>
          <div className="sidebar-logo-sub">Sandálias · CRM</div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-section-label">Menu</div>
      <nav className="sidebar-nav">
        {NAV.map(({ href, label, icon }) => (
          <Link key={href} href={href} className={`nav-link${isActive(href) ? " active" : ""}`}>
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      {/* Funil */}
      <div style={{ marginTop: "auto" }}>
        <div className="sidebar-section-label" style={{ marginTop: 0, marginBottom: "0.625rem" }}>
          Funil hoje
        </div>
        {STAGES.map((s) => {
          const pct = total ? Math.round((stageCounts[s.key] ?? 0) / total * 100) : 0;
          return (
            <div key={s.key} style={{ marginBottom: "0.55rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                <span style={{ fontSize: "0.73rem", color: "rgba(148,163,184,0.85)", fontWeight: 500 }}>
                  {s.label}
                </span>
                <span style={{ fontSize: "0.7rem", color: s.color, fontWeight: 700 }}>
                  {stageCounts[s.key] ?? 0}
                </span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: s.color, borderRadius: 99 }} />
              </div>
            </div>
          );
        })}

        {/* Canal pills */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.875rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "0.4rem 0.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#4ade80" }}>{totalWpp}</div>
            <div style={{ fontSize: "0.6rem", color: "rgba(148,163,184,0.55)", marginTop: 1 }}>WhatsApp</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "0.4rem 0.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f472b6" }}>{totalIg}</div>
            <div style={{ fontSize: "0.6rem", color: "rgba(148,163,184,0.55)", marginTop: 1 }}>Instagram</div>
          </div>
        </div>
      </div>
    </>
  );
}
