import { NextResponse } from "next/server";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import type { TeamMemberRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { data, error: queryError } = await supabase
    .from("team_members")
    .select("*")
    .order("order_index", { ascending: true });
  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 400 });
  }
  return NextResponse.json({ team: (data ?? []) as TeamMemberRow[] });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;

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
}
