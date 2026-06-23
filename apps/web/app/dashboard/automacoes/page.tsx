"use client";

import { useState } from "react";

type Rule = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  delay: string;
  canal: "whatsapp" | "instagram" | "ambos";
  enabled: boolean;
  executions: number;
};

const INITIAL_RULES: Rule[] = [
  {
    id: "1",
    name: "Boas-vindas WhatsApp",
    trigger: "Novo lead entra no pipeline",
    action: "Enviar mensagem: \"Olá! Vi que você está interessada nas nossas sandálias. Posso ajudar?\"",
    delay: "Imediato",
    canal: "whatsapp",
    enabled: true,
    executions: 47,
  },
  {
    id: "2",
    name: "Follow-up Qualificado",
    trigger: "Lead movido para Qualificado",
    action: "Enviar catálogo de produtos em PDF + link de agendamento",
    delay: "30 minutos",
    canal: "ambos",
    enabled: true,
    executions: 23,
  },
  {
    id: "3",
    name: "Lembrete de Negociação",
    trigger: "Lead em Negociação há mais de 48h sem resposta",
    action: "Enviar mensagem: \"Ainda podemos ajudar com sua escolha! Ficou alguma dúvida?\"",
    delay: "48 horas",
    canal: "whatsapp",
    enabled: false,
    executions: 8,
  },
  {
    id: "4",
    name: "Pós-venda Avaliação",
    trigger: "Lead movido para Pós-venda",
    action: "Enviar pesquisa de satisfação via link",
    delay: "3 dias",
    canal: "ambos",
    enabled: true,
    executions: 15,
  },
  {
    id: "5",
    name: "Boas-vindas Instagram",
    trigger: "Nova mensagem direta recebida pelo Instagram",
    action: "Responder automaticamente com cardápio de opções (Sandálias / Preços / Lojas)",
    delay: "Imediato",
    canal: "instagram",
    enabled: false,
    executions: 0,
  },
];

const CANAL_COLOR: Record<string, string> = {
  whatsapp: "#15803D",
  instagram: "#9D174D",
  ambos: "#1D4ED8",
};
const CANAL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  ambos: "Ambos",
};

function TriggerIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 8l5-5 3 3 5-5"/>
      <path d="M13 3v4h-4"/>
    </svg>
  );
}
function ActionIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 2L8 8M14 2H10M14 2V6"/>
      <rect x="2" y="6" width="8" height="8" rx="1"/>
    </svg>
  );
}

export default function AutomacoesPage() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);

  const toggle = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const activeCount = rules.filter((r) => r.enabled).length;
  const totalExec   = rules.reduce((acc, r) => acc + r.executions, 0);

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-header-title">Automações</h1>
          <p className="page-header-sub">Regras de gatilho e resposta automática</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[
              { label: "Ativas", value: activeCount, color: "#15803D" },
              { label: "Execuções totais", value: totalExec, color: "#1D4ED8" },
            ].map((k) => (
              <div key={k.label} style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 4, padding: "0.25rem 0.75rem", textAlign: "center" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: k.color, letterSpacing: "-0.04em" }}>{k.value}</div>
                <div style={{ fontSize: "0.6rem", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</div>
              </div>
            ))}
          </div>
          <button disabled className="corp-btn corp-btn-primary" style={{ opacity: 0.5 }} title="Em breve">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            Nova regra
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: "1.25rem", background: "#F9FAFB" }}>

        {/* Info banner */}
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 4, padding: "0.625rem 1rem", marginBottom: "1rem", display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="#1D4ED8" style={{ flexShrink: 0, marginTop: 1 }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          <span style={{ fontSize: "0.72rem", color: "#374151" }}>
            As automações abaixo serão executadas pelo worker quando o webhook da Meta estiver ativo. Ative/desative individualmente sem afetar as demais.
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {rules.map((rule) => (
            <div key={rule.id} style={{
              background: "white", border: "1px solid #E5E7EB", borderRadius: 4,
              padding: "0.875rem 1rem", borderLeft: `3px solid ${rule.enabled ? CANAL_COLOR[rule.canal] : "#E5E7EB"}`,
              opacity: rule.enabled ? 1 : 0.65, transition: "all 0.1s",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#111827" }}>{rule.name}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.62rem", color: CANAL_COLOR[rule.canal], fontWeight: 600 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                      {CANAL_LABEL[rule.canal]}
                    </span>
                    {rule.executions > 0 && (
                      <span style={{ fontSize: "0.62rem", color: "#9CA3AF" }}>{rule.executions} execuções</span>
                    )}
                  </div>

                  {/* Trigger + Action */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <div style={{ display: "flex", gap: "0.375rem", alignItems: "flex-start" }}>
                      <span style={{ color: "#6B7280", flexShrink: 0, marginTop: 1 }}><TriggerIcon /></span>
                      <div>
                        <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                          Gatilho · {rule.delay}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#374151" }}>{rule.trigger}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.375rem", alignItems: "flex-start" }}>
                      <span style={{ color: "#6B7280", flexShrink: 0, marginTop: 1 }}><ActionIcon /></span>
                      <div>
                        <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Ação</div>
                        <div style={{ fontSize: "0.72rem", color: "#374151", lineHeight: 1.4 }}>{rule.action}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggle */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", flexShrink: 0 }}>
                  <button
                    onClick={() => toggle(rule.id)}
                    style={{
                      width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
                      background: rule.enabled ? "#111827" : "#E5E7EB",
                      position: "relative", transition: "background 0.15s",
                    }}
                    title={rule.enabled ? "Desativar" : "Ativar"}
                  >
                    <span style={{
                      position: "absolute", top: 3, left: rule.enabled ? 19 : 3,
                      width: 14, height: 14, borderRadius: "50%", background: "white",
                      transition: "left 0.15s",
                    }} />
                  </button>
                  <span style={{ fontSize: "0.58rem", color: rule.enabled ? "#15803D" : "#9CA3AF", fontWeight: 600 }}>
                    {rule.enabled ? "On" : "Off"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "0.68rem", color: "#9CA3AF", marginTop: "1rem", textAlign: "center" }}>
          Criação e edição de regras disponível na Fase 2 — integração com webhook Meta ativo.
        </p>
      </div>
    </>
  );
}
