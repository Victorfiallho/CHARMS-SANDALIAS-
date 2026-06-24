import { supabase } from "@/lib/supabase";
import CatalogoClient from "./CatalogoClient";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("categoria")
    .order("nome");

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "#DC2626", fontSize: "0.85rem", fontFamily: "ui-monospace, monospace" }}>
        <strong>Erro Supabase:</strong> {error.message}
        <br /><br />
        Provavelmente a tabela <code>products</code> não existe ainda.
        Execute o SQL em <code>packages/db/src/migrations/001-add-products.sql</code> no Supabase SQL Editor.
      </div>
    );
  }

  const all = products ?? [];

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-header-title">Catálogo</h1>
          <p className="page-header-sub">{all.filter((p) => p.disponivel).length} produtos disponíveis</p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button disabled className="corp-btn corp-btn-primary" style={{ opacity: 0.5 }} title="Integração Bling em breve">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            Importar do Bling
          </button>
        </div>
      </header>
      <CatalogoClient products={all} />
    </>
  );
}
