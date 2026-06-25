import SidebarNav from "./components/SidebarNav";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <SidebarNav />
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Global top bar */}
        <div className="global-topbar">
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "#4A3535" }}>Charms Sandálias</span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#16A34A", flexShrink: 0 }} />
            <LogoutButton />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
