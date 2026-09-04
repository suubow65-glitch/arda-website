import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import type { PageHeaderRow } from "@/lib/types";

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
    for (const key of ["page_key", "section_key", "title", "subtitle", "description"]) {
      const value = form.get(key);
      if (value != null) updates[key] = String(value);
    }
    const { data, error: updateError } = await supabase
      .from("page_headers")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
    return NextResponse.json({ header: data as PageHeaderRow });
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
      .from("page_headers")
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
