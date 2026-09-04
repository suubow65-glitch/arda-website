import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import type { AlertBannerRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }
  try {
    const { data, error: queryError } = await supabase
      .from("alert_banner")
      .select("*")
      .order("updated_at", { ascending: false });
    if (queryError) {
      console.error("alert_banner GET error:", queryError.message);
      return NextResponse.json({ banners: [] });
    }
    return NextResponse.json({ banners: (data ?? []) as AlertBannerRow[] });
  } catch (err) {
    console.error("alert_banner GET exception:", err);
    return NextResponse.json({ banners: [] });
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
      message: String(form.get("message") || ""),
      button_text: String(form.get("button_text") || ""),
      button_url: String(form.get("button_url") || ""),
      active: String(form.get("active") || "false") === "true",
      bg_color: String(form.get("bg_color") || "#C60C30"),
    };
    const { data, error: insertError } = await supabase
      .from("alert_banner")
      .insert(payload)
      .select("*")
      .single();
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
    return NextResponse.json({ banner: data as AlertBannerRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
