import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ConversationView from "../../components/ConversationView";

export const dynamic = "force-dynamic";

export default async function ContactPage({ params }: { params: { id: string } }) {
  const [{ data: contact }, { data: messages }] = await Promise.all([
    supabase.from("contacts").select("id, nome, telefone, instagram_id, origem, status").eq("id", params.id).single(),
    supabase.from("messages").select("id, canal, direction, conteudo, timestamp").eq("contact_id", params.id).order("timestamp", { ascending: true }),
  ]);

  if (!contact) notFound();

  return <ConversationView contact={contact} initialMessages={messages ?? []} />;
}
