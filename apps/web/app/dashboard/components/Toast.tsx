"use client";

import { useEffect } from "react";

type Props = {
  message: string;
  type?: "success" | "error" | "info";
  onDone: () => void;
};

const CONFIG = {
  success: { bg: "#0f172a", icon: "✓", iconBg: "rgba(74,222,128,0.18)", iconColor: "#4ade80" },
  error:   { bg: "#dc2626", icon: "✕", iconBg: "rgba(255,255,255,0.15)", iconColor: "white"  },
  info:    { bg: "#1e40af", icon: "i", iconBg: "rgba(255,255,255,0.15)", iconColor: "white"  },
};

export default function Toast({ message, type = "success", onDone }: Props) {
  const c = CONFIG[type];

  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 24,
        zIndex: 9999,
        background: c.bg,
        color: "white",
        borderRadius: 12,
        padding: "0.7rem 1rem 0.7rem 0.7rem",
        fontSize: "0.855rem",
        fontWeight: 500,
        fontFamily: "inherit",
        boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        animation: "toastIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        minWidth: 220,
        maxWidth: 320,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: c.iconBg,
          color: c.iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.7rem",
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {c.icon}
      </span>
      {message}
    </div>
  );
}
