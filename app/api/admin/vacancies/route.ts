import { NextResponse } from "next/server";
import { noStoreJson } from "@/lib/apiCache";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";
import { seedVacancyRows } from "@/lib/seedData";
import type { VacancyRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson({ vacancies: [] });
  }
  try {
    const { data, error: queryError } = await supabase
      .from("vacancies")
      .select("*")
      .order("order_index", { ascending: true });
    if (queryError) {
      console.error("vacancies GET error:", queryError.message);
      return noStoreJson({ vacancies: [] });
    }
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from("vacancies")
        .insert(seedVacancyRows())
        .select("*")
        .order("order_index", { ascending: true });
      if (seedError || !seeded) {
        return noStoreJson({ vacancies: [] });
      }
      return noStoreJson({ vacancies: seeded as VacancyRow[] });
    }
    return noStoreJson({ vacancies: data as VacancyRow[] });
  } catch (err) {
    console.error("vacancies GET exception:", err);
    return noStoreJson({ vacancies: [] });
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
      return noStoreJson({ error: insertError.message }, { status: 400 });
    }
    return noStoreJson({ vacancy: data as VacancyRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}
