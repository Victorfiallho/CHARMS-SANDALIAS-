import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error(
    "⚠️  Variáveis de ambiente do Supabase não encontradas.\n" +
      "Crie o arquivo .env.local na raiz do projeto com:\n\n" +
      "  SUPABASE_URL=https://xxxx.supabase.co\n" +
      "  SUPABASE_SERVICE_ROLE_KEY=eyJ...\n\n" +
      "Veja o .env.example para referência."
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
