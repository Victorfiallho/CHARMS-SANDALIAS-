// Paleta rosê fixa — Pipeline e Contatos
export function Initials({ nome, size = 26, circular = false }: { nome: string; size?: number; circular?: boolean }) {
  const words = nome.trim().split(/\s+/);
  const initials = (words[0]?.[0] ?? "") + (words[1]?.[0] ?? "");
  return (
    <div style={{
      width: size, height: size,
      borderRadius: circular ? "50%" : 4,
      background: "#FDF0F1",
      color: "#C38B90", fontWeight: 500, fontSize: size * 0.35,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, letterSpacing: "-0.5px",
    }}>
      {initials.toUpperCase()}
    </div>
  );
}

// Cor dinâmica por nome — Inbox
export function InitialsColored({ nome, size = 32 }: { nome: string; size?: number }) {
  const words = nome.trim().split(/\s+/);
  const initials = (words[0]?.[0] ?? "") + (words[1]?.[0] ?? "");
  const hue = (nome.charCodeAt(0) * 47 + nome.charCodeAt(nome.length - 1) * 23) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: 4, flexShrink: 0,
      background: `hsl(${hue},40%,45%)`,
      color: "white", fontWeight: 700, fontSize: size * 0.3,
      display: "flex", alignItems: "center", justifyContent: "center",
      letterSpacing: "-0.5px",
    }}>
      {initials.toUpperCase()}
    </div>
  );
}
