import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const STAGES = [
  { key: "novo",        label: "Novo",        color: "#64748b" },
  { key: "qualificado", label: "Qualificado", color: "#3b82f6" },
  { key: "negociacao",  label: "Negociação",  color: "#f59e0b" },
  { key: "fechamento",  label: "Fechamento",  color: "#10b981" },
  { key: "pos-venda",   label: "Pós-venda",   color: "#8b5cf6" },
];

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "1.25rem 1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: color ?? "#0f172a", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.4rem" }}>{sub}</div>}
    </div>
  );
}

function dayLabel(d: Date) {
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" });
}

export default async function RelatoriosPage() {
  const [{ data: contacts }, { data: messages }] = await Promise.all([
    supabase.from("contacts").select("id, status, origem, created_at"),
    supabase.from("messages").select("id, direction, canal, timestamp").order("timestamp", { ascending: true }),
  ]);

  const all = contacts ?? [];
  const msgs = messages ?? [];

  // KPIs
  const totalContacts = all.length;
  const totalWpp      = all.filter((c) => c.origem === "whatsapp").length;
  const totalIg       = all.filter((c) => c.origem === "instagram").length;
  const fechamentos   = all.filter((c) => c.status === "fechamento" || c.status === "pos-venda").length;
  const taxaConv      = totalContacts ? Math.round((fechamentos / totalContacts) * 100) : 0;

  // Stage counts
  const stageCounts = STAGES.map((s) => ({
    ...s,
    count: all.filter((c) => c.status === s.key).length,
  }));
  const maxStage = Math.max(...stageCounts.map((s) => s.count), 1);

  // Messages per day — last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const msgsByDay = days.map((d) => {
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayMsgs = msgs.filter((m) => {
      const t = new Date(m.timestamp);
      return t >= d && t < next;
    });
    return {
      label: dayLabel(d),
      inbound:  dayMsgs.filter((m) => m.direction === "inbound").length,
      outbound: dayMsgs.filter((m) => m.direction === "outbound").length,
      total: dayMsgs.length,
    };
  });
  const maxMsgs = Math.max(...msgsByDay.map((d) => d.total), 1);

  return (
    <>
      <header style={{
        background: "white", borderBottom: "1px solid #e2e8f0",
        padding: "0 1.5rem", height: 60, flexShrink: 0,
        display: "flex", alignItems: "center",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Relatórios</h1>
          <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8", marginTop: 1 }}>Visão geral do CRM</p>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: "1.5rem", background: "#f8fafc" }}>
        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          <KpiCard label="Total de Contatos"  value={totalContacts} sub="em todos os estágios" />
          <KpiCard label="Fechamentos"        value={fechamentos}   sub="fechamento + pós-venda" color="#10b981" />
          <KpiCard label="Taxa de Conversão"  value={`${taxaConv}%`} sub="novos → fechamento"   color="#3b82f6" />
          <KpiCard label="Mensagens Trocadas" value={msgs.length}   sub={`${msgs.filter((m) => m.direction === "inbound").length} recebidas · ${msgs.filter((m) => m.direction === "outbound").length} enviadas`} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          {/* Funil */}
          <div style={{ background: "white", borderRadius: 12, padding: "1.25rem 1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
              Funil de Conversão
            </h2>
            {stageCounts.map((s) => (
              <div key={s.key} style={{ marginBottom: "0.875rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: s.color }}>{s.count}</span>
                </div>
                <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99 }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.round((s.count / maxStage) * 100)}%`,
                    background: s.color, borderRadius: 99,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Canal */}
          <div style={{ background: "white", borderRadius: 12, padding: "1.25rem 1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
              Distribuição por Canal
            </h2>

            {/* Donut-like visual */}
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "1.25rem" }}>
              <div style={{ position: "relative", width: 100, height: 100 }}>
                <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.5"/>
                  {totalContacts > 0 && (
                    <>
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#4ade80" strokeWidth="3.5"
                        strokeDasharray={`${(totalWpp / totalContacts) * 100} ${100 - (totalWpp / totalContacts) * 100}`}
                        strokeDashoffset="0"
                      />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f472b6" strokeWidth="3.5"
                        strokeDasharray={`${(totalIg / totalContacts) * 100} ${100 - (totalIg / totalContacts) * 100}`}
                        strokeDashoffset={`${-((totalWpp / totalContacts) * 100)}`}
                      />
                    </>
                  )}
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>{totalContacts}</span>
                  <span style={{ fontSize: "0.58rem", color: "#94a3b8" }}>total</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {[
                  { label: "WhatsApp", count: totalWpp, color: "#4ade80", pct: totalContacts ? Math.round(totalWpp / totalContacts * 100) : 0 },
                  { label: "Instagram", count: totalIg, color: "#f472b6", pct: totalContacts ? Math.round(totalIg / totalContacts * 100) : 0 },
                ].map((ch) => (
                  <div key={ch.label} style={{ marginBottom: "0.875rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: ch.color, display: "inline-block" }} />
                        {ch.label}
                      </span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }}>{ch.count} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({ch.pct}%)</span></span>
                    </div>
                    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99 }}>
                      <div style={{ height: "100%", width: `${ch.pct}%`, background: ch.color, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mensagens por dia */}
        <div style={{ background: "white", borderRadius: 12, padding: "1.25rem 1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
            Mensagens — últimos 7 dias
          </h2>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", height: 140 }}>
            {msgsByDay.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", width: "100%", gap: 2 }}>
                  <div title={`${d.outbound} enviadas`} style={{
                    width: "100%",
                    height: maxMsgs > 0 ? `${Math.round((d.outbound / maxMsgs) * 90)}%` : 0,
                    minHeight: d.outbound > 0 ? 4 : 0,
                    background: "#10b981",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.4s ease",
                  }} />
                  <div title={`${d.inbound} recebidas`} style={{
                    width: "100%",
                    height: maxMsgs > 0 ? `${Math.round((d.inbound / maxMsgs) * 90)}%` : 0,
                    minHeight: d.inbound > 0 ? 4 : 0,
                    background: "#3b82f6",
                    borderRadius: d.outbound > 0 ? "0 0 4px 4px" : "4px",
                    transition: "height 0.4s ease",
                  }} />
                </div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", textAlign: "center" }}>{d.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.875rem" }}>
            {[{ color: "#3b82f6", label: "Recebidas" }, { color: "#10b981", label: "Enviadas" }].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: "inline-block" }} />
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
