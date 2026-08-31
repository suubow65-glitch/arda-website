import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import type { ImpactStatRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { data, error: queryError } = await supabase
    .from("impact_stats")
    .select("*")
    .order("order_index", { ascending: true });
  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 400 });
  }
  return NextResponse.json({ stats: (data ?? []) as ImpactStatRow[] });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const body = (await request.json()) as Partial<ImpactStatRow>;
  const payload = {
    label: body.label,
    value: body.value,
    suffix: body.suffix,
    order_index: body.order_index,
  };
  const { data, error: insertError } = await supabase
    .from("impact_stats")
    .insert(payload)
    .select("*")
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }
  return NextResponse.json({ stat: data as ImpactStatRow });
}
