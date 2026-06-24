import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    staleTimes: { dynamic: 0 },
  },
  webpack: (config) => {
    // Garante que @/ resolve para apps/web/ independente do CWD do build
    config.resolve.alias["@"] = __dirname;
    return config;
  },
};

export default nextConfig;
