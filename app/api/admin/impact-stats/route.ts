import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { impactStats } from "@/data/mockData";
import { seedImpactStatRows } from "@/lib/seedData";
import type { ImpactStatRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ stats: impactStats });
  }
  try {
    const { data, error: queryError } = await supabase
      .from("impact_stats")
      .select("*")
      .order("order_index", { ascending: true });
    if (queryError) {
      console.error("impact_stats GET error:", queryError.message);
      return NextResponse.json({ stats: impactStats });
    }
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from("impact_stats")
        .insert(seedImpactStatRows())
        .select("*")
        .order("order_index", { ascending: true });
      if (seedError || !seeded) {
        return NextResponse.json({ stats: impactStats });
      }
      return NextResponse.json({ stats: seeded as ImpactStatRow[] });
    }
    return NextResponse.json({ stats: data as ImpactStatRow[] });
  } catch (err) {
    console.error("impact_stats GET exception:", err);
    return NextResponse.json({ stats: impactStats });
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
