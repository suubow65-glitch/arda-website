import { NextResponse } from "next/server";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import type { VacancyRow } from "@/lib/types";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ vacancies: [] });
  }
  try {
    const { data, error: queryError } = await supabase
      .from("vacancies")
      .select("*")
      .order("order_index", { ascending: true });
    if (queryError) {
      console.error("vacancies GET error:", queryError.message);
      return NextResponse.json({ vacancies: [] });
    }
    return NextResponse.json({ vacancies: (data ?? []) as VacancyRow[] });
  } catch (err) {
    console.error("vacancies GET exception:", err);
    return NextResponse.json({ vacancies: [] });
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
