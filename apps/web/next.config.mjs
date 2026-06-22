import { loadEnvConfig } from "@next/env";
import path from "path";
import { fileURLToPath } from "url";

// Next.js procura .env.local na pasta apps/web/, mas nosso arquivo fica na raiz do monorepo.
// Isso carrega o .env.local da raiz antes de qualquer coisa.
const webDir = path.dirname(fileURLToPath(import.meta.url)); // apps/web/
const rootDir = path.resolve(webDir, "../.."); // CharmsSandalias/
loadEnvConfig(rootDir);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@charms/db", "@charms/types", "@charms/integrations"],
};

export default nextConfig;
