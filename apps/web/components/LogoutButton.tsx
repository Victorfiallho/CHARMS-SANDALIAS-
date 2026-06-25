"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabaseBrowser.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        background: "none", border: "1px solid #EDE5E2",
        borderRadius: 4, padding: "0.25rem 0.6rem",
        fontSize: "0.68rem", fontWeight: 500, color: "#7A6868",
        cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
        opacity: loading ? 0.6 : 1, transition: "all 0.1s",
      }}
      onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.borderColor = "#C38B90"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#EDE5E2"; }}
    >
      {loading ? "Saindo…" : "Sair"}
    </button>
  );
}
