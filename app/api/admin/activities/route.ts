import { NextResponse } from "next/server";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import { slugify } from "@/lib/mappers";
import { seedActivityRows } from "@/lib/seedData";
import type { ActivityRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured. Add URL and keys to .env.local." },
      { status: 503 }
    );
  }
  try {
    // Always sort newest-first by creation time so the latest additions
    // appear at the top of the admin table and public activity feeds.
    const { data, error: queryError } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) {
      console.error("activities GET error:", queryError.message);
      return NextResponse.json({ activities: [] });
    }
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from("activities")
        .insert(seedActivityRows())
        .select("*")
        .order("created_at", { ascending: false });
      if (seedError || !seeded) {
        return NextResponse.json({ activities: [] });
      }
      return NextResponse.json({ activities: seeded as ActivityRow[] });
    }
    return NextResponse.json({ activities: data as ActivityRow[] });
  } catch (err) {
    console.error("activities GET exception:", err);
    return NextResponse.json({ activities: [] });
  }
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured. Add URL and keys to .env.local." },
      { status: 503 }
    );
  }
  try {
    const form = await request.formData();
    const file = form.get("image") as File | null;
    let imageUrl = String(form.get("image_url") || "");
    if (file && file.size > 0) {
      imageUrl = await uploadPublicFile(supabase, "activity-images", file);
    }
    if (!imageUrl) {
      return NextResponse.json({ error: "An activity image is required." }, { status: 400 });
    }

    const title = String(form.get("title") || "");
    const payload = {
      title,
      slug: String(form.get("slug") || slugify(title)),
      sector: String(form.get("sector") || ""),
      location: String(form.get("location") || ""),
      date: String(form.get("date") || ""),
      image_url: imageUrl,
      description: String(form.get("description") || ""),
      content: String(form.get("content") || form.get("description") || ""),
      status: String(form.get("status") || "Ongoing"),
    };

    const { data, error: insertError } = await supabase
      .from("activities")
      .insert(payload)
      .select("*")
      .single();
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
    return NextResponse.json({ activity: data as ActivityRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
