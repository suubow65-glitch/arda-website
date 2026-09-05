import { noStoreJson } from "@/lib/apiCache";
import { formatBytes } from "@/lib/mappers";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import { seedDocumentRows } from "@/lib/seedData";
import type { DocumentRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson(
      { error: "Supabase is not configured. Add URL and keys to .env.local." },
      { status: 503 }
    );
  }
  try {
    const { data, error: queryError } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) {
      console.error("documents GET error:", queryError.message);
      return noStoreJson({ documents: [] });
    }
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from("documents")
        .insert(seedDocumentRows())
        .select("*")
        .order("created_at", { ascending: false });
      if (seedError || !seeded) {
        return noStoreJson({ documents: [] });
      }
      return noStoreJson({ documents: seeded as DocumentRow[] });
    }
    return noStoreJson({ documents: data as DocumentRow[] });
  } catch (err) {
    console.error("documents GET exception:", err);
    return noStoreJson({ documents: [] });
  }
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson(
      { error: "Supabase is not configured. Add URL and keys to .env.local." },
      { status: 503 }
    );
  }
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    let fileUrl = String(form.get("file_url") || "");
    let fileSize = String(form.get("file_size") || "");
    if (file && file.size > 0) {
      fileUrl = await uploadPublicFile(supabase, "pdf-documents", file);
      fileSize = formatBytes(file.size);
    }
    if (!fileUrl) {
      return noStoreJson({ error: "A PDF file is required." }, { status: 400 });
    }

    const payload = {
      title: String(form.get("title") || ""),
      category: String(form.get("category") || ""),
      year: String(form.get("year") || ""),
      file_url: fileUrl,
      file_size: fileSize,
    };

    const { data, error: insertError } = await supabase
      .from("documents")
      .insert(payload)
      .select("*")
      .single();
    if (insertError) {
      return noStoreJson({ error: insertError.message }, { status: 400 });
    }
    return noStoreJson({ document: data as DocumentRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}
