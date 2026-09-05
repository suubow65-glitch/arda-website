import { NextResponse } from "next/server";
import { noStoreJson } from "@/lib/apiCache";
import { requireAdmin } from "@/lib/requireAdmin";
import { impactStats } from "@/data/mockData";
import { seedImpactStatRows } from "@/lib/seedData";
import type { ImpactStatRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson({ stats: impactStats });
  }
  try {
    const { data, error: queryError } = await supabase
      .from("impact_stats")
      .select("*")
      .order("order_index", { ascending: true });
    if (queryError) {
      console.error("impact_stats GET error:", queryError.message);
      return noStoreJson({ stats: impactStats });
    }
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from("impact_stats")
        .insert(seedImpactStatRows())
        .select("*")
        .order("order_index", { ascending: true });
      if (seedError || !seeded) {
        return noStoreJson({ stats: impactStats });
      }
      return noStoreJson({ stats: seeded as ImpactStatRow[] });
    }
    return noStoreJson({ stats: data as ImpactStatRow[] });
  } catch (err) {
    console.error("impact_stats GET exception:", err);
    return noStoreJson({ stats: impactStats });
  }
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson(
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
      return noStoreJson({ error: insertError.message }, { status: 400 });
    }
    return noStoreJson({ stat: data as ImpactStatRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}
