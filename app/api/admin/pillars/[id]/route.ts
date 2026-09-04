import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import type { PillarRow } from "@/lib/types";

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
    for (const key of ["title", "category_slug", "icon_name", "short_desc", "full_content"]) {
      const value = form.get(key);
      if (typeof value === "string") updates[key] = value;
    }
    const rawInterventions = form.get("interventions");
    if (typeof rawInterventions === "string") {
      updates.interventions = rawInterventions
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean);
    }
    const orderIndex = form.get("order_index");
    if (orderIndex != null) updates.order_index = Number(orderIndex);
    if (form.get("active") != null) updates.active = String(form.get("active")) === "true";

    const { data, error: updateError } = await supabase
      .from("pillars")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
    return NextResponse.json({ pillar: data as PillarRow });
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
      .from("pillars")
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
