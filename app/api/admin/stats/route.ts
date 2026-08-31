import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;

  const [activities, documents, unread] = await Promise.all([
    supabase.from("activities").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("read", false),
  ]);

  return NextResponse.json({
    activities: activities.count ?? 0,
    documents: documents.count ?? 0,
    unreadMessages: unread.count ?? 0,
    supabaseReady: true,
  });
}
