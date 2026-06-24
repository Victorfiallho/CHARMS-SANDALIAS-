import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

  const { data, error } = await supabase
    .from("contacts")
    .update({ status })
    .eq("id", params.id)
    .select("id, status")
    .single();

  if (error) {
    console.error("[PATCH /status] Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    console.error("[PATCH /status] Nenhuma linha atualizada para id:", params.id);
    return NextResponse.json({ error: "contato não encontrado" }, { status: 404 });
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/contatos");
  revalidatePath("/dashboard/relatorios");
  return NextResponse.json({ ok: true, status: data.status });
}
