import { supabase } from "@/lib/supabase";
import KanbanBoard from "./components/KanbanBoard";

export const dynamic = "force-dynamic";

function todayLabel() {
  return new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

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
      <header className="page-header">
        <div>
          <h1 className="page-header-title">Pipeline de Vendas</h1>
          <p className="page-header-sub" style={{ textTransform: "capitalize" }}>{todayLabel()}</p>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <KanbanBoard contacts={all} />
      </div>
    </>
  );
}
