import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import type { SiteSettingsRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { data, error: queryError } = await supabase
    .from("site_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 400 });
  }
  return NextResponse.json({ settings: data as SiteSettingsRow | null });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const body = (await request.json()) as Partial<SiteSettingsRow>;
  const payload = {
    org_name: body.org_name,
    short_name: body.short_name,
    tagline: body.tagline,
    phone: body.phone,
    phone_ict: body.phone_ict,
    email: body.email,
    email_ict: body.email_ict,
    address: body.address,
    sub_office_addresses: body.sub_office_addresses,
    location: body.location,
    website: body.website,
    established: body.established,
    registrations: body.registrations,
    executive_director: body.executive_director,
    social_facebook: body.social_facebook,
    social_x: body.social_x,
    social_linkedin: body.social_linkedin,
    social_instagram: body.social_instagram,
    updated_at: new Date().toISOString(),
  };
  const { data, error: upsertError } = await supabase
    .from("site_settings")
    .upsert(payload)
    .select("*")
    .single();
  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 400 });
  }
  return NextResponse.json({ settings: data as SiteSettingsRow });
}
