"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeContacts } from "@/hooks/useRealtimeContacts";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/constants";
import { fmtPhone, timeAgo } from "@/lib/utils";
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

function Initials({ nome }: { nome: string }) {
  const words = nome.trim().split(/\s+/);
  const initials = (words[0]?.[0] ?? "") + (words[1]?.[0] ?? "");
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 4,
      background: "#FDF0F1",
      color: "#C38B90", fontWeight: 500, fontSize: "0.6rem",
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
  const router = useRouter();
  const [contacts, setContacts] = useRealtimeContacts(initialContacts);
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
    router.refresh();
  }, [router]);

  const handleCreated = useCallback((contact: Contact) => {
    setContacts((prev) => [contact, ...prev]);
    setToast({ message: `${contact.nome} adicionado com sucesso` });
    router.refresh();
  }, [router]);

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{
          background: "white", borderBottom: "1px solid #EDE5E2",
          padding: "0 1.25rem", height: 44, display: "flex", gap: "0.625rem",
          alignItems: "center", flexShrink: 0,
        }}>
          {/* Busca */}
          <div style={{ position: "relative", flex: "0 0 240px" }}>
            <svg style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#9A7878" }} width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar contato…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "0.35rem 0.625rem 0.35rem 1.75rem",
                border: "1px solid #EDE5E2", borderRadius: 4,
                fontSize: "0.75rem", fontFamily: "inherit", outline: "none",
                background: "#FAF9F6", color: "#1A1010",
                transition: "border-color 0.1s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#C38B90"; }}
              onBlur={(e) => { e.target.style.borderColor = "#EDE5E2"; }}
            />
          </div>

          {/* Canal tabs */}
          <div style={{ display: "flex", gap: 0, border: "1px solid #EDE5E2", borderRadius: 4, overflow: "hidden" }}>
            {CANAL_TABS.map((t) => (
              <button key={t} onClick={() => setCanal(t)} style={{
                padding: "0.3rem 0.6rem", border: "none", cursor: "pointer",
                fontSize: "0.72rem", fontWeight: 500, fontFamily: "inherit",
                background: canal === t ? "#1A1010" : "white",
                color: canal === t ? "white" : "#7A6868",
                borderRight: t !== "Instagram" ? "1px solid #EDE5E2" : "none",
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
              padding: "0.3rem 0.5rem", border: "1px solid #EDE5E2",
              borderRadius: 4, fontSize: "0.72rem", fontFamily: "inherit",
              background: "white", color: "#4A3535", outline: "none",
            }}
          >
            <option value="todos">Todos os estágios</option>
            <option value="novo">Novo</option>
            <option value="qualificado">Qualificado</option>
            <option value="negociacao">Negociação</option>
            <option value="fechamento">Fechamento</option>
            <option value="pos-venda">Pós-venda</option>
          </select>

          <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "#9A7878" }}>
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
        <div style={{ flex: 1, overflow: "auto", background: "#FAF9F6" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ background: "white", borderBottom: "1px solid #EDE5E2", position: "sticky", top: 0, zIndex: 1 }}>
                {["Contato", "Canal", "Estágio", "Último contato", "Tags"].map((h) => (
                  <th key={h} style={{
                    padding: "0.5rem 1rem", textAlign: "left",
                    fontWeight: 600, fontSize: "0.65rem", color: "#9A7878",
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
                      background: isSelected ? "#FDF6F6" : "white",
                      borderBottom: "1px solid #F5F2EF",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#FAF9F6"; }}
                    onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "white"; }}
                  >
                    {/* Contato */}
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Initials nome={c.nome} />
                        <div>
                          <div style={{ fontWeight: 600, color: "#1A1010", fontSize: "0.78rem" }}>{c.nome}</div>
                          <div style={{ fontSize: "0.65rem", color: "#9A7878" }}>
                            {c.telefone ? fmtPhone(c.telefone) : c.instagram_id ? `@${c.instagram_id}` : "—"}
                          </div>

                        </div>
                      </div>
                    </td>

                    {/* Canal */}
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#7A6868" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.origem === "whatsapp" ? "#15803D" : "#9D174D", display: "inline-block" }} />
                        {c.origem === "whatsapp" ? "WhatsApp" : "Instagram"}
                      </span>
                    </td>

                    {/* Estágio */}
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: STATUS_COLOR[c.status] ?? "#7A6868" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </td>

                    {/* Último contato */}
                    <td style={{ padding: "0.625rem 1rem", color: "#9A7878", fontSize: "0.72rem" }}>
                      {timeAgo(c.last_seen_at) || "—"}
                    </td>

                    {/* Tags */}
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {visibleTags.slice(0, 3).map((t: string) => (
                          <span key={t} style={{
                            border: "1px solid rgba(195,139,144,0.2)", color: "#7A6868",
                            padding: "0.05rem 0.35rem", borderRadius: 3,
                            fontSize: "0.62rem", fontWeight: 400, background: "#FAF9F6",
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
                          background: isSelected ? "#1A1010" : "white",
                          color: isSelected ? "white" : "#7A6868",
                          border: "1px solid #EDE5E2",
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
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9A7878", fontSize: "0.78rem" }}>
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
