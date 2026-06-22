import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Charms Sandálias",
  description: "Painel CRM omnichannel para Loja de Sandálias",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
