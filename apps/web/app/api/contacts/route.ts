import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { nome, telefone, instagram_id, origem, status = "novo", tags = [] } = body;

  if (!nome?.trim()) {
    return NextResponse.json({ error: "nome é obrigatório" }, { status: 400 });
  }
  if (!["whatsapp", "instagram"].includes(origem)) {
    return NextResponse.json({ error: "origem inválida" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert([{
      nome: nome.trim(),
      telefone: telefone?.trim() || null,
      instagram_id: instagram_id?.trim() || null,
      origem,
      status,
      tags,
      last_seen_at: new Date().toISOString(),
    }])
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
