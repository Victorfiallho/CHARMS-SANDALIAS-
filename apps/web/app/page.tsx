"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabaseBrowser.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #FAF9F6 0%, #F5EEE9 100%)",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      padding: "1.5rem",
    }}>
      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 400,
        background: "white", borderRadius: 12,
        border: "1px solid #EDE5E2",
        boxShadow: "0 4px 24px rgba(163,120,115,0.10)",
        overflow: "hidden",
      }}>
        {/* Topo com marca */}
        <div style={{
          background: "#1A1010", padding: "2rem 2.5rem 1.75rem",
          textAlign: "center",
        }}>
          {/* Ícone */}
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(195,139,144,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#C38B90"/>
            </svg>
          </div>
          <div style={{ color: "#C38B90", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>
            Charms Sandálias
          </div>
          <div style={{ color: "white", fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            CRM Omnichannel
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ padding: "2rem 2.5rem" }}>
          <div style={{ marginBottom: "0.25rem", color: "#4A3535", fontSize: "0.9rem", fontWeight: 600, marginTop: 0 }}>
            Entrar na plataforma
          </div>
          <div style={{ color: "#9A7878", fontSize: "0.72rem", marginBottom: "1.5rem" }}>
            Use suas credenciais de acesso
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#4A3535", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              E-mail
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com" required autoComplete="email"
              style={{
                width: "100%", padding: "0.65rem 0.875rem",
                border: "1px solid #EDE5E2", borderRadius: 6,
                fontSize: "0.85rem", fontFamily: "inherit", outline: "none",
                background: "#FAF9F6", color: "#1A1010",
                boxSizing: "border-box", transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#C38B90"; }}
              onBlur={(e) => { e.target.style.borderColor = "#EDE5E2"; }}
            />
          </div>

          {/* Senha */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#4A3535", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Senha
            </label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
              style={{
                width: "100%", padding: "0.65rem 0.875rem",
                border: "1px solid #EDE5E2", borderRadius: 6,
                fontSize: "0.85rem", fontFamily: "inherit", outline: "none",
                background: "#FAF9F6", color: "#1A1010",
                boxSizing: "border-box", transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#C38B90"; }}
              onBlur={(e) => { e.target.style.borderColor = "#EDE5E2"; }}
            />
          </div>

          {/* Erro */}
          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 6, padding: "0.6rem 0.875rem",
              fontSize: "0.75rem", color: "#DC2626",
              marginBottom: "1rem",
            }}>
              {error}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: "0.75rem",
              background: loading ? "#DDD0CC" : "#C38B90",
              color: "white", border: "none", borderRadius: 6,
              fontSize: "0.85rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.04em", transition: "background 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#B87D82"; }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#C38B90"; }}
          >
            {loading ? (
              <>
                <svg style={{ animation: "spin 1s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="40 20"/>
                </svg>
                Entrando…
              </>
            ) : "Entrar"}
          </button>

          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </form>

        {/* Rodapé */}
        <div style={{
          borderTop: "1px solid #F5EEE9", padding: "1rem 2.5rem",
          textAlign: "center", fontSize: "0.65rem", color: "#C4A8A0",
        }}>
          Charms Sandálias · CRM interno · v1.0
        </div>
      </div>
    </div>
  );
}
