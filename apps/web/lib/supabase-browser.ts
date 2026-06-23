import { createClient } from "@supabase/supabase-js";

// Usa a anon key — seguro no browser, limitado pelo RLS
const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseBrowser = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 10 } },
});
