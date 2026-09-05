import { NextResponse } from "next/server";
import { noStoreJson } from "@/lib/apiCache";
import { createServiceSupabase } from "@/lib/supabaseAdmin";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { seedPartnerRows } from "@/lib/seedData";
import type { PartnerRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Public, unauthenticated endpoint so ANY device (desktop, mobile, tablet)
// can read the latest partner logos directly from Supabase Cloud.
export async function GET() {
  if (!isSupabaseConfigured()) {
    return noStoreJson({ partners: [] });
  }
  try {
    // Prefer the service-role client (bypasses RLS) when available so this
    // always works even if the public "select" policy is misconfigured.
    const supabase = createServiceSupabase() || createSupabaseClient();
    if (!supabase) {
      return noStoreJson({ partners: [] });
    }
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) {
      console.error("public partners GET error:", error.message);
      return noStoreJson({ partners: [] });
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
        return noStoreJson({ partners: [] });
      }
      return noStoreJson({ partners: seeded as PartnerRow[] });
    }
    return noStoreJson({ partners: data as PartnerRow[] });
  } catch (err) {
    console.error("public partners GET exception:", err);
    return noStoreJson({ partners: [] });
  }
}
