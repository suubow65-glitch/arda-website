import { NextResponse } from "next/server";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;

  const form = await request.formData();
  const file = form.get("image") as File | null;
  const updates: Record<string, unknown> = {};

  const stringFields = ["name", "role", "category", "bio"];
  for (const key of stringFields) {
    const value = form.get(key);
    if (typeof value === "string") updates[key] = value;
  }
  if (form.get("order_index") != null) {
    updates.order_index = Number(form.get("order_index"));
  }
  if (file && file.size > 0) {
    updates.image_url = await uploadPublicFile(supabase, "team-photos", file);
  }

  const { data, error: updateError } = await supabase
    .from("team_members")
    .update(updates)
    .eq("id", params.id)
    .select("*")
    .single();
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  return NextResponse.json({ member: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { error: deleteError } = await supabase
    .from("team_members")
    .delete()
    .eq("id", params.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
