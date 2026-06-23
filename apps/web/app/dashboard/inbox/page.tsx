import { supabase } from "@/lib/supabase";
import InboxClient from "./InboxClient";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const [{ data: contacts }, { data: messages }] = await Promise.all([
    supabase.from("contacts").select("id, nome, telefone, instagram_id, origem, status, tags, created_at, last_seen_at"),
    supabase.from("messages").select("id, contact_id, conteudo, direction, timestamp").order("timestamp", { ascending: false }).limit(500),
  ]);

  const lastMessages: { contact_id: string; conteudo: string; direction: "inbound" | "outbound"; timestamp: string }[] = [];
  const seen = new Set<string>();
  for (const m of (messages ?? [])) {
    if (!seen.has(m.contact_id)) {
      seen.add(m.contact_id);
      lastMessages.push({ contact_id: m.contact_id, conteudo: m.conteudo, direction: m.direction as "inbound" | "outbound", timestamp: m.timestamp });
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-header-title">Inbox</h1>
          <p className="page-header-sub">Todas as conversas ativas</p>
        </div>
      </header>
      <InboxClient contacts={contacts ?? []} lastMessages={lastMessages} />
    </>
  );
}
