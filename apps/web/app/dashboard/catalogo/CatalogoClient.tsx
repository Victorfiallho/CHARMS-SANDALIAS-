"use client";

import { useState } from "react";

type Product = {
  id: string;
  nome: string;
  categoria: string;
  cor: string;
  cor_hex: string;
  preco: number;
  preco_pix: number | null;
  numeracao: string;
  disponivel: boolean;
  destaque: boolean;
  sku: string;
  imagem_url: string | null;
};

type Props = { products: Product[] };

const CATEGORIAS = ["Todas", "Lançamentos", "Mais Vendidos", "Sensações", "Inesquecível"] as const;

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CatalogoClient({ products }: Props) {
  const [catFiltro, setCatFiltro] = useState<typeof CATEGORIAS[number]>("Todas");
  const [dispFiltro, setDispFiltro] = useState<"todos" | "disponivel" | "indisponivel">("todos");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = products.filter((p) => {
    const matchCat  = catFiltro === "Todas" || p.categoria === catFiltro;
    const matchDisp = dispFiltro === "todos" || (dispFiltro === "disponivel" && p.disponivel) || (dispFiltro === "indisponivel" && !p.disponivel);
    const matchSrch = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.cor.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchDisp && matchSrch;
  });

  return (
    <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", background: "#FAF9F6" }}>
      {/* Toolbar */}
      <div style={{ background: "white", borderBottom: "1px solid #EDE5E2", padding: "0 1.25rem", height: 44, display: "flex", gap: "0.625rem", alignItems: "center", flexShrink: 0 }}>
        {/* Busca */}
        <div style={{ position: "relative", flex: "0 0 200px" }}>
          <svg style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", color: "#9A7878" }} width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input type="text" placeholder="Nome, SKU ou cor…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "0.3rem 0.5rem 0.3rem 1.6rem", border: "1px solid #EDE5E2", borderRadius: 4, fontSize: "0.72rem", fontFamily: "inherit", outline: "none", background: "#FAF9F6", boxSizing: "border-box" }}
          />
        </div>

        {/* Categorias */}
        <div style={{ display: "flex", border: "1px solid #EDE5E2", borderRadius: 4, overflow: "hidden" }}>
          {CATEGORIAS.map((c, i) => (
            <button key={c} onClick={() => setCatFiltro(c)} style={{
              padding: "0.28rem 0.5rem", border: "none",
              borderRight: i < CATEGORIAS.length - 1 ? "1px solid #EDE5E2" : "none",
              cursor: "pointer", fontSize: "0.68rem", fontWeight: 500, fontFamily: "inherit",
              background: catFiltro === c ? "#1A1010" : "white",
              color: catFiltro === c ? "white" : "#7A6868",
              transition: "all 0.1s", whiteSpace: "nowrap",
            }}>
              {c}
            </button>
          ))}
        </div>

        <select value={dispFiltro} onChange={(e) => setDispFiltro(e.target.value as typeof dispFiltro)}
          style={{ padding: "0.28rem 0.5rem", border: "1px solid #EDE5E2", borderRadius: 4, fontSize: "0.72rem", fontFamily: "inherit", outline: "none", background: "white", color: "#4A3535" }}>
          <option value="todos">Todos</option>
          <option value="disponivel">Disponíveis</option>
          <option value="indisponivel">Indisponíveis</option>
        </select>

        {/* View toggle */}
        <div style={{ marginLeft: "auto", display: "flex", border: "1px solid #EDE5E2", borderRadius: 4, overflow: "hidden" }}>
          {(["grid", "list"] as const).map((v, i) => (
            <button key={v} onClick={() => setViewMode(v)} style={{
              padding: "0.25rem 0.5rem", border: "none",
              borderRight: i === 0 ? "1px solid #EDE5E2" : "none",
              cursor: "pointer", background: viewMode === v ? "#1A1010" : "white",
              color: viewMode === v ? "white" : "#7A6868", transition: "all 0.1s",
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

        <span style={{ fontSize: "0.68rem", color: "#9A7878" }}>
          {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ padding: "1.25rem" }}>
        {viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
            {filtered.map((p) => (
              <div key={p.id} style={{
                background: "white", border: "1px solid #EDE5E2", borderRadius: 4,
                overflow: "hidden", transition: "border-color 0.1s",
                opacity: p.disponivel ? 1 : 0.6,
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#DDD0CC"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#EDE5E2"; }}
              >
                {/* Imagem do produto */}
                <div style={{ height: 160, background: "#F5F2EF", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                  {p.imagem_url ? (
                    <img
                      src={p.imagem_url}
                      alt={p.nome}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DDD0CC" strokeWidth="1">
                      <path d="M3 17l4-5 3 4 4-7 5 8H3z" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {p.destaque && (
                    <span style={{ position: "absolute", top: 6, left: 6, background: "#1A1010", color: "white", fontSize: "0.58rem", fontWeight: 700, padding: "0.1rem 0.35rem", borderRadius: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Destaque
                    </span>
                  )}
                  {!p.disponivel && (
                    <span style={{ position: "absolute", top: 6, right: 6, background: "#7F1D1D", color: "white", fontSize: "0.58rem", fontWeight: 700, padding: "0.1rem 0.35rem", borderRadius: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Esgotado
                    </span>
                  )}
                </div>

                <div style={{ padding: "0.625rem 0.75rem" }}>
                  <div style={{ fontSize: "0.65rem", color: "#9A7878", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{p.categoria}</div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1A1010", marginBottom: "0.25rem", lineHeight: 1.3 }}>{p.nome}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: "0.375rem" }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#1A1010", letterSpacing: "-0.03em" }}>{fmt(p.preco)}</span>
                    {p.preco_pix && (
                      <span style={{ fontSize: "0.62rem", color: "#7A6868" }}>
                        {fmt(p.preco_pix)} Pix
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: p.cor_hex, display: "inline-block", border: "1px solid rgba(0,0,0,0.12)", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.62rem", color: "#7A6868" }}>{p.cor}</span>
                    </div>
                    <span style={{ fontSize: "0.6rem", color: "#9A7878" }}>{p.numeracao}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", background: "white", borderRadius: 4, border: "1px solid #EDE5E2" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #EDE5E2" }}>
                {["Produto", "Categoria", "SKU", "Numeração", "Cor", "Preço", "Pix", "Status"].map((h) => (
                  <th key={h} style={{ padding: "0.5rem 1rem", textAlign: "left", fontSize: "0.62rem", fontWeight: 600, color: "#9A7878", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #F5F2EF", opacity: p.disponivel ? 1 : 0.6 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FAF9F6"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "white"; }}
                >
                  <td style={{ padding: "0.5rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 3, overflow: "hidden", background: "#F5F2EF", border: "1px solid #EDE5E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {p.imagem_url ? (
                          <img src={p.imagem_url} alt={p.nome} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DDD0CC" strokeWidth="1.5">
                            <path d="M3 17l4-5 3 4 4-7 5 8H3z" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#1A1010" }}>{p.nome}</div>
                        {p.destaque && <span style={{ fontSize: "0.6rem", color: "#C38B90", fontWeight: 600 }}>Destaque</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.625rem 1rem", color: "#7A6868", fontSize: "0.72rem" }}>{p.categoria}</td>
                  <td style={{ padding: "0.625rem 1rem", color: "#9A7878", fontSize: "0.68rem", fontFamily: "ui-monospace, monospace" }}>{p.sku}</td>
                  <td style={{ padding: "0.625rem 1rem", color: "#7A6868", fontSize: "0.72rem" }}>{p.numeracao}</td>
                  <td style={{ padding: "0.625rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: p.cor_hex, display: "inline-block", border: "1px solid rgba(0,0,0,0.12)" }} />
                      <span style={{ fontSize: "0.72rem", color: "#4A3535" }}>{p.cor}</span>
                    </div>
                  </td>
                  <td style={{ padding: "0.625rem 1rem" }}>
                    <div style={{ fontWeight: 800, color: "#1A1010", letterSpacing: "-0.02em" }}>{fmt(p.preco)}</div>
                  </td>
                  <td style={{ padding: "0.625rem 1rem", color: "#7A6868", fontSize: "0.72rem" }}>
                    {p.preco_pix ? fmt(p.preco_pix) : "—"}
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
          <div style={{ textAlign: "center", padding: "3rem", color: "#9A7878", fontSize: "0.78rem" }}>
            {products.length === 0 ? "Nenhum produto no catálogo. Execute npm run seed para popular." : "Nenhum produto encontrado."}
          </div>
        )}
      </div>
    </div>
  );
}
