"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const Icons = {
  pipeline: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="3" width="4" height="14" rx="1"/>
      <rect x="8" y="3" width="4" height="10" rx="1"/>
      <rect x="14" y="3" width="4" height="6" rx="1"/>
    </svg>
  ),
  inbox: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 3h16a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1z"/>
      <path d="M1 13l4-4h10l4 4"/>
    </svg>
  ),
  contacts: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path d="M2 17a7 7 0 0114 0"/>
    </svg>
  ),
  catalogo: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="2" width="7" height="7" rx="1"/>
      <rect x="11" y="2" width="7" height="7" rx="1"/>
      <rect x="2" y="11" width="7" height="7" rx="1"/>
      <rect x="11" y="11" width="7" height="7" rx="1"/>
    </svg>
  ),
  automacoes: (
    <svg className="nav-link-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M10 2v4M10 14v4M2 10h4M14 10h4"/>
      <circle cx="10" cy="10" r="3"/>
      <path d="M4.93 4.93l2.83 2.83M12.24 12.24l2.83 2.83M4.93 15.07l2.83-2.83M12.24 7.76l2.83-2.83"/>
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

const NAV_GROUPS = [
  {
    label: "Atendimento",
    items: [
      { href: "/dashboard",          label: "Pipeline",    icon: Icons.pipeline  },
      { href: "/dashboard/inbox",    label: "Inbox",       icon: Icons.inbox     },
      { href: "/dashboard/contatos", label: "Contatos",    icon: Icons.contacts  },
    ],
  },
  {
    label: "Operações",
    items: [
      { href: "/dashboard/catalogo",    label: "Catálogo",    icon: Icons.catalogo    },
      { href: "/dashboard/automacoes",  label: "Automações",  icon: Icons.automacoes  },
      { href: "/dashboard/relatorios",  label: "Relatórios",  icon: Icons.reports     },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/dashboard/configuracoes", label: "Configurações", icon: Icons.settings },
    ],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <>
      {/* Logo */}
      <div className="sidebar-logo" style={{ justifyContent: "center", paddingBottom: "0.75rem" }}>
        <Image
          src="/logo-charms.png"
          alt="Charms Sandálias"
          width={140}
          height={140}
          style={{ width: 130, height: "auto", objectFit: "contain", mixBlendMode: "multiply" }}
          priority
        />
      </div>

      {/* Nav */}
      <nav style={{ marginTop: "0.875rem", flex: 1 }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: "0.5rem" }}>
            <div className="sidebar-section-label">{group.label}</div>
            <div className="sidebar-nav">
              {group.items.map(({ href, label, icon }) => (
                <Link key={href} href={href} className={`nav-link${isActive(href) ? " active" : ""}`}>
                  {icon}
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}
