import { NextResponse } from "next/server";
import { formatBytes } from "@/lib/mappers";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import type { DocumentRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { data, error: queryError } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });
  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 400 });
  }
  return NextResponse.json({ documents: (data ?? []) as DocumentRow[] });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;

  const form = await request.formData();
  const file = form.get("file") as File | null;
  let fileUrl = String(form.get("file_url") || "");
  let fileSize = String(form.get("file_size") || "");
  if (file && file.size > 0) {
    fileUrl = await uploadPublicFile(supabase, "pdf-documents", file);
    fileSize = formatBytes(file.size);
  }
  if (!fileUrl) {
    return NextResponse.json({ error: "A PDF file is required." }, { status: 400 });
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
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }
  return NextResponse.json({ document: data as DocumentRow });
}
