import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const body = (await request.json()) as { read?: boolean };
  const { data, error: updateError } = await supabase
    .from("contact_messages")
    .update({ read: Boolean(body.read) })
    .eq("id", params.id)
    .select("*")
    .single();
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  return NextResponse.json({ message: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { error: deleteError } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", params.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
