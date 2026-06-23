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
      <header className="page-header">
        <div>
          <h1 className="page-header-title">Contatos</h1>
          <p className="page-header-sub">{all.length} contatos cadastrados</p>
        </div>
      </header>

      <ContactsClient contacts={all} />
    </>
  );
}
