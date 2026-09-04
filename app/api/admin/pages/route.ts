import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import type { PageHeaderRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  try {
    const { data, error: queryError } = await supabase
      .from("page_headers")
      .select("*")
      .order("page_key", { ascending: true })
      .order("section_key", { ascending: true });
    if (queryError) {
      console.error("page_headers GET error:", queryError.message);
      return NextResponse.json({ headers: [] });
    }
    return NextResponse.json({ headers: (data ?? []) as PageHeaderRow[] });
  } catch (err) {
    console.error("page_headers GET exception:", err);
    return NextResponse.json({ headers: [] });
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
    const payload = {
      page_key: String(form.get("page_key") || ""),
      section_key: String(form.get("section_key") || ""),
      title: String(form.get("title") || ""),
      subtitle: String(form.get("subtitle") || ""),
      description: String(form.get("description") || ""),
    };
    const { data, error: insertError } = await supabase
      .from("page_headers")
      .insert(payload)
      .select("*")
      .single();
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
    return NextResponse.json({ header: data as PageHeaderRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
