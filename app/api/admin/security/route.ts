import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import type { AdminCredentialRow } from "@/lib/types";

const CREDENTIALS_ID = "00000000-0000-0000-0000-000000000001";

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
      .from("admin_credentials")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (queryError) {
      console.error("admin_credentials GET error:", queryError.message);
      return NextResponse.json({ credentials: null });
    }
    return NextResponse.json({ credentials: data as AdminCredentialRow | null });
  } catch (err) {
    console.error("admin_credentials GET exception:", err);
    return NextResponse.json({ credentials: null });
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
    const body = (await request.json()) as { email?: string; passcode?: string };
    const email = body.email?.trim();
    const passcode = body.passcode?.trim();
    if (!email || !passcode) {
      return NextResponse.json(
        { error: "Email and passcode are required." },
        { status: 400 }
      );
    }
    const { data, error: upsertError } = await supabase
      .from("admin_credentials")
      .upsert({
        id: CREDENTIALS_ID,
        email,
        passcode,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 400 });
    }
    return NextResponse.json({ credentials: data as AdminCredentialRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
