import { NextResponse } from "next/server";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import type { VacancyRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;
  const { data, error: queryError } = await supabase
    .from("vacancies")
    .select("*")
    .order("order_index", { ascending: true });
  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 400 });
  }
  return NextResponse.json({ vacancies: (data ?? []) as VacancyRow[] });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return error!;

  const form = await request.formData();
  const file = form.get("file") as File | null;
  let fileUrl = "";
  if (file && file.size > 0) {
    fileUrl = await uploadPublicFile(supabase, "vacancy-files", file);
  }

  const payload = {
    title: String(form.get("title") || ""),
    type: String(form.get("type") || "job"),
    location: String(form.get("location") || ""),
    deadline: String(form.get("deadline") || ""),
    file_url: fileUrl,
    description: String(form.get("description") || ""),
    status: String(form.get("status") || "active"),
    order_index: Number(form.get("order_index") || 0),
  };

  const { data, error: insertError } = await supabase
    .from("vacancies")
    .insert(payload)
    .select("*")
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }
  return NextResponse.json({ vacancy: data as VacancyRow });
}
