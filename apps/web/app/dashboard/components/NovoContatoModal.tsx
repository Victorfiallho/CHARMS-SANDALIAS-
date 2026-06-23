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

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.42rem 0.625rem",
  border: "1px solid #D1D5DB", borderRadius: 4,
  fontSize: "0.82rem", fontFamily: "inherit",
  outline: "none", boxSizing: "border-box",
  transition: "border-color 0.1s",
  color: "#111827", background: "white",
};

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
      nome: nome.trim(), origem: canal, status, tags: [],
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
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "white", borderRadius: 6, width: 420, maxWidth: "92vw",
          border: "1px solid #E5E7EB",
          boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
          padding: "1.25rem",
          animation: "slideUp 0.18s ease",
        }}
        onKeyDown={onKeyDown}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.125rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>Novo contato</h2>
            <p style={{ margin: "0.1rem 0 0", fontSize: "0.68rem", color: "#9CA3AF" }}>Preencha os dados para adicionar ao pipeline</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "0.15rem 0.3rem", borderRadius: 3, fontSize: "1rem", lineHeight: 1 }}>✕</button>
        </div>

        {/* Nome */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, color: "#6B7280", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Nome completo *
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Maria Silva"
            autoFocus
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "#6B7280"; }}
            onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; }}
          />
        </div>

        {/* Canal — segmented control */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, color: "#6B7280", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Canal</label>
          <div style={{ display: "flex", border: "1px solid #E5E7EB", borderRadius: 4, overflow: "hidden" }}>
            {(["whatsapp", "instagram"] as const).map((c, i) => (
              <button key={c} onClick={() => setCanal(c)} type="button" style={{
                flex: 1, padding: "0.4rem 0",
                border: "none",
                borderRight: i === 0 ? "1px solid #E5E7EB" : "none",
                cursor: "pointer",
                background: canal === c ? "#111827" : "white",
                fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 600,
                color: canal === c ? "white" : "#6B7280",
                transition: "all 0.1s",
              }}>
                {c === "whatsapp" ? "WhatsApp" : "Instagram"}
              </button>
            ))}
          </div>
        </div>

        {/* Identificador */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, color: "#6B7280", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {canal === "whatsapp" ? "Telefone (DDI+DDD+número) *" : "Instagram handle *"}
          </label>
          {canal === "whatsapp" ? (
            <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)}
              placeholder="5511999887766" style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#6B7280"; }}
              onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; }}
            />
          ) : (
            <input type="text" value={instaHandle} onChange={(e) => setInstaHandle(e.target.value)}
              placeholder="@usuario" style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#6B7280"; }}
              onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; }}
            />
          )}
        </div>

        {/* Estágio */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, color: "#6B7280", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Estágio inicial
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer", background: "white" }}>
            {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        {error && (
          <div style={{
            border: "1px solid #FECACA", borderRadius: 4,
            padding: "0.4rem 0.625rem", marginBottom: "0.75rem",
            fontSize: "0.72rem", color: "#DC2626", background: "#FFF5F5",
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button onClick={onClose} className="corp-btn corp-btn-secondary">
            Cancelar
          </button>
          <button onClick={submit} disabled={saving} className="corp-btn corp-btn-primary" style={{ opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Salvando…" : "Criar contato"}
          </button>
        </div>
      </div>
    </div>
  );
}
