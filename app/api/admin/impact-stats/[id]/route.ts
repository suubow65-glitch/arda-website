import { NextResponse } from "next/server";
import { noStoreJson } from "@/lib/apiCache";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson(
      { error: "Supabase is not configured. Add URL and keys to .env.local." },
      { status: 503 }
    );
  }
  try {
    const body = (await request.json()) as Partial<{
      label: string;
      value: number;
      suffix: string;
      order_index: number;
    }>;
    const updates: Record<string, unknown> = {};
    if (body.label !== undefined) updates.label = body.label;
    if (body.value !== undefined) updates.value = body.value;
    if (body.suffix !== undefined) updates.suffix = body.suffix;
    if (body.order_index !== undefined) updates.order_index = body.order_index;

    const { data, error: updateError } = await supabase
      .from("impact_stats")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();
    if (updateError) {
      return noStoreJson({ error: updateError.message }, { status: 400 });
    }
    return noStoreJson({ stat: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson(
      { error: "Supabase is not configured. Add URL and keys to .env.local." },
      { status: 503 }
    );
  }
  try {
    const { error: deleteError } = await supabase
      .from("impact_stats")
      .delete()
      .eq("id", params.id);
    if (deleteError) {
      return noStoreJson({ error: deleteError.message }, { status: 400 });
    }
    return noStoreJson({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}
