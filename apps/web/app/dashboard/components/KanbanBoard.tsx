"use client";

import { useState, useCallback } from "react";
import ConversationView from "./ConversationView";

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
  { key: "novo", label: "Novo", color: "#6b7280" },
  { key: "qualificado", label: "Qualificado", color: "#3b82f6" },
  { key: "negociacao", label: "Negociação", color: "#f59e0b" },
  { key: "fechamento", label: "Fechamento", color: "#10b981" },
  { key: "pos-venda", label: "Pós-venda", color: "#8b5cf6" },
] as const;

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "agora";
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

function Avatar({ nome }: { nome: string }) {
  const initials = nome
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const hue = nome.charCodeAt(0) * 13 + nome.charCodeAt(1) * 7;
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: `hsl(${hue % 360}, 55%, 55%)`,
      color: "white", fontWeight: 700, fontSize: "0.75rem",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function KanbanBoard({ contacts }: Props) {
  const [cards, setCards] = useState<Contact[]>(contacts);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [selected, setSelected] = useState<Contact | null>(null);

  const grouped = STAGES.reduce<Record<string, Contact[]>>((acc, s) => {
    acc[s.key] = cards.filter((c) => c.status === s.key);
    return acc;
  }, {});

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragEnd = () => { setDragId(null); setOverCol(null); };

  const handleDrop = useCallback(
    async (targetStatus: string) => {
      if (!dragId || dragId === targetStatus) return;
      setCards((prev) =>
        prev.map((c) => (c.id === dragId ? { ...c, status: targetStatus } : c))
      );
      setOverCol(null);
      await fetch(`/api/contacts/${dragId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
    },
    [dragId]
  );

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Kanban */}
      <div className="kanban-board" style={{ flex: 1 }}>
        {STAGES.map((stage) => (
          <div
            key={stage.key}
            className={`kanban-column${overCol === stage.key ? " drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOverCol(stage.key); }}
            onDragLeave={() => setOverCol(null)}
            onDrop={() => handleDrop(stage.key)}
          >
            <div className="kanban-column-header">
              <span style={{ color: stage.color }}>{stage.label}</span>
              <span style={{
                background: stage.color, color: "white",
                fontSize: "0.65rem", fontWeight: 700,
                borderRadius: "999px", padding: "0.05rem 0.4rem"
              }}>
                {grouped[stage.key].length}
              </span>
            </div>

            {grouped[stage.key].map((contact) => (
              <div
                key={contact.id}
                draggable
                className={`kanban-card${dragId === contact.id ? " dragging" : ""}`}
                style={selected?.id === contact.id ? { borderColor: stage.color } : undefined}
                onDragStart={() => handleDragStart(contact.id)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelected(selected?.id === contact.id ? null : contact)}
              >
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                  <Avatar nome={contact.nome} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {contact.nome}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                      {contact.telefone
                        ? contact.telefone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4")
                        : `@${contact.instagram_id}`}
                    </div>
                  </div>
                  <span style={{ fontSize: "0.65rem", color: "#9ca3af", flexShrink: 0 }}>
                    {timeAgo(contact.last_seen_at)}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                  <span
                    className={`badge badge-${contact.origem}`}
                    style={{
                      background: contact.origem === "whatsapp" ? "#dcfce7" : "#fce7f3",
                      color: contact.origem === "whatsapp" ? "#16a34a" : "#be185d",
                    }}
                  >
                    {contact.origem === "whatsapp" ? "WhatsApp" : "Instagram"}
                  </span>
                </div>
              </div>
            ))}

            {grouped[stage.key].length === 0 && (
              <div style={{
                padding: "1rem",
                textAlign: "center",
                color: "#d1d5db",
                fontSize: "0.8rem",
                border: "2px dashed #e5e7eb",
                borderRadius: 6,
              }}>
                Arraste um card aqui
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Painel de conversa */}
      {selected && (
        <ConversationView
          contact={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
