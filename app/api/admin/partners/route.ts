import { NextResponse } from "next/server";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import type { PartnerRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { data, error: queryError } = await supabase
    .from("partners")
    .select("*")
    .order("order_index", { ascending: true });
  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 400 });
  }
  return NextResponse.json({ partners: (data ?? []) as PartnerRow[] });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;

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
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }
  return NextResponse.json({ partner: data as PartnerRow });
}
