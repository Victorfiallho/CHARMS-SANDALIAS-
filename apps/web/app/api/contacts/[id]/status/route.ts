import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const VALID = ["novo", "qualificado", "negociacao", "fechamento", "pos-venda"] as const;
type Status = (typeof VALID)[number];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => ({}));
  const status = body?.status as string;

  if (!VALID.includes(status as Status)) {
    return NextResponse.json({ error: "status inválido" }, { status: 400 });
  }

  const { error } = await supabase
    .from("contacts")
    .update({ status })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
