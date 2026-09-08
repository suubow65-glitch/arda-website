import { createBrowserClient } from "@supabase/ssr";
import {
  PRODUCTION_SUPABASE_URL,
  PRODUCTION_SUPABASE_ANON_KEY,
} from "@/lib/supabaseBrowser";

export function createBrowserSupabase() {
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

  return createBrowserClient(url, anonKey);
}
