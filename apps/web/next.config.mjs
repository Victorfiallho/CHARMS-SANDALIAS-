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
    // TTL 0: toda navegação busca RSC payload fresco do servidor.
    // Garante que Pipeline, Contatos e Relatórios sempre refletem o mesmo
    // estado do banco — evita dessincronia entre módulos com cache stale.
    staleTimes: { dynamic: 0 },
  },
};

export default nextConfig;
