"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Contact = {
  id: string;
  nome: string;
  telefone: string | null;
  instagram_id: string | null;
  origem: string;
  status: string;
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
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function ConversationView({ contact, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Group messages by day
  const grouped: { date: string; msgs: Message[] }[] = [];
  for (const msg of messages) {
    const label = formatDate(msg.timestamp);
    const last = grouped[grouped.length - 1];
    if (!last || last.date !== label) {
      grouped.push({ date: label, msgs: [msg] });
    } else {
      last.msgs.push(msg);
    }
  }

  const canalColor = contact.origem === "whatsapp" ? "#16a34a" : "#be185d";
  const canalLabel = contact.origem === "whatsapp" ? "WhatsApp" : "Instagram";

  return (
    <div style={{
      width: 380,
      flexShrink: 0,
      borderLeft: "1px solid #e5e7eb",
      background: "white",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      {/* Header */}
      <div style={{
        padding: "0.875rem 1rem",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexShrink: 0,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "#f3f4f6",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1rem", fontWeight: 700, color: "#374151",
        }}>
          {contact.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{contact.nome}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: "#9ca3af" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: canalColor, display: "inline-block" }} />
            {canalLabel}
            {contact.telefone && (
              <span>· {contact.telefone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4")}</span>
            )}
            {contact.instagram_id && <span>· @{contact.instagram_id}</span>}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#9ca3af", fontSize: "1.1rem", padding: "0.2rem 0.4rem",
            borderRadius: 4,
          }}
          title="Fechar"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
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
                <div key={msg.id} style={{
                  display: "flex",
                  justifyContent: isOut ? "flex-end" : "flex-start",
                  marginBottom: "0.35rem",
                }}>
                  <div style={{
                    maxWidth: "78%",
                    background: isOut ? "#dcfce7" : "white",
                    border: isOut ? "none" : "1px solid #e5e7eb",
                    borderRadius: isOut
                      ? "12px 12px 2px 12px"
                      : "12px 12px 12px 2px",
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

      {/* Input */}
      <div style={{
        padding: "0.75rem",
        borderTop: "1px solid #e5e7eb",
        background: "white",
        flexShrink: 0,
      }}>
        {sendError && (
          <div style={{ fontSize: "0.75rem", color: "#ef4444", marginBottom: "0.4rem" }}>
            ⚠️ {sendError}
          </div>
        )}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Digite a mensagem… (Enter para enviar)"
            rows={2}
            style={{
              flex: 1, resize: "none",
              border: "1px solid #d1d5db",
              borderRadius: 8, padding: "0.5rem 0.7rem",
              fontSize: "0.85rem", fontFamily: "inherit",
              outline: "none",
              transition: "border-color 0.15s",
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
              transition: "background 0.15s",
              height: 58,
            }}
            title="Enviar (Enter)"
          >
            {sending ? "…" : "➤"}
          </button>
        </div>
        <p style={{ margin: "0.3rem 0 0", fontSize: "0.65rem", color: "#9ca3af" }}>
          Shift+Enter para nova linha · atualiza a cada 5s
        </p>
      </div>
    </div>
  );
}
