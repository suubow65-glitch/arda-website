import { NextResponse } from "next/server";
import { noStoreJson } from "@/lib/apiCache";
import { requireAdmin } from "@/lib/requireAdmin";
import type { PillarRow } from "@/lib/types";

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
      .from("pillars")
      .select("*")
      .order("order_index", { ascending: true });
    if (queryError) {
      console.error("pillars GET error:", queryError.message);
      return noStoreJson({ pillars: [] });
    }
    return noStoreJson({ pillars: (data ?? []) as PillarRow[] });
  } catch (err) {
    console.error("pillars GET exception:", err);
    return noStoreJson({ pillars: [] });
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
    const rawInterventions = String(form.get("interventions") || "");
    const interventions = rawInterventions
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);
    const payload = {
      title: String(form.get("title") || ""),
      category_slug: String(form.get("category_slug") || ""),
      icon_name: String(form.get("icon_name") || ""),
      short_desc: String(form.get("short_desc") || ""),
      full_content: String(form.get("full_content") || ""),
      interventions,
      order_index: Number(form.get("order_index") || 0),
      active: String(form.get("active") || "true") === "true",
    };
    const { data, error: insertError } = await supabase
      .from("pillars")
      .insert(payload)
      .select("*")
      .single();
    if (insertError) {
      return noStoreJson({ error: insertError.message }, { status: 400 });
    }
    return noStoreJson({ pillar: data as PillarRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}
