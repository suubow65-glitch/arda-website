import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import type { AboutContentRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { data, error: queryError } = await supabase
    .from("about_content")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 400 });
  }
  return NextResponse.json({ about: data as AboutContentRow | null });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
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
}
