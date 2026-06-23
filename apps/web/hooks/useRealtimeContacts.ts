"use client";

import { useEffect, useState } from "react";
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

export function useRealtimeContacts(initialContacts: RealtimeContact[]) {
  const [contacts, setContacts] = useState<RealtimeContact[]>(initialContacts);

  // Fetch client-side no mount — bypassa o Router Cache do Next.js completamente.
  // Garante que ao navegar de volta ao módulo, os dados são sempre frescos do banco.
  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: RealtimeContact[] | null) => {
        if (data) setContacts(data);
      })
      .catch(() => {});
  }, []);

  // Supabase Realtime — atualiza estado em tempo real enquanto o componente está montado
  useEffect(() => {
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anon) return;

    const channel = supabaseBrowser
      .channel("contacts-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        (payload) => {
          setContacts((prev) => {
            if (payload.eventType === "INSERT") {
              const c = payload.new as RealtimeContact;
              return prev.some((x) => x.id === c.id) ? prev : [c, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const c = payload.new as RealtimeContact;
              return prev.map((x) => (x.id === c.id ? { ...x, ...c } : x));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((x) => x.id !== (payload.old as { id: string }).id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, []);

  return [contacts, setContacts] as const;
}
