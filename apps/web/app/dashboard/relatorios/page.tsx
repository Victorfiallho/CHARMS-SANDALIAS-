import { supabase } from "@/lib/supabase";
import { STAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: "white", borderRadius: 4, padding: "1rem 1.25rem",
      border: "1px solid #EDE5E2",
    }}>
      <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "#9A7878", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "1.6rem", fontWeight: 800, color: color ?? "#1A1010", lineHeight: 1, letterSpacing: "-0.04em" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "0.68rem", color: "#9A7878", marginTop: "0.35rem" }}>{sub}</div>}
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

  const totalContacts = all.length;
  const totalWpp      = all.filter((c) => c.origem === "whatsapp").length;
  const totalIg       = all.filter((c) => c.origem === "instagram").length;
  const fechamentos   = all.filter((c) => c.status === "fechamento" || c.status === "pos-venda").length;
  const taxaConv      = totalContacts ? Math.round((fechamentos / totalContacts) * 100) : 0;

  const stageCounts = STAGES.map((s) => ({
    ...s,
    count: all.filter((c) => c.status === s.key).length,
  }));
  const maxStage = Math.max(...stageCounts.map((s) => s.count), 1);

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
      <header className="page-header">
        <div>
          <h1 className="page-header-title">Relatórios</h1>
          <p className="page-header-sub">Visão geral do CRM</p>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: "1.25rem", background: "#FAF9F6" }}>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
          <KpiCard label="Total de Contatos"  value={totalContacts} sub="em todos os estágios" />
          <KpiCard label="Fechamentos"        value={fechamentos}   sub="fechamento + pós-venda" color="#15803D" />
          <KpiCard label="Taxa de Conversão"  value={`${taxaConv}%`} sub="novos → fechamento" color="#7B84B8" />
          <KpiCard label="Mensagens Trocadas" value={msgs.length}
            sub={`${msgs.filter((m) => m.direction === "inbound").length} recebidas · ${msgs.filter((m) => m.direction === "outbound").length} enviadas`} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>

          {/* Funil */}
          <div style={{ background: "white", borderRadius: 4, padding: "1rem 1.25rem", border: "1px solid #EDE5E2" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <h2 style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, color: "#1A1010", letterSpacing: "-0.01em" }}>Funil de Conversão</h2>
              <span style={{ fontSize: "0.65rem", color: "#9A7878" }}>{totalContacts} total</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {stageCounts.map((s) => {
                  const pct = Math.round((s.count / maxStage) * 100);
                  const share = totalContacts ? Math.round((s.count / totalContacts) * 100) : 0;
                  return (
                    <tr key={s.key} style={{ borderBottom: "1px solid #F5F2EF" }}>
                      <td style={{ padding: "0.5rem 0", width: 90 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.72rem", color: "#4A3535", fontWeight: 500 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block", flexShrink: 0 }} />
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        <div style={{ height: 4, background: "#F5F2EF", borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: s.color, borderRadius: 2, transition: "width 0.4s ease" }} />
                        </div>
                      </td>
                      <td style={{ padding: "0.5rem 0", width: 28, textAlign: "right" }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: s.color }}>{s.count}</span>
                      </td>
                      <td style={{ padding: "0.5rem 0 0.5rem 0.5rem", width: 36, textAlign: "right" }}>
                        <span style={{ fontSize: "0.65rem", color: "#9A7878" }}>{share}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Distribuição por Canal */}
          <div style={{ background: "white", borderRadius: 4, padding: "1rem 1.25rem", border: "1px solid #EDE5E2" }}>
            <h2 style={{ margin: "0 0 0.875rem", fontSize: "0.78rem", fontWeight: 700, color: "#1A1010", letterSpacing: "-0.01em" }}>
              Distribuição por Canal
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #EDE5E2" }}>
                  {["Canal", "Contatos", "% do Total"].map((h) => (
                    <th key={h} style={{ padding: "0.375rem 0", textAlign: "left", fontSize: "0.62rem", fontWeight: 600, color: "#9A7878", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "WhatsApp", count: totalWpp, color: "#15803D" },
                  { label: "Instagram", count: totalIg, color: "#9D174D" },
                ].map((ch) => {
                  const pct = totalContacts ? Math.round(ch.count / totalContacts * 100) : 0;
                  return (
                    <tr key={ch.label} style={{ borderBottom: "1px solid #F5F2EF" }}>
                      <td style={{ padding: "0.625rem 0" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#4A3535", fontWeight: 500 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: ch.color, display: "inline-block" }} />
                          {ch.label}
                        </span>
                      </td>
                      <td style={{ padding: "0.625rem 0", fontSize: "0.78rem", fontWeight: 700, color: "#1A1010" }}>{ch.count}</td>
                      <td style={{ padding: "0.625rem 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ flex: 1, height: 3, background: "#F5F2EF", borderRadius: 2 }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: ch.color, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: "0.68rem", color: "#9A7878", width: 30, textAlign: "right" }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ marginTop: "0.875rem", paddingTop: "0.75rem", borderTop: "1px solid #F5F2EF", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.68rem", color: "#9A7878", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#1A1010" }}>{totalContacts}</span>
            </div>
          </div>
        </div>

        {/* Mensagens por dia */}
        <div style={{ background: "white", borderRadius: 4, padding: "1rem 1.25rem", border: "1px solid #EDE5E2" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
            <h2 style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, color: "#1A1010", letterSpacing: "-0.01em" }}>
              Volume de Mensagens — últimos 7 dias
            </h2>
            <div style={{ display: "flex", gap: "0.875rem" }}>
              {[{ color: "#7B84B8", label: "Recebidas" }, { color: "#15803D", label: "Enviadas" }].map((l) => (
                <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.65rem", color: "#7A6868" }}>
                  <span style={{ width: 8, height: 3, borderRadius: 1, background: l.color, display: "inline-block" }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", height: 120 }}>
            {msgsByDay.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", width: "100%", gap: 1 }}>
                  <div title={`${d.outbound} enviadas`} style={{
                    width: "100%",
                    height: maxMsgs > 0 ? `${Math.round((d.outbound / maxMsgs) * 90)}%` : 0,
                    minHeight: d.outbound > 0 ? 3 : 0,
                    background: "#15803D",
                    borderRadius: "2px 2px 0 0",
                  }} />
                  <div title={`${d.inbound} recebidas`} style={{
                    width: "100%",
                    height: maxMsgs > 0 ? `${Math.round((d.inbound / maxMsgs) * 90)}%` : 0,
                    minHeight: d.inbound > 0 ? 3 : 0,
                    background: "#7B84B8",
                    borderRadius: d.outbound > 0 ? "0 0 2px 2px" : "2px",
                  }} />
                </div>
                <div style={{ fontSize: "0.6rem", color: "#9A7878", textAlign: "center" }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
