import { supabase } from "@/lib/supabase";
import KanbanBoard from "./components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("last_seen_at", { ascending: false });

  if (error) {
    return <div style={{ padding: "2rem", color: "#ef4444" }}>Erro: {error.message}</div>;
  }

  const all = contacts ?? [];

  return (
    <>
      <header style={{
        background: "white", borderBottom: "1px solid #e2e8f0",
        padding: "0 1.5rem", height: 60, flexShrink: 0,
        display: "flex", alignItems: "center",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
            Pipeline de Vendas
          </h1>
          <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8", marginTop: 1 }}>
            {all.length} contatos ativos
          </p>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <KanbanBoard contacts={all} />
      </div>
    </>
  );
}
