"use client";

import { useState, useMemo, useCallback } from "react";
import ConversationView from "../components/ConversationView";
import NovoContatoModal from "../components/NovoContatoModal";
import Toast from "../components/Toast";

type Contact = {
  id: string;
  nome: string;
  telefone: string | null;
  instagram_id: string | null;
  origem: string;
  status: string;
  tags: string[];
  created_at?: string;
  last_seen_at: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  novo:        "#6B7280",
  qualificado: "#1D4ED8",
  negociacao:  "#A16207",
  fechamento:  "#15803D",
  "pos-venda": "#374151",
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
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Initials({ nome }: { nome: string }) {
  const words = nome.trim().split(/\s+/);
  const initials = (words[0]?.[0] ?? "") + (words[1]?.[0] ?? "");
  const hue = (nome.charCodeAt(0) * 47 + nome.charCodeAt(nome.length - 1) * 23) % 360;
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 4,
      background: `hsl(${hue},40%,45%)`,
      color: "white", fontWeight: 700, fontSize: "0.6rem",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, letterSpacing: "-0.5px",
    }}>
      {initials.toUpperCase()}
    </div>
  );
}

type Props = { contacts: Contact[] };

const CANAL_TABS = ["Todos", "WhatsApp", "Instagram"] as const;

export default function ContactsClient({ contacts: initialContacts }: Props) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [search, setSearch] = useState("");
  const [canal, setCanal] = useState<typeof CANAL_TABS[number]>("Todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" } | null>(null);

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

  const handleUpdate = useCallback((updated: Contact) => {
    setContacts((prev) => prev.map((c) => c.id === updated.id ? { ...c, ...updated } : c));
    setSelected((prev) => prev?.id === updated.id ? { ...prev, ...updated } as Contact : prev);
  }, []);

  const handleCreated = useCallback((contact: Contact) => {
    setContacts((prev) => [contact, ...prev]);
    setToast({ message: `${contact.nome} adicionado com sucesso` });
  }, []);

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{
          background: "white", borderBottom: "1px solid #E5E7EB",
          padding: "0 1.25rem", height: 44, display: "flex", gap: "0.625rem",
          alignItems: "center", flexShrink: 0,
        }}>
          {/* Busca */}
          <div style={{ position: "relative", flex: "0 0 240px" }}>
            <svg style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar contato…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "0.35rem 0.625rem 0.35rem 1.75rem",
                border: "1px solid #E5E7EB", borderRadius: 4,
                fontSize: "0.75rem", fontFamily: "inherit", outline: "none",
                background: "#F9FAFB", color: "#111827",
                transition: "border-color 0.1s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#6B7280"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; }}
            />
          </div>

          {/* Canal tabs */}
          <div style={{ display: "flex", gap: 0, border: "1px solid #E5E7EB", borderRadius: 4, overflow: "hidden" }}>
            {CANAL_TABS.map((t) => (
              <button key={t} onClick={() => setCanal(t)} style={{
                padding: "0.3rem 0.6rem", border: "none", cursor: "pointer",
                fontSize: "0.72rem", fontWeight: 500, fontFamily: "inherit",
                background: canal === t ? "#111827" : "white",
                color: canal === t ? "white" : "#6B7280",
                borderRight: t !== "Instagram" ? "1px solid #E5E7EB" : "none",
                transition: "all 0.1s",
              }}>
                {t}
              </button>
            ))}
          </div>

          {/* Status select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.3rem 0.5rem", border: "1px solid #E5E7EB",
              borderRadius: 4, fontSize: "0.72rem", fontFamily: "inherit",
              background: "white", color: "#374151", outline: "none",
            }}
          >
            <option value="todos">Todos os estágios</option>
            <option value="novo">Novo</option>
            <option value="qualificado">Qualificado</option>
            <option value="negociacao">Negociação</option>
            <option value="fechamento">Fechamento</option>
            <option value="pos-venda">Pós-venda</option>
          </select>

          <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "#9CA3AF" }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>

          <button onClick={() => setShowModal(true)} className="corp-btn corp-btn-primary" style={{ fontSize: "0.72rem" }}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            Novo contato
          </button>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: "auto", background: "#F9FAFB" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ background: "white", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 1 }}>
                {["Contato", "Canal", "Estágio", "Último contato", "Tags"].map((h) => (
                  <th key={h} style={{
                    padding: "0.5rem 1rem", textAlign: "left",
                    fontWeight: 600, fontSize: "0.65rem", color: "#9CA3AF",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    {h}
                  </th>
                ))}
                <th style={{ width: 72 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isSelected = selected?.id === c.id;
                const visibleTags = (c.tags ?? []).filter((t: string) => t !== "demo");
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(isSelected ? null : c)}
                    style={{
                      background: isSelected ? "#F0F9FF" : "white",
                      borderBottom: "1px solid #F3F4F6",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                    onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "white"; }}
                  >
                    {/* Contato */}
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Initials nome={c.nome} />
                        <div>
                          <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.78rem" }}>{c.nome}</div>
                          <div style={{ fontSize: "0.65rem", color: "#9CA3AF" }}>
                            {c.telefone ? fmtPhone(c.telefone) : `@${c.instagram_id}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Canal */}
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#6B7280" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.origem === "whatsapp" ? "#15803D" : "#9D174D", display: "inline-block" }} />
                        {c.origem === "whatsapp" ? "WhatsApp" : "Instagram"}
                      </span>
                    </td>

                    {/* Estágio */}
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: STATUS_COLOR[c.status] ?? "#6B7280" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </td>

                    {/* Último contato */}
                    <td style={{ padding: "0.625rem 1rem", color: "#9CA3AF", fontSize: "0.72rem" }}>
                      {timeAgo(c.last_seen_at)}
                    </td>

                    {/* Tags */}
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {visibleTags.slice(0, 3).map((t: string) => (
                          <span key={t} style={{
                            border: "1px solid #E5E7EB", color: "#6B7280",
                            padding: "0.05rem 0.35rem", borderRadius: 3,
                            fontSize: "0.62rem", fontWeight: 500, background: "#F9FAFB",
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Ação */}
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(isSelected ? null : c); }}
                        style={{
                          background: isSelected ? "#111827" : "white",
                          color: isSelected ? "white" : "#6B7280",
                          border: "1px solid #E5E7EB",
                          borderRadius: 4, padding: "0.25rem 0.5rem",
                          fontSize: "0.65rem", fontWeight: 600, cursor: "pointer",
                          fontFamily: "inherit", transition: "all 0.1s",
                        }}
                      >
                        {isSelected ? "Fechar" : "Ver"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF", fontSize: "0.78rem" }}>
                    Nenhum contato encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <ConversationView
          contact={{ ...selected, stageColor: STATUS_COLOR[selected.status] }}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}

      {showModal && (
        <NovoContatoModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  );
}
