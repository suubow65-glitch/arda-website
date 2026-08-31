import { NextResponse } from "next/server";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import type { SlideRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { data, error: queryError } = await supabase
    .from("slides")
    .select("*")
    .order("order_index", { ascending: true });
  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 400 });
  }
  return NextResponse.json({ slides: (data ?? []) as SlideRow[] });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;

  const form = await request.formData();
  const file = form.get("image") as File | null;
  let imageUrl = String(form.get("image_url") || "");
  if (file && file.size > 0) {
    imageUrl = await uploadPublicFile(supabase, "slide-images", file);
  }
  if (!imageUrl) {
    return NextResponse.json({ error: "A banner image is required." }, { status: 400 });
  }

  const payload = {
    title: String(form.get("title") || ""),
    category: String(form.get("category") || ""),
    description: String(form.get("description") || ""),
    image_url: imageUrl,
    button_text: String(form.get("button_text") || "Partner With Us"),
    button_link: String(form.get("button_link") || "/contact"),
    order_index: Number(form.get("order_index") || 0),
    active: String(form.get("active") || "true") === "true",
  };

  const { data, error: insertError } = await supabase
    .from("slides")
    .insert(payload)
    .select("*")
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }
  return NextResponse.json({ slide: data as SlideRow });
}
