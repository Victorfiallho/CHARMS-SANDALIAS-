"use client";

import { useState } from "react";

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

type Props = {
  onClose: () => void;
  onCreated: (contact: Contact) => void;
};

const STAGES = [
  { key: "novo",        label: "Novo" },
  { key: "qualificado", label: "Qualificado" },
  { key: "negociacao",  label: "Negociação" },
  { key: "fechamento",  label: "Fechamento" },
  { key: "pos-venda",   label: "Pós-venda" },
];

export default function NovoContatoModal({ onClose, onCreated }: Props) {
  const [nome, setNome] = useState("");
  const [canal, setCanal] = useState<"whatsapp" | "instagram">("whatsapp");
  const [telefone, setTelefone] = useState("");
  const [instaHandle, setInstaHandle] = useState("");
  const [status, setStatus] = useState("novo");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!nome.trim()) { setError("Nome é obrigatório"); return; }
    if (canal === "whatsapp" && !telefone.trim()) { setError("Telefone é obrigatório para WhatsApp"); return; }
    if (canal === "instagram" && !instaHandle.trim()) { setError("Handle é obrigatório para Instagram"); return; }

    setSaving(true);
    setError("");

    const body: Record<string, unknown> = {
      nome: nome.trim(),
      origem: canal,
      status,
      tags: [],
    };
    if (canal === "whatsapp") body.telefone = telefone.replace(/\D/g, "");
    else body.instagram_id = instaHandle.replace(/^@/, "");

    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      const contact = await res.json();
      onCreated(contact);
      onClose();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? "Erro ao criar contato");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "white", borderRadius: 16, width: 440, maxWidth: "92vw",
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
          padding: "1.75rem",
          animation: "slideUp 0.18s ease",
        }}
        onKeyDown={onKeyDown}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Novo contato</h2>
            <p style={{ margin: "0.1rem 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>Preencha os dados para adicionar ao pipeline</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "1.1rem", padding: "0.2rem 0.4rem", borderRadius: 4 }}>✕</button>
        </div>

        {/* Nome */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
            Nome completo *
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Maria Silva"
            autoFocus
            style={{
              width: "100%", padding: "0.55rem 0.75rem",
              border: "1.5px solid #d1d5db", borderRadius: 8,
              fontSize: "0.88rem", fontFamily: "inherit",
              outline: "none", boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; }}
            onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; }}
          />
        </div>

        {/* Canal */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Canal</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(["whatsapp", "instagram"] as const).map((c) => {
              const isSelected = canal === c;
              const color = c === "whatsapp" ? "#16a34a" : "#be185d";
              return (
                <button key={c} onClick={() => setCanal(c)} type="button" style={{
                  flex: 1, padding: "0.6rem",
                  border: `2px solid ${isSelected ? color : "#e5e7eb"}`,
                  borderRadius: 8, cursor: "pointer",
                  background: isSelected ? (c === "whatsapp" ? "#f0fdf4" : "#fdf2f8") : "white",
                  fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600,
                  color: isSelected ? color : "#64748b",
                  transition: "all 0.12s",
                }}>
                  {c === "whatsapp" ? "📱 WhatsApp" : "📸 Instagram"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Identificador */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
            {canal === "whatsapp" ? "Telefone (DDI+DDD+número) *" : "Instagram handle *"}
          </label>
          {canal === "whatsapp" ? (
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Ex: 5511999887766"
              style={{
                width: "100%", padding: "0.55rem 0.75rem",
                border: "1.5px solid #d1d5db", borderRadius: 8,
                fontSize: "0.88rem", fontFamily: "inherit",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; }}
              onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; }}
            />
          ) : (
            <input
              type="text"
              value={instaHandle}
              onChange={(e) => setInstaHandle(e.target.value)}
              placeholder="@usuario"
              style={{
                width: "100%", padding: "0.55rem 0.75rem",
                border: "1.5px solid #d1d5db", borderRadius: 8,
                fontSize: "0.88rem", fontFamily: "inherit",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; }}
              onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; }}
            />
          )}
        </div>

        {/* Estágio */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
            Estágio inicial
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: "100%", padding: "0.55rem 0.75rem",
              border: "1.5px solid #d1d5db", borderRadius: 8,
              fontSize: "0.88rem", fontFamily: "inherit",
              outline: "none", background: "white",
              cursor: "pointer",
            }}
          >
            {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8,
            padding: "0.5rem 0.75rem", marginBottom: "1rem",
            fontSize: "0.82rem", color: "#dc2626",
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "0.55rem 1.25rem", border: "1.5px solid #e2e8f0",
            borderRadius: 8, cursor: "pointer", background: "white",
            fontSize: "0.85rem", fontFamily: "inherit", color: "#374151", fontWeight: 500,
          }}>
            Cancelar
          </button>
          <button onClick={submit} disabled={saving} style={{
            padding: "0.55rem 1.5rem", border: "none",
            borderRadius: 8, cursor: saving ? "not-allowed" : "pointer",
            background: saving ? "#94a3b8" : "#0f172a",
            fontSize: "0.85rem", fontFamily: "inherit", color: "white", fontWeight: 600,
            transition: "background 0.15s",
          }}>
            {saving ? "Salvando…" : "Criar contato"}
          </button>
        </div>
      </div>
    </div>
  );
}
