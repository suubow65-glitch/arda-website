import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import type { AlertBannerRow } from "@/lib/types";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  try {
    const form = await request.formData();
    const updates: Record<string, unknown> = {};
    for (const key of ["message", "button_text", "button_url", "bg_color"]) {
      const value = form.get(key);
      if (typeof value === "string") updates[key] = value;
    }
    if (form.get("active") != null) {
      updates.active = String(form.get("active")) === "true";
    }
    const { data, error: updateError } = await supabase
      .from("alert_banner")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
    return NextResponse.json({ banner: data as AlertBannerRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  try {
    const { error: deleteError } = await supabase
      .from("alert_banner")
      .delete()
      .eq("id", params.id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
