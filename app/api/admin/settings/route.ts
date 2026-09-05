import { NextResponse } from "next/server";
import { noStoreJson } from "@/lib/apiCache";
import { requireAdmin } from "@/lib/requireAdmin";
import { seedSiteSettingsRow } from "@/lib/seedData";
import type { SiteSettingsRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson({ settings: null });
  }
  try {
    const { data, error: queryError } = await supabase
      .from("site_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (queryError) {
      console.error("site_settings GET error:", queryError.message);
      return noStoreJson({ settings: null });
    }
    if (!data) {
      const { data: seeded, error: seedError } = await supabase
        .from("site_settings")
        .insert(seedSiteSettingsRow())
        .select("*")
        .single();
      if (seedError || !seeded) {
        return noStoreJson({ settings: null });
      }
      return noStoreJson({ settings: seeded as SiteSettingsRow });
    }
    return noStoreJson({ settings: data as SiteSettingsRow });
  } catch (err) {
    console.error("site_settings GET exception:", err);
    return noStoreJson({ settings: null });
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
      return noStoreJson({ error: upsertError.message }, { status: 400 });
    }
    return noStoreJson({ settings: data as SiteSettingsRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}
