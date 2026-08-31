import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import type { ContactMessageRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { data, error: queryError } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 400 });
  }
  return NextResponse.json({ messages: (data ?? []) as ContactMessageRow[] });
}
