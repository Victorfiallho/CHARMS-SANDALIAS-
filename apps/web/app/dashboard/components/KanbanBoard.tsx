"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type ContactStatus = "novo" | "qualificado" | "negociacao" | "fechamento" | "pos-venda";

type Contact = {
  id: string;
  nome: string;
  telefone: string | null;
  instagram_id: string | null;
  origem: string;
  status: ContactStatus;
  created_at: string;
  last_seen_at: string | null;
};

const COLUMNS: { id: ContactStatus; label: string; color: string }[] = [
  { id: "novo", label: "Novo", color: "#3b82f6" },
  { id: "qualificado", label: "Qualificado", color: "#f59e0b" },
  { id: "negociacao", label: "Negociação", color: "#f97316" },
  { id: "fechamento", label: "Fechamento", color: "#22c55e" },
  { id: "pos-venda", label: "Pós-venda", color: "#a855f7" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function KanbanBoard({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ContactStatus | null>(null);
  const router = useRouter();

  const handleDragStart = useCallback((id: string) => {
    setDraggingId(id);
  }, []);

  const handleDrop = useCallback(
    async (status: ContactStatus) => {
      if (!draggingId) return;
      const contact = contacts.find((c) => c.id === draggingId);
      if (!contact || contact.status === status) {
        setDraggingId(null);
        setDragOverCol(null);
        return;
      }

      setContacts((prev) => prev.map((c) => (c.id === draggingId ? { ...c, status } : c)));
      const id = draggingId;
      setDraggingId(null);
      setDragOverCol(null);

      await fetch(`/api/contacts/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    },
    [draggingId, contacts]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div
        style={{
          padding: "0.875rem 1.5rem",
          borderBottom: "1px solid #e2e8f0",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Pipeline</h1>
        <span style={{ fontSize: "0.82rem", color: "#64748b" }}>{contacts.length} contatos</span>
      </div>

      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const colContacts = contacts.filter((c) => c.status === col.id);
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              className={`kanban-column${isOver ? " drag-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(col.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverCol(null);
                }
              }}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="kanban-column-header">
                <span style={{ color: col.color }}>{col.label}</span>
                <span
                  style={{
                    background: col.color,
                    color: "white",
                    borderRadius: "10px",
                    padding: "0.1rem 0.5rem",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  {colContacts.length}
                </span>
              </div>

              {colContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`kanban-card${draggingId === contact.id ? " dragging" : ""}`}
                  draggable
                  onDragStart={() => handleDragStart(contact.id)}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDragOverCol(null);
                  }}
                  onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.4rem" }}>
                    {contact.nome}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span
                      className={`badge badge-${
                        contact.origem === "whatsapp" ? "whatsapp" : "instagram"
                      }`}
                    >
                      {contact.origem === "whatsapp" ? "WPP" : "IG"}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      {formatDate(contact.last_seen_at ?? contact.created_at)}
                    </span>
                  </div>
                </div>
              ))}

              {colContacts.length === 0 && (
                <div
                  style={{
                    color: "#cbd5e1",
                    fontSize: "0.8rem",
                    textAlign: "center",
                    padding: "1.5rem 0",
                    border: "2px dashed #cbd5e1",
                    borderRadius: "6px",
                    marginTop: "0.25rem",
                  }}
                >
                  Arraste aqui
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
