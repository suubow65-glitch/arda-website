import { NextResponse } from "next/server";
import { noStoreJson } from "@/lib/apiCache";
import { requireAdmin } from "@/lib/requireAdmin";
import { seedAboutContentRow } from "@/lib/seedData";
import type { AboutContentRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson({ about: null });
  }
  try {
    const { data, error: queryError } = await supabase
      .from("about_content")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (queryError) {
      console.error("about_content GET error:", queryError.message);
      return noStoreJson({ about: null });
    }
    if (!data) {
      const { data: seeded, error: seedError } = await supabase
        .from("about_content")
        .insert(seedAboutContentRow())
        .select("*")
        .single();
      if (seedError || !seeded) {
        return noStoreJson({ about: null });
      }
      return noStoreJson({ about: seeded as AboutContentRow });
    }
    return noStoreJson({ about: data as AboutContentRow });
  } catch (err) {
    console.error("about_content GET exception:", err);
    return noStoreJson({ about: null });
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
    const body = (await request.json()) as Partial<AboutContentRow>;
    const payload = {
      vision: body.vision,
      mission: body.mission,
      core_values: body.core_values,
      updated_at: new Date().toISOString(),
    };
    const { data, error: upsertError } = await supabase
      .from("about_content")
      .upsert(payload)
      .select("*")
      .single();
    if (upsertError) {
      return noStoreJson({ error: upsertError.message }, { status: 400 });
    }
    return noStoreJson({ about: data as AboutContentRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}
