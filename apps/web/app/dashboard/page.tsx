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
  const novos       = all.filter((c) => c.status === "novo").length;
  const negociacao  = all.filter((c) => c.status === "negociacao").length;
  const qualificado = all.filter((c) => c.status === "qualificado").length;
  const fechados    = all.filter((c) => c.status === "fechamento" || c.status === "pos-venda").length;

  const kpis = [
    { label: "Total",        value: all.length,   color: "#0f172a" },
    { label: "Novos",        value: novos,         color: "#64748b" },
    { label: "Qualificados", value: qualificado,   color: "#3b82f6" },
    { label: "Negociação",   value: negociacao,    color: "#f59e0b" },
    { label: "Fechados",     value: fechados,      color: "#10b981" },
  ];

  return (
    <>
      <header className="page-header">
        <div style={{ marginRight: "auto" }}>
          <h1 className="page-header-title">Pipeline de Vendas</h1>
          <p className="page-header-sub" style={{ textTransform: "capitalize" }}>{todayLabel()}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 2, background: "#f8fafc", borderRadius: 10, padding: "0.2rem", border: "1px solid #e2e8f0" }}>
          {kpis.map((k, i) => (
            <div
              key={k.label}
              style={{
                padding: "0.3rem 0.875rem",
                borderRadius: 8,
                textAlign: "center",
                background: i === 0 ? "white" : "transparent",
                boxShadow: i === 0 ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
                minWidth: 56,
              }}
            >
              <div style={{ fontSize: "1rem", fontWeight: 800, color: k.color, lineHeight: 1, letterSpacing: "-0.5px" }}>
                {k.value}
              </div>
              <div style={{ fontSize: "0.58rem", color: "#94a3b8", marginTop: 2, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {k.label}
              </div>
            </div>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <KanbanBoard contacts={all} />
      </div>
    </>
  );
}
