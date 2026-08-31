import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import type { ContactMessageRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured. Add URL and keys to .env.local." },
      { status: 503 }
    );
  }
  try {
    const { data, error: queryError } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) {
      console.error("contact_messages GET error:", queryError.message);
      return NextResponse.json({ messages: [] });
    }
    return NextResponse.json({ messages: (data ?? []) as ContactMessageRow[] });
  } catch (err) {
    console.error("contact_messages GET exception:", err);
    return NextResponse.json({ messages: [] });
  }
}
