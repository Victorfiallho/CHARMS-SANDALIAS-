"use client";

import type { ReactNode } from "react";

type Field = { label: string; placeholder: string; value?: string; type?: string };

function Section({ title, icon, status, fields }: {
  title: string;
  icon: ReactNode;
  status: "configurado" | "pendente";
  fields: Field[];
}) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </div>
          <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>{title}</h2>
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: status === "configurado" ? "#f0fdf4" : "#fefce8",
          color: status === "configurado" ? "#15803d" : "#a16207",
          padding: "0.22rem 0.65rem", borderRadius: 999,
          fontSize: "0.72rem", fontWeight: 600,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
          {status === "configurado" ? "Configurado" : "Pendente"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
        {fields.map((f) => (
          <div key={f.label}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
              {f.label}
            </label>
            <input
              type={f.type ?? "text"}
              defaultValue={f.value ?? ""}
              placeholder={f.placeholder}
              disabled
              style={{
                width: "100%", padding: "0.5rem 0.75rem",
                border: "1px solid #e2e8f0", borderRadius: 8,
                fontSize: "0.82rem", fontFamily: "inherit",
                background: "#f8fafc", color: "#64748b",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
        <button disabled style={{
          background: "#0f172a", color: "white", border: "none",
          borderRadius: 8, padding: "0.45rem 1rem",
          fontSize: "0.8rem", fontWeight: 600, cursor: "not-allowed",
          opacity: 0.4, fontFamily: "inherit",
        }}>
          Salvar alterações
        </button>
      </div>
    </div>
  );
}

const WppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.95l4.908-1.368A9.952 9.952 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.079-1.117l-.292-.174-3.022.842.842-3.022-.174-.292A8 8 0 1112 20z"/>
  </svg>
);

const IgIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#e1306c">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const BlingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
    <path d="M7 8h10M7 11h5"/>
  </svg>
);

export default function ConfiguracoesPage() {
  return (
    <>
      <header style={{
        background: "white", borderBottom: "1px solid #e2e8f0",
        padding: "0 1.5rem", height: 60, flexShrink: 0,
        display: "flex", alignItems: "center",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Configurações</h1>
          <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8", marginTop: 1 }}>Integrações e credenciais</p>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: "1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>

          {/* Webhook URL */}
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="#3b82f6" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1d4ed8", marginBottom: 2 }}>URL do Webhook</div>
              <code style={{ fontSize: "0.78rem", color: "#1e40af", background: "transparent" }}>
                https://seudominio.com/api/webhook/whatsapp
              </code>
            </div>
            <button disabled style={{
              background: "#3b82f6", color: "white", border: "none",
              borderRadius: 7, padding: "0.3rem 0.75rem",
              fontSize: "0.75rem", fontWeight: 600, cursor: "not-allowed",
              opacity: 0.6, fontFamily: "inherit",
            }}>
              Copiar
            </button>
          </div>

          <Section
            title="WhatsApp Business"
            icon={<WppIcon />}
            status="pendente"
            fields={[
              { label: "Phone Number ID",   placeholder: "123456789012345" },
              { label: "WhatsApp Business Account ID", placeholder: "987654321098765" },
              { label: "Access Token",      placeholder: "EAAxxxxxxx…", type: "password" },
              { label: "Webhook Verify Token", placeholder: "meu-token-secreto" },
            ]}
          />

          <Section
            title="Instagram"
            icon={<IgIcon />}
            status="pendente"
            fields={[
              { label: "Page ID",       placeholder: "123456789" },
              { label: "Access Token",  placeholder: "EAAxxxxxxx…", type: "password" },
            ]}
          />

          <Section
            title="Bling ERP"
            icon={<BlingIcon />}
            status="pendente"
            fields={[
              { label: "Client ID",     placeholder: "bling-client-id" },
              { label: "Client Secret", placeholder: "bling-secret-key", type: "password" },
            ]}
          />

          {/* Danger zone */}
          <div style={{ background: "white", borderRadius: 12, padding: "1.25rem 1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #fee2e2" }}>
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", fontWeight: 700, color: "#dc2626" }}>Zona de perigo</h2>
            <p style={{ margin: "0 0 1rem", fontSize: "0.8rem", color: "#94a3b8" }}>Ações irreversíveis. Certifique-se antes de prosseguir.</p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button disabled style={{
                background: "white", color: "#dc2626", border: "1px solid #fca5a5",
                borderRadius: 8, padding: "0.42rem 0.875rem",
                fontSize: "0.78rem", fontWeight: 600, cursor: "not-allowed",
                opacity: 0.5, fontFamily: "inherit",
              }}>
                Limpar dados de demo
              </button>
              <button disabled style={{
                background: "#dc2626", color: "white", border: "none",
                borderRadius: 8, padding: "0.42rem 0.875rem",
                fontSize: "0.78rem", fontWeight: 600, cursor: "not-allowed",
                opacity: 0.5, fontFamily: "inherit",
              }}>
                Resetar sistema
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
