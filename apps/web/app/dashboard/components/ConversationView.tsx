"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

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
  canal: string;
  direction: string;
  conteudo: string;
  timestamp: string;
};

const STATUS_LABELS: Record<string, string> = {
  novo: "Novo",
  qualificado: "Qualificado",
  negociacao: "Negociação",
  fechamento: "Fechamento",
  "pos-venda": "Pós-venda",
};

export default function ConversationView({
  contact,
  initialMessages,
}: {
  contact: Contact;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling a cada 5s para novas mensagens
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/conversations/${contact.id}`);
      if (res.ok) setMessages(await res.json());
    }, 5000);
    return () => clearInterval(interval);
  }, [contact.id]);

  const send = useCallback(async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setSendError(null);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: contact.id, text: text.trim() }),
    });

    if (res.ok) {
      const msg: Message = await res.json();
      setMessages((prev) => [...prev, msg]);
      setText("");
    } else {
      const data = await res.json().catch(() => ({}));
      setSendError(data.error ?? "Erro ao enviar mensagem");
    }
    setSending(false);
  }, [text, sending, contact.id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const channel = contact.origem === "whatsapp" ? "whatsapp" : "instagram";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div
        style={{
          padding: "0.875rem 1.5rem",
          borderBottom: "1px solid #e2e8f0",
          background: "white",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "none",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            cursor: "pointer",
            color: "#64748b",
            fontSize: "1rem",
            padding: "0.2rem 0.6rem",
            lineHeight: 1.5,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{contact.nome}</div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "#64748b",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              marginTop: "0.1rem",
            }}
          >
            <span className={`badge badge-${channel}`}>
              {channel === "whatsapp" ? "WhatsApp" : "Instagram"}
            </span>
            {contact.telefone && <span>{contact.telefone}</span>}
            {contact.instagram_id && <span>@{contact.instagram_id}</span>}
          </div>
        </div>
        <span
          style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "12px",
            background: "#f1f5f9",
            fontSize: "0.78rem",
            fontWeight: 500,
            color: "#475569",
          }}
        >
          {STATUS_LABELS[contact.status] ?? contact.status}
        </span>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "1rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          background: "#f8fafc",
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", marginTop: "3rem", fontSize: "0.9rem" }}>
            Nenhuma mensagem registrada.
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.direction === "outbound" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "68%",
                padding: "0.55rem 0.85rem",
                borderRadius:
                  msg.direction === "outbound" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                background: msg.direction === "outbound" ? "#3b82f6" : "white",
                color: msg.direction === "outbound" ? "white" : "#0f172a",
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                fontSize: "0.88rem",
              }}
            >
              <p style={{ margin: 0, lineHeight: 1.5 }}>{msg.conteudo}</p>
              <p
                style={{
                  margin: "0.2rem 0 0",
                  fontSize: "0.68rem",
                  color: msg.direction === "outbound" ? "rgba(255,255,255,0.65)" : "#94a3b8",
                  textAlign: "right",
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "0.875rem 1.5rem",
          borderTop: "1px solid #e2e8f0",
          background: "white",
        }}
      >
        {sendError && (
          <div style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            {sendError}
          </div>
        )}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            rows={2}
            style={{
              flex: 1,
              resize: "none",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "0.6rem 0.75rem",
              fontFamily: "inherit",
              fontSize: "0.88rem",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            style={{
              padding: "0 1.25rem",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: !text.trim() || sending ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "0.88rem",
              opacity: !text.trim() || sending ? 0.5 : 1,
              transition: "opacity 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {sending ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
