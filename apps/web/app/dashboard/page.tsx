import { supabase } from "@/lib/supabase";
import KanbanBoard from "./components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, nome, telefone, instagram_id, origem, status, created_at, last_seen_at")
    .order("created_at", { ascending: false });

  return <KanbanBoard initialContacts={contacts ?? []} />;
}
