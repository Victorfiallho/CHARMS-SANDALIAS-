import { supabase } from "@/lib/supabase";
import KanbanBoard from "./components/KanbanBoard";

export const dynamic = "force-dynamic";

const STAGES = [
  { key: "novo",        label: "Novo",        color: "#64748b" },
  { key: "qualificado", label: "Qualificado", color: "#3b82f6" },
  { key: "negociacao",  label: "Negociação",  color: "#f59e0b" },
  { key: "fechamento",  label: "Fechamento",  color: "#10b981" },
  { key: "pos-venda",   label: "Pós-venda",   color: "#8b5cf6" },
] as const;

export default async function DashboardPage() {
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("last_seen_at", { ascending: false });

  if (error) {
    return <div style={{ padding: "2rem", color: "#ef4444" }}>Erro: {error.message}</div>;
  }

  const all = contacts ?? [];
  const counts = STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = all.filter((c) => c.status === s.key).length;
    return acc;
  }, {});

  return (
    <>
      <header style={{
        background: "white", borderBottom: "1px solid #e2e8f0",
        padding: "0 1.5rem", height: 60, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
            Pipeline de Vendas
          </h1>
          <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8", marginTop: 1 }}>
            {all.length} contatos ativos
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          {STAGES.map((s) => (
            <div key={s.key} style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              background: `${s.color}12`, border: `1px solid ${s.color}30`,
              borderRadius: 8, padding: "0.28rem 0.55rem",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, display: "inline-block" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: s.color }}>{counts[s.key]}</span>
            </div>
          ))}
          <div style={{ width: 1, height: 22, background: "#e2e8f0", margin: "0 0.2rem" }} />
          <button disabled title="Em breve" style={{
            display: "flex", alignItems: "center", gap: "0.35rem",
            background: "#0f172a", color: "white", border: "none", borderRadius: 8,
            padding: "0.42rem 0.85rem", fontSize: "0.78rem", fontWeight: 600,
            cursor: "not-allowed", opacity: 0.45, fontFamily: "inherit",
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            Novo contato
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <KanbanBoard contacts={all} />
      </div>
    </>
  );
}
