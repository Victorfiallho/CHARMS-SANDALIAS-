import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const webDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(webDir, "../..");

// Carrega o .env.local da raiz do monorepo antes do Next.js resetar o process.env
dotenv.config({ path: path.join(rootDir, ".env.local") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@charms/integrations"],
  // Expõe vars para o browser (Supabase Realtime usa anon key client-side)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
  experimental: {
    // TTL 0 no Router Cache para rotas dinâmicas: toda navegação busca RSC
    // payload fresco do servidor em vez de servir cache de até 30s.
    staleTimes: { dynamic: 0 },
  },
};

export default nextConfig;
