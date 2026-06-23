"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export type RealtimeContact = {
  id: string;
  nome: string;
  telefone: string | null;
  instagram_id: string | null;
  origem: string;
  status: string;
  tags: string[];
  created_at?: string;
  last_seen_at: string | null;
};

// Mantém o state local sincronizado com o Supabase em tempo real.
// Inicia com os dados do SSR (initialContacts) e aplica patches conforme
// chegam eventos INSERT / UPDATE / DELETE da tabela contacts.
export function useRealtimeContacts(initialContacts: RealtimeContact[]) {
  const [contacts, setContacts] = useState<RealtimeContact[]>(initialContacts);

  // Sync quando o servidor entrega novos props (ex: router.refresh())
  const prevInitial = useRef(initialContacts);
  useEffect(() => {
    if (prevInitial.current !== initialContacts) {
      prevInitial.current = initialContacts;
      setContacts(initialContacts);
    }
  }, [initialContacts]);

  useEffect(() => {
    // Sem anon key configurada — skip Realtime, dados do SSR + router.refresh() bastam
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;

    const channel = supabaseBrowser
      .channel("contacts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const c = payload.new as RealtimeContact;
            setContacts((prev) => prev.some((x) => x.id === c.id) ? prev : [c, ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            const c = payload.new as RealtimeContact;
            setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, ...c } : x));
          }
          if (payload.eventType === "DELETE") {
            const c = payload.old as { id: string };
            setContacts((prev) => prev.filter((x) => x.id !== c.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          // Realtime não habilitado para esta tabela — fallback silencioso
          supabaseBrowser.removeChannel(channel);
        }
      });

    return () => { supabaseBrowser.removeChannel(channel); };
  }, []);

  // Expõe um setter para atualizações otimistas locais (drag-drop, edits inline)
  return [contacts, setContacts] as const;
}
