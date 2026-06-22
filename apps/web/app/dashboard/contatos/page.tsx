import { supabase } from "@/lib/supabase";
import ContactsClient from "./ContactsClient";

export const dynamic = "force-dynamic";

export default async function ContatosPage() {
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("last_seen_at", { ascending: false });

  if (error) {
    return <div style={{ padding: "2rem", color: "#ef4444" }}>Erro: {error.message}</div>;
  }

  const all = contacts ?? [];

  return (
    <>
      <header style={{
        background: "white", borderBottom: "1px solid #e2e8f0",
        padding: "0 1.5rem", height: 60, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
            Contatos
          </h1>
          <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8", marginTop: 1 }}>
            {all.length} contatos cadastrados
          </p>
        </div>
        <button disabled title="Em breve" style={{
          display: "flex", alignItems: "center", gap: "0.35rem",
          background: "#0f172a", color: "white", border: "none", borderRadius: 8,
          padding: "0.42rem 0.85rem", fontSize: "0.78rem", fontWeight: 600,
          cursor: "not-allowed", opacity: 0.45, fontFamily: "inherit",
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          Novo contato
        </button>
      </header>

      <ContactsClient contacts={all} />
    </>
  );
}
