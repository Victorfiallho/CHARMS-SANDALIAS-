import { supabase } from "@/lib/supabase";
import SidebarNav from "./components/SidebarNav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, status, origem");

  const all = contacts ?? [];
  const STAGES = ["novo", "qualificado", "negociacao", "fechamento", "pos-venda"];
  const stageCounts = STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = all.filter((c) => c.status === s).length;
    return acc;
  }, {});

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <SidebarNav
          stageCounts={stageCounts}
          total={all.length}
          totalWpp={all.filter((c) => c.origem === "whatsapp").length}
          totalIg={all.filter((c) => c.origem === "instagram").length}
        />
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Global top bar */}
        <div className="global-topbar">
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.68rem", color: "#9CA3AF", fontWeight: 500 }}>Demo</span>
            <div style={{ width: 1, height: 12, background: "#E5E7EB" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <div style={{
                width: 22, height: 22, borderRadius: 4,
                background: "#111827",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.55rem", fontWeight: 800, color: "white", letterSpacing: "-0.5px",
              }}>
                CS
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#374151" }}>Charms Sandálias</span>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#16A34A" }} />
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
