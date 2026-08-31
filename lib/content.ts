import {
  activities as mockActivities,
  boardMembers,
  coreValues,
  documents as mockDocuments,
  heroSlides as mockSlides,
  impactStats,
  leadership,
  org,
  partners as mockPartners,
} from "@/data/mockData";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  mapAboutContent,
  mapActivity,
  mapDocument,
  mapImpactStat,
  mapPartner,
  mapSiteSettings,
  mapSlide,
  mapTeamMember,
  mapVacancy,
} from "@/lib/mappers";
import type {
  AboutContentRow,
  ActivityRow,
  DocumentRow,
  ImpactStatRow,
  PartnerRow,
  SiteSettingsRow,
  SlideRow,
  TeamMemberRow,
  VacancyRow,
} from "@/lib/types";

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

export async function getSiteSettings() {
  if (!isSupabaseConfigured()) return mapSiteSettings({} as SiteSettingsRow);
  try {
    const supabase = createSupabaseClient();
    if (!supabase) return mapSiteSettings({} as SiteSettingsRow);
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return mapSiteSettings({} as SiteSettingsRow);
    return mapSiteSettings(data as SiteSettingsRow);
  } catch {
    return mapSiteSettings({} as SiteSettingsRow);
  }
}

export async function getAboutContent() {
  if (!isSupabaseConfigured())
    return { vision: org.vision, mission: org.mission, coreValues };
  try {
    const supabase = createSupabaseClient();
    if (!supabase) return { vision: org.vision, mission: org.mission, coreValues };
    const { data, error } = await supabase
      .from("about_content")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data)
      return { vision: org.vision, mission: org.mission, coreValues };
    return mapAboutContent(data as AboutContentRow);
  } catch {
    return { vision: org.vision, mission: org.mission, coreValues };
  }
}

export async function getImpactStats() {
  if (!isSupabaseConfigured()) return impactStats;
  try {
    const supabase = createSupabaseClient();
    if (!supabase) return impactStats;
    const { data, error } = await supabase
      .from("impact_stats")
      .select("*")
      .order("order_index", { ascending: true });
    if (error || !data?.length) return impactStats;
    return (data as ImpactStatRow[]).map(mapImpactStat);
  } catch {
    return impactStats;
  }
}

export async function getPartners() {
  const fallback = mockPartners.map((p) => ({
    id: p.name,
    name: p.name,
    initials: p.initials,
    logoUrl: "",
    websiteUrl: "",
  }));
  if (!isSupabaseConfigured()) return fallback;
  try {
    const supabase = createSupabaseClient();
    if (!supabase) return fallback;
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("order_index", { ascending: true });
    if (error || !data?.length) return fallback;
    return (data as PartnerRow[]).map(mapPartner);
  } catch {
    return fallback;
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

export async function getTeamMembers() {
  const fallback = [
    ...boardMembers.map((m) => ({
      id: m.name,
      name: m.name,
      role: m.role,
      category: "board" as const,
      image: "",
      bio: m.bio || "",
      orderIndex: 0,
    })),
    ...leadership.map((m) => ({
      id: m.name,
      name: m.name,
      role: m.role,
      category: "executive" as const,
      image: "",
      bio: m.bio || "",
      orderIndex: 0,
    })),
  ];
  if (!isSupabaseConfigured()) return fallback;
  try {
    const supabase = createSupabaseClient();
    if (!supabase) return fallback;
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("order_index", { ascending: true });
    if (error || !data?.length) return fallback;
    return (data as TeamMemberRow[]).map(mapTeamMember);
  } catch {
    return fallback;
  }
}

export async function getVacancies() {
  const fallback = [
    {
      id: "1",
      title: "Call for Expressions of Interest — ARDA Framework Partnership 2026",
      type: "tender" as const,
      location: "Baidoa, Somalia",
      deadline: "Open",
      fileUrl: "",
      description:
        "ARDA invites prospective local and international partners to express interest in future collaboration for 2026/2027 programme cycles.",
      status: "active" as const,
      orderIndex: 0,
    },
  ];
  if (!isSupabaseConfigured()) return fallback;
  try {
    const supabase = createSupabaseClient();
    if (!supabase) return fallback;
    const { data, error } = await supabase
      .from("vacancies")
      .select("*")
      .eq("status", "active")
      .order("order_index", { ascending: true });
    if (error || !data?.length) return fallback;
    return (data as VacancyRow[]).map(mapVacancy);
  } catch {
    return fallback;
  }
}
