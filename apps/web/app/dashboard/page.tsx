import { supabase } from "@/lib/supabase";
import KanbanBoard from "./components/KanbanBoard";

export const dynamic = "force-dynamic";

const STAGE_ORDER = ["novo", "qualificado", "negociacao", "fechamento", "pos-venda"] as const;

function statColor(status: string) {
  const map: Record<string, string> = {
    novo: "#6b7280",
    qualificado: "#3b82f6",
    negociacao: "#f59e0b",
    fechamento: "#10b981",
    "pos-venda": "#8b5cf6",
  };
  return map[status] ?? "#6b7280";
}

export default async function DashboardPage() {
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("last_seen_at", { ascending: false });

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        Erro ao carregar contatos: {error.message}
      </div>
    );
  }

  const all = contacts ?? [];

  const counts = STAGE_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = all.filter((c) => c.status === s).length;
    return acc;
  }, {});

  const labels: Record<string, string> = {
    novo: "Novo",
    qualificado: "Qualificado",
    negociacao: "Negociação",
    fechamento: "Fechamento",
    "pos-venda": "Pós-venda",
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--color-brand-gold, #c9a84c)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem"
          }}>
            👡
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }}>
              Charms
            </div>
            <div style={{ color: "var(--color-sidebar-item)", fontSize: "0.7rem" }}>
              Sandálias CRM
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-link active">📋 Pipeline</a>
          <a href="#" className="nav-link" style={{ opacity: 0.4, cursor: "not-allowed" }}>📊 Relatórios</a>
          <a href="#" className="nav-link" style={{ opacity: 0.4, cursor: "not-allowed" }}>⚙️ Configurações</a>
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ color: "var(--color-sidebar-item)", fontSize: "0.7rem", marginBottom: "0.5rem" }}>
            Resumo do funil
          </div>
          {STAGE_ORDER.map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ color: "var(--color-sidebar-item)", fontSize: "0.75rem" }}>
                {labels[s]}
              </span>
              <span style={{
                background: statColor(s),
                color: "white",
                fontSize: "0.65rem",
                fontWeight: 700,
                borderRadius: "999px",
                padding: "0.05rem 0.45rem"
              }}>
                {counts[s]}
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "0.875rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
              Pipeline de Vendas
            </h1>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#6b7280" }}>
              {all.length} contatos ativos
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {STAGE_ORDER.map((s) => (
              <div key={s} style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "0.3rem 0.65rem",
                textAlign: "center",
                minWidth: 56,
              }}>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: statColor(s) }}>
                  {counts[s]}
                </div>
                <div style={{ fontSize: "0.62rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {labels[s].slice(0, 4)}
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* Board */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <KanbanBoard contacts={all} />
        </div>
      </div>
    </div>
  );
}
