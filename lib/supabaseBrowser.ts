import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const PRODUCTION_SUPABASE_URL = "https://tqjrajbbixfepsnofyjy.supabase.co";
export const PRODUCTION_SUPABASE_ANON_KEY =
  "sb_publishable_1bMsMh8zvvk09JtH_dC9DQ_udb2uuYJ";

export function isSupabaseConfigured(): boolean {
  return true;
}

export function getBrowserSupabase(): SupabaseClient {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : PRODUCTION_SUPABASE_URL;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("your-anon-key")
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : PRODUCTION_SUPABASE_ANON_KEY;

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Uploads a file directly from the browser to Supabase Public Storage.
 * Auto-creates the bucket if it does not exist yet.
 * Returns the public HTTPS URL.
 */
export async function uploadDirectFile(
  supabase: SupabaseClient,
  bucket: string,
  file: File
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  let { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadError && /bucket.*not.*found/i.test(uploadError.message)) {
    try {
      await supabase.storage.createBucket(bucket, { public: true });
    } catch {
      // ignore
    }
    const retry = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });
    uploadError = retry.error;
  }

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Failed to retrieve public URL from Supabase Storage.");
  }
  return data.publicUrl;
}
