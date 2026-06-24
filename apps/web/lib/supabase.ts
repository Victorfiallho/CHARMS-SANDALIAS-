import { createClient } from "@supabase/supabase-js";

const url  = process.env.SUPABASE_URL  ?? "";
const key  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, cache: "no-store" }),
  },
});
