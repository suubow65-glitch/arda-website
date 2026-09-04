import { NextResponse } from "next/server";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import type { GalleryPhotoRow } from "@/lib/types";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  try {
    const form = await request.formData();
    const updates: Record<string, unknown> = {};
    for (const key of ["title", "location", "category", "date"]) {
      const value = form.get(key);
      if (typeof value === "string") updates[key] = value;
    }
    if (form.get("featured") != null) updates.featured = String(form.get("featured")) === "true";

    const file = form.get("image") as File | null;
    const imageUrl = String(form.get("image_url") || "");
    if (file && file.size > 0) {
      updates.image_url = await uploadPublicFile(supabase, "gallery-photos", file);
    } else if (imageUrl) {
      updates.image_url = imageUrl;
    }

    const { data, error: updateError } = await supabase
      .from("gallery_photos")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
    return NextResponse.json({ photo: data as GalleryPhotoRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  try {
    const { error: deleteError } = await supabase
      .from("gallery_photos")
      .delete()
      .eq("id", params.id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
