"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeContacts } from "@/hooks/useRealtimeContacts";
import { STAGES } from "@/lib/constants";
import { fmtPhone, timeAgo } from "@/lib/utils";
import ConversationView from "./ConversationView";
import NovoContatoModal from "./NovoContatoModal";
import Toast from "./Toast";

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

function Avatar({ nome, size = 34 }: { nome: string; size?: number }) {
  const words = nome.trim().split(/\s+/);
  const initials = (words[0]?.[0] ?? "") + (words[1]?.[0] ?? "");
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#FDF0F1",
      color: "#C38B90", fontWeight: 500, fontSize: size * 0.35,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, letterSpacing: "-0.5px",
    }}>
      {initials.toUpperCase()}
    </div>
  );
}

function ChannelDot({ origem }: { origem: string }) {
  const isWpp = origem === "whatsapp";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.68rem", color: "#7A6868", fontWeight: 500 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: isWpp ? "#15803D" : "#9D174D", display: "inline-block", flexShrink: 0 }} />
      {isWpp ? "WhatsApp" : "Instagram"}
    </span>
  );
}

export default function KanbanBoard({ contacts }: Props) {
  const router = useRouter();
  const [cards, setCards] = useRealtimeContacts(contacts);
  const [draggingId, setDraggingId]   = useState<string | null>(null);
  const [ghostContact, setGhostContact] = useState<Contact | null>(null);
  const [overCol, setOverCol]         = useState<string | null>(null);
  const [selected, setSelected]       = useState<Contact | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [toast, setToast]             = useState<{ message: string; type?: "success" | "error" } | null>(null);

  // Drag refs — updated synchronously, never cause re-renders
  const dragIdRef      = useRef<string | null>(null);
  const dragOffsetRef  = useRef({ x: 0, y: 0 });
  const overColRef     = useRef<string | null>(null);
  const ghostRef       = useRef<HTMLDivElement>(null);
  const colRefsMap     = useRef<Record<string, HTMLDivElement | null>>({});
  // Ref espelho de cards — permite leitura síncrona dentro de callbacks sem
  // depender de closures stale ou updaters assíncronos do useState
  const cardsRef = useRef<Contact[]>(cards);
  cardsRef.current = cards;

  const grouped = STAGES.reduce<Record<string, Contact[]>>((acc, s) => {
    acc[s.key] = cards.filter((c) => c.status === s.key);
    return acc;
  }, {});

  const handleDrop = useCallback(async (targetStatus: string) => {
    const id = dragIdRef.current;
    if (!id) return;

    // Leitura síncrona via ref — sem risco de stale closure
    const currentCard = cardsRef.current.find((c) => c.id === id);
    if (!currentCard || currentCard.status === targetStatus) return;

    const originalStatus = currentCard.status;
    const stageLabel = STAGES.find((s) => s.key === targetStatus)?.label ?? targetStatus;

    // Update otimista imediato
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, status: targetStatus } : c));

    const res = await fetch(`/api/contacts/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: targetStatus }),
    });

    if (res.ok) {
      setToast({ message: `Movido para ${stageLabel}` });
      router.refresh(); // invalida Router Cache → outros módulos veem dados frescos
    } else {
      const errBody = await res.json().catch(() => ({})) as { error?: string };
      console.error("[Pipeline] PATCH /status falhou:", res.status, errBody);
      setCards((prev) => prev.map((c) => c.id === id ? { ...c, status: originalStatus } : c));
      setToast({ message: `Erro ao salvar (${res.status}): ${errBody.error ?? "tente novamente"}`, type: "error" });
    }
  }, [router]);

  // Attach global mouse listeners while dragging
  useEffect(() => {
    if (!draggingId) return;

    const onMove = (e: MouseEvent) => {
      // Update ghost position directly — zero React re-renders
      if (ghostRef.current) {
        ghostRef.current.style.visibility = "visible";
        ghostRef.current.style.left = `${e.clientX - dragOffsetRef.current.x}px`;
        ghostRef.current.style.top  = `${e.clientY - dragOffsetRef.current.y}px`;
      }
      // Detect column under cursor from bounding rects
      let found: string | null = null;
      for (const [key, el] of Object.entries(colRefsMap.current)) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right &&
            e.clientY >= r.top  && e.clientY <= r.bottom) {
          found = key;
          break;
        }
      }
      // Only re-render when the hovered column changes
      if (found !== overColRef.current) {
        overColRef.current = found;
        setOverCol(found);
      }
    };

    const onUp = () => {
      if (overColRef.current) handleDrop(overColRef.current);
      dragIdRef.current  = null;
      overColRef.current = null;
      setDraggingId(null);
      setGhostContact(null);
      setOverCol(null);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [draggingId, handleDrop]);

  // onMouseDown on each card — distinguishes click (< 6px) from drag
  const handleCardMouseDown = useCallback((e: React.MouseEvent, contact: Contact) => {
    if (e.button !== 0) return;
    e.preventDefault();

    const startX  = e.clientX;
    const startY  = e.clientY;
    const rect     = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX  = e.clientX - rect.left;
    const offsetY  = e.clientY - rect.top;
    let dragStarted = false;

    const onMove = (me: MouseEvent) => {
      if (dragStarted) return;
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > 6) {
        dragStarted = true;
        dragIdRef.current     = contact.id;
        dragOffsetRef.current = { x: offsetX, y: offsetY };
        overColRef.current    = null;
        setGhostContact(contact);
        setDraggingId(contact.id);
        cleanup();
      }
    };

    const onUp = () => {
      if (!dragStarted) {
        // Treat as click → toggle conversation
        setSelected((prev) => prev?.id === contact.id ? null : contact);
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, []);

  const handleUpdate = useCallback((updated: Contact) => {
    setCards((prev) => prev.map((c) => c.id === updated.id ? { ...c, ...updated } : c));
    setSelected((prev) => prev?.id === updated.id ? { ...prev, ...updated } as Contact : prev);
  }, []);

  const handleCreated = useCallback((contact: Contact) => {
    setCards((prev) => [contact, ...prev]);
    setToast({ message: `${contact.nome} adicionado ao pipeline` });
    router.refresh();
  }, [router]);

  const stageOf = (key: string) => STAGES.find((s) => s.key === key) ?? STAGES[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Sub-header */}
      <div style={{
        background: "white", borderBottom: "1px solid #EDE5E2",
        padding: "0 1.25rem", height: 40, flexShrink: 0,
        display: "flex", alignItems: "center", gap: "0.5rem",
      }}>
        {STAGES.map((s) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
            <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#7A6868" }}>{s.label}</span>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: s.color, marginLeft: 1 }}>{grouped[s.key].length}</span>
            {s.key !== "pos-venda" && <span style={{ width: 1, height: 10, background: "#EDE5E2", margin: "0 0.25rem" }} />}
          </div>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={() => setShowModal(true)}
            className="corp-btn corp-btn-primary"
            style={{ fontSize: "0.72rem", padding: "0.3rem 0.75rem" }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            Novo contato
          </button>
        </div>
      </div>

      {/* Board */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div className="kanban-board" style={{ flex: 1 }}>
          {STAGES.map((stage) => (
            <div
              key={stage.key}
              ref={(el) => { colRefsMap.current[stage.key] = el; }}
              className={`kanban-column${overCol === stage.key ? " drag-over" : ""}`}
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
                  const isSelected  = selected?.id === contact.id;
                  const isDragging  = draggingId === contact.id;
                  const visibleTags = (contact.tags ?? []).filter((t) => t !== "demo").slice(0, 2);
                  return (
                    <div
                      key={contact.id}
                      className={`kanban-card${isDragging ? " dragging" : ""}${isSelected ? " selected" : ""}`}
                      style={{ borderLeftColor: stage.color, userSelect: "none" }}
                      onMouseDown={(e) => handleCardMouseDown(e, contact)}
                    >
                      {/* Nome + tempo */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#1A1010", lineHeight: 1.3, flex: 1, minWidth: 0, marginRight: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {contact.nome}
                        </div>
                        {contact.last_seen_at && (
                          <span style={{ fontSize: "0.62rem", color: "#9A7878", flexShrink: 0 }}>
                            {timeAgo(contact.last_seen_at)}
                          </span>
                        )}
                      </div>

                      {/* Contato */}
                      <div style={{ fontSize: "0.68rem", color: "#9A7878", marginBottom: "0.35rem" }}>
                        {contact.telefone ? fmtPhone(contact.telefone) : contact.instagram_id ? `@${contact.instagram_id}` : "—"}
                      </div>

                      {/* Canal + tags */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <ChannelDot origem={contact.origem} />
                        {visibleTags.map((t) => (
                          <span key={t} style={{
                            border: "1px solid rgba(195,139,144,0.2)", color: "#7A6868",
                            padding: "0 0.3rem", borderRadius: 3,
                            fontSize: "0.6rem", fontWeight: 400, background: "#FAF9F6",
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {grouped[stage.key].length === 0 && (
                  <div className="kanban-empty">Arraste um card aqui</div>
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

      {/* Drag ghost */}
      {ghostContact && (() => {
        const stage = stageOf(ghostContact.status);
        return (
          <div
            ref={ghostRef}
            style={{
              position: "fixed",
              visibility: "hidden",
              pointerEvents: "none",
              zIndex: 9997,
              width: 268,
              background: "white",
              borderRadius: 4,
              padding: "0.625rem 0.75rem",
              boxShadow: "0 16px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid #EDE5E2",
              borderLeft: `3px solid ${stage.color}`,
              opacity: 0.97,
              transform: "rotate(1.5deg) scale(1.02)",
              left: 0,
              top: 0,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#1A1010", marginBottom: "0.25rem" }}>
              {ghostContact.nome}
            </div>
            <div style={{ fontSize: "0.68rem", color: "#9A7878" }}>
              {ghostContact.telefone ? fmtPhone(ghostContact.telefone) : ghostContact.instagram_id ? `@${ghostContact.instagram_id}` : "—"}
            </div>
          </div>
        );
      })()}

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
