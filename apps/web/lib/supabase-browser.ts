import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Singleton — createBrowserClient persiste sessão via cookie (necessário para auth)
export const supabaseBrowser = createBrowserClient(url, key, {
  realtime: { params: { eventsPerSecond: 10 } },
});
