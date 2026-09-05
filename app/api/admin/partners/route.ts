import { NextResponse } from "next/server";
import { noStoreJson } from "@/lib/apiCache";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import { seedPartnerRows } from "@/lib/seedData";
import type { PartnerRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson({ partners: [] });
  }
  try {
    const { data, error: queryError } = await supabase
      .from("partners")
      .select("*")
      .order("order_index", { ascending: true });
    if (queryError) {
      console.error("partners GET error:", queryError.message);
      return noStoreJson({ partners: [] });
    }
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from("partners")
        .insert(seedPartnerRows())
        .select("*")
        .order("order_index", { ascending: true });
      if (seedError || !seeded) {
        return noStoreJson({ partners: [] });
      }
      return noStoreJson({ partners: seeded as PartnerRow[] });
    }
    return noStoreJson({ partners: data as PartnerRow[] });
  } catch (err) {
    console.error("partners GET exception:", err);
    return noStoreJson({ partners: [] });
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
    const form = await request.formData();
    const file = form.get("logo") as File | null;
    let logoUrl = "";
    if (file && file.size > 0) {
      logoUrl = await uploadPublicFile(supabase, "partner-logos", file);
    }

    const payload = {
      name: String(form.get("name") || ""),
      initials: String(form.get("initials") || ""),
      logo_url: logoUrl,
      website_url: String(form.get("website_url") || ""),
      order_index: Number(form.get("order_index") || 0),
    };

    const { data, error: insertError } = await supabase
      .from("partners")
      .insert(payload)
      .select("*")
      .single();
    if (insertError) {
      return noStoreJson({ error: insertError.message }, { status: 400 });
    }
    return noStoreJson({ partner: data as PartnerRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}
