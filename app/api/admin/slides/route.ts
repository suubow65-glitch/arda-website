import { noStoreJson } from "@/lib/apiCache";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import { createServiceSupabase } from "@/lib/supabaseAdmin";
import { seedSlideRows } from "@/lib/seedData";
import type { SlideRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = createServiceSupabase();
  if (!supabase) {
    return noStoreJson(
      { error: "Supabase is not configured. Add URL and keys to .env.local." },
      { status: 503 }
    );
  }
  try {
    const { data, error: queryError } = await supabase
      .from("slides")
      .select("*")
      .eq("active", true)
      .order("order_index", { ascending: true });
    if (queryError) {
      console.error("slides GET error:", queryError.message);
      return noStoreJson({ slides: [] });
    }
    if (!data || data.length === 0) {
      // Check if the table is truly empty (not just filtered by active=true)
      const { count } = await supabase
        .from("slides")
        .select("id", { count: "exact", head: true });
      if (!count) {
        const { data: seeded, error: seedError } = await supabase
          .from("slides")
          .insert(seedSlideRows())
          .select("*")
          .order("order_index", { ascending: true });
        if (seedError || !seeded) {
          return noStoreJson({ slides: [] });
        }
        return noStoreJson({ slides: seeded as SlideRow[] });
      }
    }
    return noStoreJson({ slides: (data ?? []) as SlideRow[] });
  } catch (err) {
    console.error("slides GET exception:", err);
    return noStoreJson({ slides: [] });
  }
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson(
      { error: "Supabase is not configured. Add URL and keys to .env.local." },
      { status: 503 }
    );
  }
  try {
    const form = await request.formData();
    const file = form.get("image") as File | null;
    let imageUrl = String(form.get("image_url") || "");
    if (file && file.size > 0) {
      imageUrl = await uploadPublicFile(supabase, "slide-images", file);
    }
    if (!imageUrl) {
      return noStoreJson({ error: "A banner image is required." }, { status: 400 });
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
      return noStoreJson({ error: insertError.message }, { status: 400 });
    }
    return noStoreJson({ slide: data as SlideRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}
