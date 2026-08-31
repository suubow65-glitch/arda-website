import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/constants";
import { verifySessionToken } from "@/lib/adminAuth";
import { createServiceSupabase } from "@/lib/supabaseAdmin";

export async function requireAdmin() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      supabase: null,
    };
  }
  const supabase = createServiceSupabase();
  if (!supabase) {
    return {
      error: NextResponse.json(
        { error: "Supabase is not configured. Add URL and keys to .env.local." },
        { status: 503 }
      ),
      supabase: null,
    };
  }
  return { error: null, supabase };
}

export async function uploadPublicFile(
  supabase: NonNullable<ReturnType<typeof createServiceSupabase>>,
  bucket: string,
  file: File
) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
