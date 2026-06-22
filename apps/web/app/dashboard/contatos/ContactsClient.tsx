"use client";

import { useState, useMemo } from "react";
import ConversationView from "../components/ConversationView";

type Contact = {
  id: string;
  nome: string;
  telefone: string | null;
  instagram_id: string | null;
  origem: string;
  status: string;
  tags: string[];
  created_at: string;
  last_seen_at: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  novo:        "#64748b",
  qualificado: "#3b82f6",
  negociacao:  "#f59e0b",
  fechamento:  "#10b981",
  "pos-venda": "#8b5cf6",
};

const STATUS_LABEL: Record<string, string> = {
  novo:        "Novo",
  qualificado: "Qualificado",
  negociacao:  "Negociação",
  fechamento:  "Fechamento",
  "pos-venda": "Pós-venda",
};

function fmtPhone(tel: string) {
  const m = tel.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}` : tel;
}

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "agora";
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

function Avatar({ nome, size = 32 }: { nome: string; size?: number }) {
  const words = nome.trim().split(/\s+/);
  const initials = (words[0]?.[0] ?? "") + (words[1]?.[0] ?? "");
  const hue = (nome.charCodeAt(0) * 47 + nome.charCodeAt(nome.length - 1) * 23) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `hsl(${hue},55%,50%)`,
      color: "white", fontWeight: 700, fontSize: size * 0.35,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {initials.toUpperCase()}
    </div>
  );
}

type Props = { contacts: Contact[] };

const CANAL_TABS = ["Todos", "WhatsApp", "Instagram"] as const;

export default function ContactsClient({ contacts }: Props) {
  const [search, setSearch] = useState("");
  const [canal, setCanal] = useState<typeof CANAL_TABS[number]>("Todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selected, setSelected] = useState<Contact | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter((c) => {
      const matchSearch = !q ||
        c.nome.toLowerCase().includes(q) ||
        c.telefone?.includes(q) ||
        c.instagram_id?.toLowerCase().includes(q);
      const matchCanal =
        canal === "Todos" ||
        (canal === "WhatsApp" && c.origem === "whatsapp") ||
        (canal === "Instagram" && c.origem === "instagram");
      const matchStatus = statusFilter === "todos" || c.status === statusFilter;
      return matchSearch && matchCanal && matchStatus;
    });
  }, [contacts, search, canal, statusFilter]);

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Table area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Filters */}
        <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0.75rem 1.5rem", display: "flex", gap: "0.75rem", alignItems: "center", flexShrink: 0 }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "0 0 260px" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome, telefone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "0.45rem 0.75rem 0.45rem 2rem",
                border: "1px solid #e2e8f0", borderRadius: 8,
                fontSize: "0.82rem", fontFamily: "inherit", outline: "none",
                background: "#f8fafc",
              }}
            />
          </div>

          {/* Canal tabs */}
          <div style={{ display: "flex", gap: 2, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
            {CANAL_TABS.map((t) => (
              <button key={t} onClick={() => setCanal(t)} style={{
                padding: "0.3rem 0.65rem", borderRadius: 6, border: "none", cursor: "pointer",
                fontSize: "0.78rem", fontWeight: 500, fontFamily: "inherit",
                background: canal === t ? "white" : "transparent",
                color: canal === t ? "#0f172a" : "#64748b",
                boxShadow: canal === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.12s",
              }}>
                {t}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.4rem 0.65rem", border: "1px solid #e2e8f0",
              borderRadius: 8, fontSize: "0.78rem", fontFamily: "inherit",
              background: "#f8fafc", color: "#374151", outline: "none",
            }}
          >
            <option value="todos">Todos os estágios</option>
            <option value="novo">Novo</option>
            <option value="qualificado">Qualificado</option>
            <option value="negociacao">Negociação</option>
            <option value="fechamento">Fechamento</option>
            <option value="pos-venda">Pós-venda</option>
          </select>

          <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "#94a3b8" }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: "auto", background: "#f8fafc" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
            <thead>
              <tr style={{ background: "white", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 1 }}>
                {["Contato", "Canal", "Estágio", "Último contato", "Tags"].map((h) => (
                  <th key={h} style={{ padding: "0.65rem 1rem", textAlign: "left", fontWeight: 600, fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isSelected = selected?.id === c.id;
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(isSelected ? null : c)}
                    style={{
                      background: isSelected ? "#f0f9ff" : "white",
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                    onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "white"; }}
                  >
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <Avatar nome={c.nome} />
                        <div>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{c.nome}</div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                            {c.telefone ? fmtPhone(c.telefone) : `@${c.instagram_id}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: c.origem === "whatsapp" ? "#f0fdf4" : "#fdf2f8",
                        color: c.origem === "whatsapp" ? "#15803d" : "#be185d",
                        padding: "0.18rem 0.5rem", borderRadius: 5,
                        fontSize: "0.7rem", fontWeight: 600,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                        {c.origem === "whatsapp" ? "WhatsApp" : "Instagram"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{
                        background: `${STATUS_COLOR[c.status]}18`,
                        color: STATUS_COLOR[c.status],
                        padding: "0.2rem 0.55rem", borderRadius: 5,
                        fontSize: "0.72rem", fontWeight: 600,
                      }}>
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: "0.8rem" }}>
                      {timeAgo(c.last_seen_at)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {(c.tags ?? []).filter((t: string) => t !== "demo").slice(0, 2).map((t: string) => (
                          <span key={t} style={{ background: "#f1f5f9", color: "#475569", padding: "0.1rem 0.4rem", borderRadius: 4, fontSize: "0.65rem", fontWeight: 500 }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(isSelected ? null : c); }}
                        style={{
                          background: isSelected ? "#0f172a" : "#f1f5f9",
                          color: isSelected ? "white" : "#475569",
                          border: "none", borderRadius: 7, padding: "0.3rem 0.65rem",
                          fontSize: "0.75rem", fontWeight: 500, cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {isSelected ? "Fechar" : "Conversa"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                    Nenhum contato encontrado para os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversation panel */}
      {selected && (
        <ConversationView
          contact={{ ...selected, stageColor: STATUS_COLOR[selected.status] }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
