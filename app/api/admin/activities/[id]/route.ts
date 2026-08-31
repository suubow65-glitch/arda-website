import { NextResponse } from "next/server";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import { slugify } from "@/lib/mappers";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;

  const form = await request.formData();
  const file = form.get("image") as File | null;
  const updates: Record<string, unknown> = {};
  for (const key of [
    "title",
    "slug",
    "sector",
    "location",
    "date",
    "description",
    "content",
    "status",
    "image_url",
  ]) {
    const value = form.get(key);
    if (typeof value === "string") updates[key] = value;
  }
  if (typeof updates.title === "string" && !updates.slug) {
    updates.slug = slugify(updates.title);
  }
  if (file && file.size > 0) {
    updates.image_url = await uploadPublicFile(supabase, "activity-images", file);
  }

  const { data, error: updateError } = await supabase
    .from("activities")
    .update(updates)
    .eq("id", params.id)
    .select("*")
    .single();
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  return NextResponse.json({ activity: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { error: deleteError } = await supabase
    .from("activities")
    .delete()
    .eq("id", params.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
