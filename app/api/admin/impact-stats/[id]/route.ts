import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
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
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  return NextResponse.json({ stat: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { error: deleteError } = await supabase
    .from("impact_stats")
    .delete()
    .eq("id", params.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
