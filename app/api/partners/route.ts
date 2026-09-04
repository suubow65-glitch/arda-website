import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabaseAdmin";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
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
    if (error || !data) {
      console.error("public partners GET error:", error?.message);
      return NextResponse.json({ partners: [] });
    }
    return NextResponse.json({ partners: data as PartnerRow[] });
  } catch (err) {
    console.error("public partners GET exception:", err);
    return NextResponse.json({ partners: [] });
  }
}
