import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => ({}));
  const update: Record<string, unknown> = {};

  if (body.nome !== undefined) update.nome = String(body.nome).trim();
  if (body.tags !== undefined) update.tags = body.tags;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nenhum campo para atualizar" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("contacts")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
