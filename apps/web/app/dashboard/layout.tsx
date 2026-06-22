import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "white" }}>Charms Sandálias</div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.2rem" }}>CRM Omnichannel</div>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="nav-link">Pipeline</Link>
        </nav>
      </aside>
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}
