import { NextResponse } from "next/server";
import { noStoreJson } from "@/lib/apiCache";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import type { GalleryPhotoRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson({ error: "Supabase is not configured." }, { status: 503 });
  }
  try {
    const { data, error: queryError } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) {
      console.error("gallery_photos GET error:", queryError.message);
      return noStoreJson({ photos: [] });
    }
    return noStoreJson({ photos: (data ?? []) as GalleryPhotoRow[] });
  } catch (err) {
    console.error("gallery_photos GET exception:", err);
    return noStoreJson({ photos: [] });
  }
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson({ error: "Supabase is not configured." }, { status: 503 });
  }
  try {
    const form = await request.formData();
    const file = form.get("image") as File | null;
    let imageUrl = String(form.get("image_url") || "");
    if (file && file.size > 0) {
      imageUrl = await uploadPublicFile(supabase, "gallery-photos", file);
    }
    if (!imageUrl) {
      return noStoreJson({ error: "A photo image is required." }, { status: 400 });
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
      return noStoreJson({ error: insertError.message }, { status: 400 });
    }
    return noStoreJson({ photo: data as GalleryPhotoRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}
