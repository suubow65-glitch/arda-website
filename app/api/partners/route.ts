import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabaseAdmin";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { seedPartnerRows } from "@/lib/seedData";
import type { PartnerRow } from "@/lib/types";

// Public, unauthenticated endpoint so ANY device (desktop, mobile, tablet)
// can read the latest partner logos directly from Supabase Cloud.
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ partners: [] });
  }
  try {
    // Prefer the service-role client (bypasses RLS) when available so this
    // always works even if the public "select" policy is misconfigured.
    const supabase = createServiceSupabase() || createSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ partners: [] });
    }
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) {
      console.error("public partners GET error:", error.message);
      return NextResponse.json({ partners: [] });
    }
    if (!data || data.length === 0) {
      // Auto-seed the cloud database with official ARDA partners so the
      // table (and public site) is never empty.
      const { data: seeded, error: seedError } = await supabase
        .from("partners")
        .insert(seedPartnerRows())
        .select("*")
        .order("order_index", { ascending: true });
      if (seedError || !seeded) {
        console.error("public partners seed error:", seedError?.message);
        return NextResponse.json({ partners: [] });
      }
      return NextResponse.json({ partners: seeded as PartnerRow[] });
    }
    return NextResponse.json({ partners: data as PartnerRow[] });
  } catch (err) {
    console.error("public partners GET exception:", err);
    return NextResponse.json({ partners: [] });
  }
}
