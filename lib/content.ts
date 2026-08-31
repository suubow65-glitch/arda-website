import {
  activities as mockActivities,
  documents as mockDocuments,
  heroSlides as mockSlides,
} from "@/data/mockData";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { mapActivity, mapDocument, mapSlide } from "@/lib/mappers";
import type { ActivityRow, DocumentRow, SlideRow } from "@/lib/types";

export async function getPublishedSlides() {
  if (!isSupabaseConfigured()) return mockSlides;
  try {
    const supabase = createSupabaseClient();
    if (!supabase) return mockSlides;
    const { data, error } = await supabase
      .from("slides")
      .select("*")
      .eq("active", true)
      .order("order_index", { ascending: true });
    if (error || !data?.length) return mockSlides;
    return (data as SlideRow[]).map(mapSlide);
  } catch {
    return mockSlides;
  }
}

export async function getActivities() {
  if (!isSupabaseConfigured()) return mockActivities;
  try {
    const supabase = createSupabaseClient();
    if (!supabase) return mockActivities;
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("date", { ascending: false });
    if (error || !data?.length) return mockActivities;
    return (data as ActivityRow[]).map(mapActivity);
  } catch {
    return mockActivities;
  }
}

export async function getActivityBySlug(slug: string) {
  const all = await getActivities();
  return all.find((item) => item.slug === slug) ?? null;
}

export async function getLatestActivities(limit = 3) {
  const all = await getActivities();
  return all.slice(0, limit);
}

export async function getDocuments() {
  if (!isSupabaseConfigured()) return mockDocuments;
  try {
    const supabase = createSupabaseClient();
    if (!supabase) return mockDocuments;
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("year", { ascending: false });
    if (error || !data?.length) return mockDocuments;
    return (data as DocumentRow[]).map(mapDocument);
  } catch {
    return mockDocuments;
  }
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!isSupabaseConfigured()) return { ok: true, stored: false };
  try {
    const supabase = createSupabaseClient();
    if (!supabase) return { ok: true, stored: false };
    const { error } = await supabase.from("contact_messages").insert({
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      read: false,
    });
    if (error) return { ok: false, stored: false, error: error.message };
    return { ok: true, stored: true };
  } catch {
    return { ok: false, stored: false };
  }
}
