"use client";

import { useState, useCallback } from "react";
import ConversationView from "./ConversationView";
import NovoContatoModal from "./NovoContatoModal";

type Contact = {
  id: string;
  nome: string;
  telefone: string | null;
  instagram_id: string | null;
  origem: string;
  status: string;
  tags: string[];
  last_seen_at: string | null;
};

type Props = { contacts: Contact[] };

const STAGES = [
  { key: "novo",        label: "Novo",        color: "#64748b" },
  { key: "qualificado", label: "Qualificado", color: "#3b82f6" },
  { key: "negociacao",  label: "Negociação",  color: "#f59e0b" },
  { key: "fechamento",  label: "Fechamento",  color: "#10b981" },
  { key: "pos-venda",   label: "Pós-venda",   color: "#8b5cf6" },
] as const;

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "agora";
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function fmtPhone(tel: string) {
  const m = tel.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}` : tel;
}

function Avatar({ nome, size = 34 }: { nome: string; size?: number }) {
  const words = nome.trim().split(/\s+/);
  const initials = (words[0]?.[0] ?? "") + (words[1]?.[0] ?? "");
  const hue = (nome.charCodeAt(0) * 47 + nome.charCodeAt(nome.length - 1) * 23) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `hsl(${hue},55%,50%)`,
      color: "white", fontWeight: 700, fontSize: size * 0.35,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, letterSpacing: "-0.5px",
    }}>
      {initials.toUpperCase()}
    </div>
  );
}

function ChannelBadge({ origem }: { origem: string }) {
  const isWpp = origem === "whatsapp";
  return (
    <span className={`badge badge-${origem}`}>
      <span className="badge-dot" style={{ background: isWpp ? "#16a34a" : "#be185d" }} />
      {isWpp ? "WhatsApp" : "Instagram"}
    </span>
  );
}

export default function KanbanBoard({ contacts }: Props) {
  const [cards, setCards] = useState<Contact[]>(contacts);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);

  const grouped = STAGES.reduce<Record<string, Contact[]>>((acc, s) => {
    acc[s.key] = cards.filter((c) => c.status === s.key);
    return acc;
  }, {});

  const handleDragEnd = () => { setDragId(null); setOverCol(null); };

  const handleDrop = useCallback(async (targetStatus: string) => {
    if (!dragId) return;
    const card = cards.find((c) => c.id === dragId);
    if (!card || card.status === targetStatus) return;
    setCards((prev) => prev.map((c) => c.id === dragId ? { ...c, status: targetStatus } : c));
    setOverCol(null);
    await fetch(`/api/contacts/${dragId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: targetStatus }),
    });
  }, [dragId, cards]);

  const handleUpdate = useCallback((updated: Contact) => {
    setCards((prev) => prev.map((c) => c.id === updated.id ? { ...c, ...updated } : c));
    setSelected((prev) => prev?.id === updated.id ? { ...prev, ...updated } : prev);
  }, []);

  const handleCreated = useCallback((contact: Contact) => {
    setCards((prev) => [contact, ...prev]);
  }, []);

  const stageOf = (key: string) => STAGES.find((s) => s.key === key) ?? STAGES[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Sub-header: stage chips + new contact button */}
      <div style={{
        background: "white", borderBottom: "1px solid #e2e8f0",
        padding: "0 1.5rem", height: 46, flexShrink: 0,
        display: "flex", alignItems: "center", gap: "0.4rem",
        justifyContent: "flex-end",
      }}>
        {STAGES.map((s) => (
          <div key={s.key} style={{
            display: "flex", alignItems: "center", gap: "0.3rem",
            background: `${s.color}12`, border: `1px solid ${s.color}30`,
            borderRadius: 8, padding: "0.22rem 0.5rem",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: s.color }}>{grouped[s.key].length}</span>
          </div>
        ))}
        <div style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 0.25rem" }} />
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: "0.35rem",
            background: "#0f172a", color: "white", border: "none", borderRadius: 8,
            padding: "0.38rem 0.85rem", fontSize: "0.78rem", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          Novo contato
        </button>
      </div>

      {/* Main area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div className="kanban-board" style={{ flex: 1 }}>
          {STAGES.map((stage) => (
            <div
              key={stage.key}
              className={`kanban-column${overCol === stage.key ? " drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setOverCol(stage.key); }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null);
              }}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="kanban-column-header">
                <span className="kanban-column-dot" style={{ background: stage.color }} />
                <span className="kanban-column-label">{stage.label}</span>
                <span className="kanban-column-count" style={{ background: `${stage.color}18`, color: stage.color }}>
                  {grouped[stage.key].length}
                </span>
              </div>

              <div className="kanban-cards">
                {grouped[stage.key].map((contact) => {
                  const isSelected = selected?.id === contact.id;
                  const visibleTags = (contact.tags ?? []).filter((t) => t !== "demo").slice(0, 2);
                  return (
                    <div
                      key={contact.id}
                      draggable
                      className={`kanban-card${dragId === contact.id ? " dragging" : ""}${isSelected ? " selected" : ""}`}
                      style={{ borderLeftColor: stage.color, color: isSelected ? stage.color : undefined }}
                      onDragStart={() => setDragId(contact.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelected(isSelected ? null : contact)}
                    >
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                        <Avatar nome={contact.nome} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 600, fontSize: "0.865rem", color: "#0f172a", lineHeight: 1.3,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {contact.nome}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 1 }}>
                            {contact.telefone ? fmtPhone(contact.telefone) : `@${contact.instagram_id}`}
                          </div>
                        </div>
                        {contact.last_seen_at && (
                          <span style={{ fontSize: "0.68rem", color: "#94a3b8", flexShrink: 0, marginTop: 2 }}>
                            {timeAgo(contact.last_seen_at)}
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                        <ChannelBadge origem={contact.origem} />
                        <div style={{ display: "flex", gap: 3 }}>
                          {visibleTags.map((t) => (
                            <span key={t} style={{
                              background: "#f1f5f9", color: "#475569",
                              padding: "0.08rem 0.4rem", borderRadius: 4,
                              fontSize: "0.62rem", fontWeight: 500,
                            }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {grouped[stage.key].length === 0 && (
                  <div className="kanban-empty">Solte um card aqui</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <ConversationView
            contact={{ ...selected, stageColor: stageOf(selected.status).color }}
            onClose={() => setSelected(null)}
            onUpdate={handleUpdate}
          />
        )}
      </div>

      {showModal && (
        <NovoContatoModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
