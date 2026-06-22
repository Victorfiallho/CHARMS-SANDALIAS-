/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
  },
  transpilePackages: ["@charms/db", "@charms/types", "@charms/integrations"],
};

export default nextConfig;
