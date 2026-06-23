"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
  stageColor?: string;
};

type Message = {
  id: string;
  direction: "inbound" | "outbound";
  conteudo: string;
  timestamp: string;
  canal: string;
};

type Props = {
  contact: Contact;
  onClose: () => void;
  onUpdate?: (contact: Contact) => void;
};

const STAGES = [
  { key: "novo",        label: "Novo",        color: "#64748b" },
  { key: "qualificado", label: "Qualificado", color: "#3b82f6" },
  { key: "negociacao",  label: "Negociação",  color: "#f59e0b" },
  { key: "fechamento",  label: "Fechamento",  color: "#10b981" },
  { key: "pos-venda",   label: "Pós-venda",   color: "#8b5cf6" },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function ConversationView({ contact, onClose, onUpdate }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [activeTab, setActiveTab] = useState<"conversa" | "notas">("conversa");
  const [editMode, setEditMode] = useState(false);
  const [editNome, setEditNome] = useState(contact.nome);
  const [editTags, setEditTags] = useState((contact.tags ?? []).filter((t) => t !== "demo").join(", "));
  const [editStatus, setEditStatus] = useState(contact.status);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`charms_note_${contact.id}`);
    setNote(saved ?? "");
  }, [contact.id]);

  useEffect(() => {
    setEditNome(contact.nome);
    setEditTags((contact.tags ?? []).filter((t) => t !== "demo").join(", "));
    setEditStatus(contact.status);
    setEditMode(false);
  }, [contact.id, contact.nome, contact.tags, contact.status]);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/conversations/${contact.id}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
    setLoading(false);
  }, [contact.id]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetchMessages();
    const id = setInterval(fetchMessages, 5000);
    return () => clearInterval(id);
  }, [fetchMessages]);

  useEffect(() => {
    if (activeTab === "conversa") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setSendError("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: contact.id, text: text.trim() }),
    });
    setSending(false);
    if (res.ok) {
      setText("");
      fetchMessages();
    } else {
      const err = await res.json().catch(() => ({}));
      setSendError(err.error ?? "Erro ao enviar");
    }
  };

  const saveEdit = async () => {
    if (!editNome.trim()) { setEditError("Nome é obrigatório"); return; }
    setEditSaving(true);
    setEditError("");

    const tags = editTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const [r1, r2] = await Promise.all([
      fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: editNome.trim(), tags }),
      }),
      editStatus !== contact.status
        ? fetch(`/api/contacts/${contact.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: editStatus }),
          })
        : Promise.resolve({ ok: true }),
    ]);

    setEditSaving(false);
    if (!r1.ok) {
      const err = await (r1 as Response).json().catch(() => ({}));
      setEditError((err as { error?: string }).error ?? "Erro ao salvar");
      return;
    }

    const updated = await (r1 as Response).json();
    onUpdate?.({ ...contact, ...updated, status: editStatus });
    setEditMode(false);
  };

  const saveNote = () => {
    localStorage.setItem(`charms_note_${contact.id}`, note);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const grouped: { date: string; msgs: Message[] }[] = [];
  for (const msg of messages) {
    const label = formatDate(msg.timestamp);
    const last = grouped[grouped.length - 1];
    if (!last || last.date !== label) grouped.push({ date: label, msgs: [msg] });
    else last.msgs.push(msg);
  }

  const canalColor = contact.origem === "whatsapp" ? "#16a34a" : "#be185d";
  const canalLabel = contact.origem === "whatsapp" ? "WhatsApp" : "Instagram";
  const accentColor = contact.stageColor ?? "#3b82f6";
  const initials = contact.nome.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const hue = (contact.nome.charCodeAt(0) * 47 + contact.nome.charCodeAt(contact.nome.length - 1) * 23) % 360;
  const visibleTags = (contact.tags ?? []).filter((t) => t !== "demo");

  return (
    <div style={{
      width: 380, flexShrink: 0, borderLeft: "1px solid #e2e8f0",
      background: "white", display: "flex", flexDirection: "column", height: "100%",
    }}>
      {/* Header */}
      <div style={{
        padding: "0.875rem 1rem",
        borderBottom: editMode ? "none" : "1px solid #e2e8f0",
        display: "flex", alignItems: "center", gap: "0.75rem",
        flexShrink: 0, borderTop: `3px solid ${accentColor}`,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: `hsl(${hue},55%,50%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.9rem", fontWeight: 700, color: "white", flexShrink: 0,
        }}>
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f172a" }}>{contact.nome}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: "#94a3b8", flexWrap: "wrap" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: canalColor, display: "inline-block" }} />
            {canalLabel}
            {contact.telefone && <span>· {contact.telefone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4")}</span>}
            {contact.instagram_id && <span>· @{contact.instagram_id}</span>}
          </div>
          {visibleTags.length > 0 && (
            <div style={{ display: "flex", gap: 3, marginTop: 3, flexWrap: "wrap" }}>
              {visibleTags.slice(0, 3).map((t) => (
                <span key={t} style={{ background: "#f1f5f9", color: "#475569", padding: "0.05rem 0.4rem", borderRadius: 4, fontSize: "0.62rem", fontWeight: 500 }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => setEditMode(!editMode)}
            title="Editar contato"
            style={{
              background: editMode ? "#f1f5f9" : "none", border: "none", cursor: "pointer",
              color: editMode ? "#0f172a" : "#9ca3af", padding: "0.25rem 0.4rem", borderRadius: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M11.5 2.5L13.5 4.5L5.5 12.5H3.5V10.5L11.5 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "1rem", padding: "0.2rem 0.35rem", borderRadius: 4 }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Edit panel */}
      {editMode && (
        <div style={{
          background: "#f8fafc", borderBottom: "1px solid #e2e8f0",
          padding: "0.875rem 1rem", flexShrink: 0,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.6rem" }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>Nome</label>
              <input
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                style={{
                  width: "100%", padding: "0.4rem 0.6rem",
                  border: "1.5px solid #d1d5db", borderRadius: 7,
                  fontSize: "0.83rem", fontFamily: "inherit", outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; }}
                onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>Tags</label>
              <input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="vip, urgente…"
                style={{
                  width: "100%", padding: "0.4rem 0.6rem",
                  border: "1.5px solid #d1d5db", borderRadius: 7,
                  fontSize: "0.83rem", fontFamily: "inherit", outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; }}
                onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>Estágio</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                style={{
                  width: "100%", padding: "0.4rem 0.5rem",
                  border: "1.5px solid #d1d5db", borderRadius: 7,
                  fontSize: "0.83rem", fontFamily: "inherit", outline: "none",
                  background: "white",
                }}
              >
                {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          {editError && (
            <div style={{ fontSize: "0.75rem", color: "#dc2626", marginBottom: "0.5rem" }}>{editError}</div>
          )}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button onClick={() => setEditMode(false)} style={{
              padding: "0.35rem 0.75rem", border: "1px solid #e2e8f0", borderRadius: 7,
              background: "white", fontSize: "0.78rem", fontFamily: "inherit", cursor: "pointer", color: "#374151",
            }}>
              Cancelar
            </button>
            <button onClick={saveEdit} disabled={editSaving} style={{
              padding: "0.35rem 0.875rem", border: "none", borderRadius: 7,
              background: editSaving ? "#94a3b8" : "#0f172a", color: "white",
              fontSize: "0.78rem", fontFamily: "inherit", cursor: editSaving ? "not-allowed" : "pointer", fontWeight: 600,
            }}>
              {editSaving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", background: "white", flexShrink: 0 }}>
        {(["conversa", "notas"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "0.5rem 1.1rem", border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: "0.78rem",
            fontWeight: activeTab === tab ? 700 : 400,
            color: activeTab === tab ? "#0f172a" : "#94a3b8",
            background: "none",
            borderBottom: activeTab === tab ? "2px solid #0f172a" : "2px solid transparent",
            transition: "all 0.12s",
          }}>
            {tab === "conversa" ? "💬 Conversa" : "📝 Notas"}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "conversa" ? (
        <>
          <div style={{ flex: 1, overflow: "auto", padding: "1rem 1rem 0.5rem", background: "#f9fafb" }}>
            {loading && (
              <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.8rem", padding: "2rem" }}>
                Carregando conversa…
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.8rem", padding: "2rem" }}>
                Nenhuma mensagem ainda.
              </div>
            )}

            {grouped.map(({ date, msgs }) => (
              <div key={date}>
                <div style={{ textAlign: "center", margin: "0.75rem 0" }}>
                  <span style={{
                    background: "#e5e7eb", color: "#6b7280",
                    fontSize: "0.68rem", fontWeight: 600,
                    padding: "0.15rem 0.6rem", borderRadius: "999px",
                  }}>
                    {date}
                  </span>
                </div>

                {msgs.map((msg) => {
                  const isOut = msg.direction === "outbound";
                  return (
                    <div key={msg.id} style={{ display: "flex", justifyContent: isOut ? "flex-end" : "flex-start", marginBottom: "0.35rem" }}>
                      <div style={{
                        maxWidth: "78%",
                        background: isOut ? "#dcfce7" : "white",
                        border: isOut ? "none" : "1px solid #e5e7eb",
                        borderRadius: isOut ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                        padding: "0.5rem 0.7rem",
                        boxShadow: "0 1px 2px rgb(0 0 0 / 0.06)",
                      }}>
                        <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.4, wordBreak: "break-word" }}>
                          {msg.conteudo}
                        </p>
                        <div style={{ textAlign: "right", fontSize: "0.62rem", color: "#9ca3af", marginTop: "0.2rem" }}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          <div style={{ padding: "0.75rem", borderTop: "1px solid #e5e7eb", background: "white", flexShrink: 0 }}>
            {sendError && (
              <div style={{ fontSize: "0.75rem", color: "#ef4444", marginBottom: "0.4rem" }}>⚠️ {sendError}</div>
            )}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                placeholder="Digite a mensagem… (Enter para enviar)"
                rows={2}
                style={{
                  flex: 1, resize: "none",
                  border: "1.5px solid #d1d5db",
                  borderRadius: 8, padding: "0.5rem 0.7rem",
                  fontSize: "0.85rem", fontFamily: "inherit",
                  outline: "none", transition: "border-color 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; }}
                onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; }}
              />
              <button
                onClick={send}
                disabled={sending || !text.trim()}
                style={{
                  background: sending || !text.trim() ? "#e5e7eb" : "#16a34a",
                  color: sending || !text.trim() ? "#9ca3af" : "white",
                  border: "none", borderRadius: 8,
                  padding: "0.5rem 0.8rem",
                  fontSize: "1rem", cursor: sending || !text.trim() ? "not-allowed" : "pointer",
                  transition: "background 0.15s", height: 58,
                }}
              >
                {sending ? "…" : "➤"}
              </button>
            </div>
            <p style={{ margin: "0.3rem 0 0", fontSize: "0.65rem", color: "#9ca3af" }}>
              Shift+Enter para nova linha · atualiza a cada 5s
            </p>
          </div>
        </>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1rem", background: "#f9fafb", overflow: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>Anotações internas</span>
            {noteSaved && (
              <span style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 600 }}>✓ Salvo</span>
            )}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Anotações sobre ${contact.nome}...\n\nEx: Cliente muito interessado no modelo Havaianas Top. Prefere WhatsApp. Orçamento aprovado.`}
            style={{
              flex: 1, resize: "none",
              border: "1.5px solid #e2e8f0", borderRadius: 10,
              padding: "0.75rem", fontSize: "0.84rem", fontFamily: "inherit",
              lineHeight: 1.6, outline: "none", background: "white",
              transition: "border-color 0.15s",
              minHeight: 200,
            }}
            onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; saveNote(); }}
          />
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.68rem", color: "#94a3b8" }}>
            Salvo automaticamente ao sair do campo. Visível apenas localmente.
          </p>
        </div>
      )}
    </div>
  );
}
