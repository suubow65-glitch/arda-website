import { NextResponse } from "next/server";
import { noStoreJson } from "@/lib/apiCache";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import { seedTeamRows } from "@/lib/seedData";
import type { TeamMemberRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson({ team: [] });
  }
  try {
    const { data, error: queryError } = await supabase
      .from("team_members")
      .select("*")
      .order("order_index", { ascending: true });
    if (queryError) {
      console.error("team_members GET error:", queryError.message);
      return noStoreJson({ team: [] });
    }
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from("team_members")
        .insert(seedTeamRows())
        .select("*")
        .order("order_index", { ascending: true });
      if (seedError || !seeded) {
        return noStoreJson({ team: [] });
      }
      return noStoreJson({ team: seeded as TeamMemberRow[] });
    }
    return noStoreJson({ team: data as TeamMemberRow[] });
  } catch (err) {
    console.error("team_members GET exception:", err);
    return noStoreJson({ team: [] });
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
    const file = form.get("image") as File | null;
    let imageUrl = "";
    if (file && file.size > 0) {
      imageUrl = await uploadPublicFile(supabase, "team-photos", file);
    }

    const payload = {
      name: String(form.get("name") || ""),
      role: String(form.get("role") || ""),
      category: String(form.get("category") || "executive"),
      image_url: imageUrl,
      bio: String(form.get("bio") || ""),
      order_index: Number(form.get("order_index") || 0),
    };

    const { data, error: insertError } = await supabase
      .from("team_members")
      .insert(payload)
      .select("*")
      .single();
    if (insertError) {
      return noStoreJson({ error: insertError.message }, { status: 400 });
    }
    return noStoreJson({ member: data as TeamMemberRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}
