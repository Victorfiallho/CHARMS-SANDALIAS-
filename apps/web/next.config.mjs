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
};

export default nextConfig;
