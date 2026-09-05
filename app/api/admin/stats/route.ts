import { noStoreJson } from "@/lib/apiCache";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson({
      activities: 0,
      documents: 0,
      unreadMessages: 0,
      supabaseReady: false,
    });
  }
  try {
    const [activities, documents, unread] = await Promise.all([
      supabase.from("activities").select("id", { count: "exact", head: true }),
      supabase.from("documents").select("id", { count: "exact", head: true }),
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("read", false),
    ]);
    return noStoreJson({
      activities: activities.count ?? 0,
      documents: documents.count ?? 0,
      unreadMessages: unread.count ?? 0,
      supabaseReady: true,
    });
  } catch (err) {
    console.error("dashboard stats GET exception:", err);
    return noStoreJson({
      activities: 0,
      documents: 0,
      unreadMessages: 0,
      supabaseReady: false,
    });
  }
}
