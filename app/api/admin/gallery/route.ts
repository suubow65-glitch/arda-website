import { NextResponse } from "next/server";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import type { GalleryPhotoRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  try {
    const { data, error: queryError } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) {
      console.error("gallery_photos GET error:", queryError.message);
      return NextResponse.json({ photos: [] });
    }
    return NextResponse.json({ photos: (data ?? []) as GalleryPhotoRow[] });
  } catch (err) {
    console.error("gallery_photos GET exception:", err);
    return NextResponse.json({ photos: [] });
  }
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  try {
    const form = await request.formData();
    const file = form.get("image") as File | null;
    let imageUrl = String(form.get("image_url") || "");
    if (file && file.size > 0) {
      imageUrl = await uploadPublicFile(supabase, "gallery-photos", file);
    }
    if (!imageUrl) {
      return NextResponse.json({ error: "A photo image is required." }, { status: 400 });
    }
    const payload = {
      title: String(form.get("title") || ""),
      location: String(form.get("location") || ""),
      category: String(form.get("category") || ""),
      image_url: imageUrl,
      date: String(form.get("date") || ""),
      featured: String(form.get("featured") || "false") === "true",
    };
    const { data, error: insertError } = await supabase
      .from("gallery_photos")
      .insert(payload)
      .select("*")
      .single();
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
    return NextResponse.json({ photo: data as GalleryPhotoRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
