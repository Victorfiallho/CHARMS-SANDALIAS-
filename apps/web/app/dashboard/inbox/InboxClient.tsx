"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeContacts } from "@/hooks/useRealtimeContacts";
import ConversationView from "../components/ConversationView";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { InitialsColored as Initials } from "@/components/Avatar";
import type { Contact } from "@/types/contact";

type LastMsg = {
  contact_id: string;
  conteudo: string;
  direction: "inbound" | "outbound";
  timestamp: string;
};

type Props = {
  contacts: Contact[];
  lastMessages: LastMsg[];
};

const CANAL_TABS = ["Todos", "WhatsApp", "Instagram"] as const;

export default function InboxClient({ contacts: initialContacts, lastMessages }: Props) {
  const router = useRouter();
  const [contacts, setContacts] = useRealtimeContacts(initialContacts);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [canal, setCanal] = useState<typeof CANAL_TABS[number]>("Todos");
  const [search, setSearch] = useState("");

  const lastMsgMap = useMemo(() => {
    const map: Record<string, LastMsg> = {};
    for (const m of lastMessages) {
      if (!map[m.contact_id] || new Date(m.timestamp) > new Date(map[m.contact_id].timestamp)) {
        map[m.contact_id] = m;
      }
    }
    return map;
  }, [lastMessages]);

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    return [...contacts]
      .filter((c) => {
        const matchSearch = !q || c.nome.toLowerCase().includes(q) || c.telefone?.includes(q) || c.instagram_id?.toLowerCase().includes(q);
        const matchCanal = canal === "Todos" || (canal === "WhatsApp" && c.origem === "whatsapp") || (canal === "Instagram" && c.origem === "instagram");
        return matchSearch && matchCanal;
      })
      .sort((a, b) => {
        const ta = lastMsgMap[a.id]?.timestamp ?? a.created_at ?? "";
        const tb = lastMsgMap[b.id]?.timestamp ?? b.created_at ?? "";
        return tb.localeCompare(ta);
      });
  }, [contacts, lastMsgMap, canal, search]);

  const inbound = sorted.filter((c) => lastMsgMap[c.id]?.direction === "inbound").length;

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Conversation list */}
      <div style={{ width: 320, flexShrink: 0, borderRight: "1px solid #E5E7EB", display: "flex", flexDirection: "column", overflow: "hidden", background: "white" }}>
        {/* Toolbar */}
        <div style={{ padding: "0.625rem 0.75rem", borderBottom: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <svg style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input
                type="text" placeholder="Buscar…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", padding: "0.3rem 0.5rem 0.3rem 1.6rem", border: "1px solid #E5E7EB", borderRadius: 4, fontSize: "0.72rem", fontFamily: "inherit", outline: "none", background: "#F9FAFB", boxSizing: "border-box" }}
              />
            </div>
            {inbound > 0 && (
              <span style={{ background: "#C38B90", color: "white", fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.35rem", borderRadius: 99, flexShrink: 0 }}>
                {inbound}
              </span>
            )}
          </div>
          <div style={{ display: "flex", border: "1px solid #E5E7EB", borderRadius: 4, overflow: "hidden" }}>
            {CANAL_TABS.map((t, i) => (
              <button key={t} onClick={() => setCanal(t)} style={{
                flex: 1, padding: "0.25rem 0", border: "none",
                borderRight: i < CANAL_TABS.length - 1 ? "1px solid #E5E7EB" : "none",
                cursor: "pointer", fontSize: "0.68rem", fontWeight: 500, fontFamily: "inherit",
                background: canal === t ? "#111827" : "white",
                color: canal === t ? "white" : "#6B7280",
                transition: "all 0.1s",
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {sorted.length === 0 && (
            <div style={{ padding: "2rem", textAlign: "center", color: "#9CA3AF", fontSize: "0.75rem" }}>
              Nenhuma conversa encontrada.
            </div>
          )}
          {sorted.map((c) => {
            const last = lastMsgMap[c.id];
            const isSelected = selected?.id === c.id;
            const isInbound = last?.direction === "inbound";
            const canalColor = c.origem === "whatsapp" ? "#15803D" : "#9D174D";
            return (
              <div
                key={c.id}
                onClick={() => setSelected(isSelected ? null : c)}
                style={{
                  padding: "0.625rem 0.75rem", cursor: "pointer",
                  borderBottom: "1px solid #F3F4F6",
                  background: isSelected ? "#FDF0F1" : isInbound ? "#FAFAFA" : "white",
                  transition: "background 0.1s",
                  borderLeft: isInbound ? "2px solid #C38B90" : "2px solid transparent",
                }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = isInbound ? "#FAFAFA" : "white"; }}
              >
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                  <Initials nome={c.nome} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.15rem" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: isInbound ? 700 : 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.nome}
                      </span>
                      {last && (
                        <span style={{ fontSize: "0.6rem", color: "#9CA3AF", flexShrink: 0, marginLeft: 4 }}>
                          {timeAgo(last.timestamp)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "0.2rem" }}>
                      {last ? (
                        <span style={{ color: last.direction === "outbound" ? "#9CA3AF" : "#374151", fontWeight: last.direction === "inbound" ? 500 : 400 }}>
                          {last.direction === "outbound" && <span style={{ color: "#9CA3AF" }}>Você: </span>}
                          {last.conteudo}
                        </span>
                      ) : (
                        <span style={{ fontStyle: "italic" }}>Sem mensagens</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.6rem", color: "#9CA3AF" }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: canalColor, display: "inline-block" }} />
                        {c.origem === "whatsapp" ? "WA" : "IG"}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.6rem", color: STATUS_COLOR[c.status] ?? "#6B7280", fontWeight: 600 }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel */}
      {selected ? (
        <ConversationView
          contact={{ ...selected, stageColor: STATUS_COLOR[selected.status] }}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => {
            setContacts((prev) => prev.map((c) => c.id === updated.id ? { ...c, ...updated } : c));
            setSelected((prev) => prev?.id === updated.id ? { ...prev, ...updated } as Contact : prev);
            router.refresh();
          }}
        />
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
          <div style={{ textAlign: "center", color: "#9CA3AF" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: "0 auto 0.75rem", display: "block", opacity: 0.4 }}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6B7280" }}>Selecione uma conversa</div>
            <div style={{ fontSize: "0.68rem", color: "#9CA3AF", marginTop: 3 }}>{sorted.length} conversas · {inbound} aguardando resposta</div>
          </div>
        </div>
      )}
    </div>
  );
}
