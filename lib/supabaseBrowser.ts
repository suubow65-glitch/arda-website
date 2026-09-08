import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getBrowserSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Uploads a file directly from the browser to Supabase Public Storage.
 * Returns the public HTTPS URL.
 */
export async function uploadDirectFile(
  supabase: SupabaseClient,
  bucket: string,
  file: File
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Failed to retrieve public URL from Supabase Storage.");
  }
  return data.publicUrl;
}
