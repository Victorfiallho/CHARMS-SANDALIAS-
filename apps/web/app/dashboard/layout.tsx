import { supabase } from "@/lib/supabase";
import SidebarNav from "./components/SidebarNav";

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
        {children}
      </div>
    </div>
  );
}
