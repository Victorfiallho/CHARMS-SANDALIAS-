export const STAGES = [
  { key: "novo",        label: "Novo",        color: "#9E8E8A" },
  { key: "qualificado", label: "Qualificado", color: "#7B84B8" },
  { key: "negociacao",  label: "Negociação",  color: "#A16207" },
  { key: "fechamento",  label: "Fechamento",  color: "#15803D" },
  { key: "pos-venda",   label: "Pós-venda",   color: "#5C4A4A" },
] as const;

export const STATUS_COLOR: Record<string, string> = {
  novo:        "#9E8E8A",
  qualificado: "#7B84B8",
  negociacao:  "#A16207",
  fechamento:  "#15803D",
  "pos-venda": "#5C4A4A",
};

export const STATUS_LABEL: Record<string, string> = {
  novo:        "Novo",
  qualificado: "Qualificado",
  negociacao:  "Negociação",
  fechamento:  "Fechamento",
  "pos-venda": "Pós-venda",
};
