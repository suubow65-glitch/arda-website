import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import type { AboutContentRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ about: null });
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
      return NextResponse.json({ about: null });
    }
    return NextResponse.json({ about: data as AboutContentRow | null });
  } catch (err) {
    console.error("about_content GET exception:", err);
    return NextResponse.json({ about: null });
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
      return NextResponse.json({ error: upsertError.message }, { status: 400 });
    }
    return NextResponse.json({ about: data as AboutContentRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
