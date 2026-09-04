import { NextResponse } from "next/server";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import { seedTeamRows } from "@/lib/seedData";
import type { TeamMemberRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ team: [] });
  }
  try {
    const { data, error: queryError } = await supabase
      .from("team_members")
      .select("*")
      .order("order_index", { ascending: true });
    if (queryError) {
      console.error("team_members GET error:", queryError.message);
      return NextResponse.json({ team: [] });
    }
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from("team_members")
        .insert(seedTeamRows())
        .select("*")
        .order("order_index", { ascending: true });
      if (seedError || !seeded) {
        return NextResponse.json({ team: [] });
      }
      return NextResponse.json({ team: seeded as TeamMemberRow[] });
    }
    return NextResponse.json({ team: data as TeamMemberRow[] });
  } catch (err) {
    console.error("team_members GET exception:", err);
    return NextResponse.json({ team: [] });
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
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
    return NextResponse.json({ member: data as TeamMemberRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
