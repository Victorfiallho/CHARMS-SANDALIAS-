"use client";

import { useState } from "react";

type Product = {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  precoAnt?: number;
  disponivel: boolean;
  destaque: boolean;
  cores: string[];
  numeracao: string;
  sku: string;
};

const PRODUCTS: Product[] = [
  { id: "1",  nome: "Havaianas Top",           categoria: "Básicas",   preco: 39.90,  disponivel: true,  destaque: true,  cores: ["#1D4ED8","#DC2626","#111827","#15803D"], numeracao: "33-44", sku: "HV-TOP-001" },
  { id: "2",  nome: "Ipanema Glam",            categoria: "Femininas", preco: 79.90,  precoAnt: 99.90, disponivel: true,  destaque: true,  cores: ["#9D174D","#A16207","#111827"],         numeracao: "34-42", sku: "IP-GL-002"  },
  { id: "3",  nome: "Rider R1 Energy",         categoria: "Masculinas",preco: 89.90,  disponivel: true,  destaque: false, cores: ["#111827","#1D4ED8","#374151"],           numeracao: "38-46", sku: "RD-R1-003"  },
  { id: "4",  nome: "Chinelo Couro Premium",   categoria: "Premium",   preco: 189.90, disponivel: true,  destaque: true,  cores: ["#92400E","#111827"],                    numeracao: "35-43", sku: "CP-LTH-004" },
  { id: "5",  nome: "Havaianas Slim",          categoria: "Femininas", preco: 49.90,  disponivel: true,  destaque: false, cores: ["#9D174D","#15803D","#F59E0B","#1D4ED8","#111827"], numeracao: "33-41", sku: "HV-SL-005"  },
  { id: "6",  nome: "Grendene Zaxy Fresh",     categoria: "Femininas", preco: 59.90,  disponivel: false, destaque: false, cores: ["#F59E0B","#9D174D","#15803D"],          numeracao: "34-40", sku: "GR-ZX-006"  },
  { id: "7",  nome: "Kenner McNbike",          categoria: "Masculinas",preco: 119.90, disponivel: true,  destaque: false, cores: ["#111827","#374151"],                    numeracao: "38-46", sku: "KN-MC-007"  },
  { id: "8",  nome: "Melissa Possession",      categoria: "Premium",   preco: 249.90, precoAnt: 299.90, disponivel: true,  destaque: true,  cores: ["#E5E7EB","#9D174D"],  numeracao: "33-40", sku: "ML-PO-008"  },
  { id: "9",  nome: "Ipanema Praia & Piscina", categoria: "Básicas",   preco: 34.90,  disponivel: true,  destaque: false, cores: ["#1D4ED8","#15803D","#DC2626"],          numeracao: "33-44", sku: "IP-PP-009"  },
  { id: "10", nome: "Cartago Roma IV",         categoria: "Masculinas",preco: 99.90,  disponivel: false, destaque: false, cores: ["#111827","#92400E"],                    numeracao: "38-46", sku: "CT-RM-010"  },
  { id: "11", nome: "Moleca Anabela",          categoria: "Femininas", preco: 139.90, disponivel: true,  destaque: false, cores: ["#9D174D","#F59E0B","#111827"],          numeracao: "34-40", sku: "ML-AB-011"  },
  { id: "12", nome: "Olympikus Caju",          categoria: "Básicas",   preco: 44.90,  disponivel: true,  destaque: false, cores: ["#1D4ED8","#374151","#15803D"],          numeracao: "33-44", sku: "OL-CJ-012"  },
];

const CATEGORIAS = ["Todas", "Básicas", "Femininas", "Masculinas", "Premium"] as const;

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CatalogoPage() {
  const [catFiltro, setCatFiltro] = useState<typeof CATEGORIAS[number]>("Todas");
  const [dispFiltro, setDispFiltro] = useState<"todos" | "disponivel" | "indisponivel">("todos");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = PRODUCTS.filter((p) => {
    const matchCat  = catFiltro === "Todas" || p.categoria === catFiltro;
    const matchDisp = dispFiltro === "todos" || (dispFiltro === "disponivel" && p.disponivel) || (dispFiltro === "indisponivel" && !p.disponivel);
    const matchSrch = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchDisp && matchSrch;
  });

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-header-title">Catálogo</h1>
          <p className="page-header-sub">{PRODUCTS.filter((p) => p.disponivel).length} produtos disponíveis</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {/* View toggle */}
          <div style={{ display: "flex", border: "1px solid #E5E7EB", borderRadius: 4, overflow: "hidden" }}>
            {(["grid", "list"] as const).map((v, i) => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                padding: "0.25rem 0.5rem", border: "none",
                borderRight: i === 0 ? "1px solid #E5E7EB" : "none",
                cursor: "pointer", background: viewMode === v ? "#111827" : "white",
                color: viewMode === v ? "white" : "#6B7280", transition: "all 0.1s",
              }}>
                {v === "grid" ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <rect x="0" y="0" width="5" height="5"/><rect x="7" y="0" width="5" height="5"/>
                    <rect x="0" y="7" width="5" height="5"/><rect x="7" y="7" width="5" height="5"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <rect x="0" y="1" width="12" height="2"/><rect x="0" y="5" width="12" height="2"/><rect x="0" y="9" width="12" height="2"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
          <button disabled className="corp-btn corp-btn-primary" style={{ opacity: 0.5 }} title="Integração Bling em breve">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            Importar do Bling
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", background: "#F9FAFB" }}>
        {/* Toolbar */}
        <div style={{ background: "white", borderBottom: "1px solid #E5E7EB", padding: "0 1.25rem", height: 44, display: "flex", gap: "0.625rem", alignItems: "center", flexShrink: 0 }}>
          {/* Busca */}
          <div style={{ position: "relative", flex: "0 0 200px" }}>
            <svg style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input type="text" placeholder="Nome ou SKU…" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.3rem 0.5rem 0.3rem 1.6rem", border: "1px solid #E5E7EB", borderRadius: 4, fontSize: "0.72rem", fontFamily: "inherit", outline: "none", background: "#F9FAFB", boxSizing: "border-box" }}
            />
          </div>

          {/* Categorias */}
          <div style={{ display: "flex", border: "1px solid #E5E7EB", borderRadius: 4, overflow: "hidden" }}>
            {CATEGORIAS.map((c, i) => (
              <button key={c} onClick={() => setCatFiltro(c)} style={{
                padding: "0.28rem 0.5rem", border: "none",
                borderRight: i < CATEGORIAS.length - 1 ? "1px solid #E5E7EB" : "none",
                cursor: "pointer", fontSize: "0.68rem", fontWeight: 500, fontFamily: "inherit",
                background: catFiltro === c ? "#111827" : "white",
                color: catFiltro === c ? "white" : "#6B7280",
                transition: "all 0.1s", whiteSpace: "nowrap",
              }}>
                {c}
              </button>
            ))}
          </div>

          <select value={dispFiltro} onChange={(e) => setDispFiltro(e.target.value as typeof dispFiltro)} style={{ padding: "0.28rem 0.5rem", border: "1px solid #E5E7EB", borderRadius: 4, fontSize: "0.72rem", fontFamily: "inherit", outline: "none", background: "white", color: "#374151" }}>
            <option value="todos">Todos</option>
            <option value="disponivel">Disponíveis</option>
            <option value="indisponivel">Indisponíveis</option>
          </select>

          <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "#9CA3AF" }}>
            {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ padding: "1.25rem" }}>
          {viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
              {filtered.map((p) => (
                <div key={p.id} style={{
                  background: "white", border: "1px solid #E5E7EB", borderRadius: 4,
                  overflow: "hidden", transition: "border-color 0.1s",
                  opacity: p.disponivel ? 1 : 0.6,
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#D1D5DB"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; }}
                >
                  {/* Imagem placeholder */}
                  <div style={{ height: 110, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1">
                      <path d="M3 17l4-5 3 4 4-7 5 8H3z" strokeLinejoin="round"/>
                    </svg>
                    {p.destaque && (
                      <span style={{ position: "absolute", top: 6, left: 6, background: "#111827", color: "white", fontSize: "0.55rem", fontWeight: 700, padding: "0.1rem 0.35rem", borderRadius: 3, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Destaque
                      </span>
                    )}
                    {!p.disponivel && (
                      <span style={{ position: "absolute", top: 6, right: 6, background: "#DC2626", color: "white", fontSize: "0.55rem", fontWeight: 700, padding: "0.1rem 0.35rem", borderRadius: 3, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Esgotado
                      </span>
                    )}
                  </div>

                  <div style={{ padding: "0.625rem 0.75rem" }}>
                    <div style={{ fontSize: "0.65rem", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{p.categoria}</div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem", lineHeight: 1.3 }}>{p.nome}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: "0.375rem" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>{fmt(p.preco)}</span>
                      {p.precoAnt && <span style={{ fontSize: "0.62rem", color: "#9CA3AF", textDecoration: "line-through" }}>{fmt(p.precoAnt)}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        {p.cores.slice(0, 5).map((c, i) => (
                          <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block", border: "1px solid rgba(0,0,0,0.1)" }} />
                        ))}
                        {p.cores.length > 5 && <span style={{ fontSize: "0.55rem", color: "#9CA3AF" }}>+{p.cores.length - 5}</span>}
                      </div>
                      <span style={{ fontSize: "0.6rem", color: "#9CA3AF" }}>{p.numeracao}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", background: "white", borderRadius: 4, border: "1px solid #E5E7EB" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  {["Produto", "Categoria", "SKU", "Numeração", "Cores", "Preço", "Status"].map((h) => (
                    <th key={h} style={{ padding: "0.5rem 1rem", textAlign: "left", fontSize: "0.62rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F3F4F6", opacity: p.disponivel ? 1 : 0.6 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "white"; }}
                  >
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{p.nome}</div>
                      {p.destaque && <span style={{ fontSize: "0.6rem", color: "#1D4ED8", fontWeight: 600 }}>Destaque</span>}
                    </td>
                    <td style={{ padding: "0.625rem 1rem", color: "#6B7280", fontSize: "0.72rem" }}>{p.categoria}</td>
                    <td style={{ padding: "0.625rem 1rem", color: "#9CA3AF", fontSize: "0.68rem", fontFamily: "ui-monospace, monospace" }}>{p.sku}</td>
                    <td style={{ padding: "0.625rem 1rem", color: "#6B7280", fontSize: "0.72rem" }}>{p.numeracao}</td>
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        {p.cores.map((c, i) => (
                          <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block", border: "1px solid rgba(0,0,0,0.1)" }} />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <div style={{ fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>{fmt(p.preco)}</div>
                      {p.precoAnt && <div style={{ fontSize: "0.62rem", color: "#9CA3AF", textDecoration: "line-through" }}>{fmt(p.precoAnt)}</div>}
                    </td>
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.68rem", fontWeight: 600, color: p.disponivel ? "#15803D" : "#DC2626" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                        {p.disponivel ? "Disponível" : "Esgotado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#9CA3AF", fontSize: "0.78rem" }}>
              Nenhum produto encontrado.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
