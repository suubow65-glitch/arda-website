import {
  activities as mockActivities,
  boardMembers,
  coreValues,
  documents as mockDocuments,
  focusAreas,
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
  mapAlertBanner,
  mapDocument,
  mapGalleryPhoto,
  mapImpactStat,
  mapPageHeader,
  mapPartner,
  mapPillar,
  mapSiteSettings,
  mapSlide,
  mapTeamMember,
  mapVacancy,
} from "@/lib/mappers";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import type {
  AboutContentRow,
  ActivityRow,
  AlertBannerRow,
  DocumentRow,
  GalleryPhotoRow,
  ImpactStatRow,
  PageHeaderRow,
  PartnerRow,
  PillarRow,
  SiteSettingsRow,
  SlideRow,
  TeamMemberRow,
  VacancyRow,
} from "@/lib/types";

function cacheFirst<T>(key: string, fallback: () => T): T {
  const cached = getLocalItem<T>(key);
  if (cached) return cached;
  return fallback();
}

export async function getPublishedSlides() {
  // Cloud-first for cross-device sync when Supabase is configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("slides")
          .select("*")
          .eq("active", true)
          .order("order_index", { ascending: true });
        if (!error && data && data.length > 0) {
          return (data as SlideRow[]).map(mapSlide);
        }
      }
    } catch {
      // fall through to offline fallback
    }
  }
  const cached = getLocalItem<ReturnType<typeof mapSlide>[]>(storageKeys.slides);
  if (cached) return cached;
  return mockSlides;
}

function sortByDateDesc<T extends { date: string }>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getActivities() {
  // Cloud-first for cross-device sync when Supabase is configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .order("date", { ascending: false });
        if (!error && data && data.length > 0) {
          return sortByDateDesc((data as ActivityRow[]).map(mapActivity));
        }
      }
    } catch {
      // fall through to offline fallback
    }
  }

  const custom = getLocalItem<{ userModified: boolean; activities: ActivityRow[] }>(
    "arda_user_custom_activities_v1"
  );
  if (custom?.userModified && custom.activities?.length) {
    return sortByDateDesc(custom.activities.map(mapActivity));
  }
  const cached = getLocalItem<ReturnType<typeof mapActivity>[]>(storageKeys.activities);
  if (cached) return sortByDateDesc(cached);
  return sortByDateDesc(mockActivities);
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
  const cached = getLocalItem<ReturnType<typeof mapDocument>[]>(storageKeys.documents);
  if (cached) return cached;
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
  const cached = getLocalItem<ReturnType<typeof mapSiteSettings>>(storageKeys.settings);
  if (cached) return cached;
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
  const cached = getLocalItem<{ vision: string; mission: string; coreValues: { title: string; description: string; icon: string }[] }>(storageKeys.about);
  if (cached) return cached;
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
  const cached = getLocalItem<{ value: number; suffix: string; label: string }[]>(storageKeys.impactStats);
  if (cached) return cached;
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
  // Cloud-first for cross-device logo sync
  const fallback = mockPartners.map((p, i) => ({
    id: p.name,
    name: p.name,
    initials: p.initials,
    logoUrl: p.logoUrl || "",
    websiteUrl: p.websiteUrl || "",
    orderIndex: i,
  }));
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("partners")
          .select("*")
          .order("order_index", { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped = (data as PartnerRow[]).map(mapPartner);
          setLocalItem(storageKeys.partners, mapped);
          return mapped;
        }
      }
    } catch {
      // fall through
    }
  }
  const cached = getLocalItem<ReturnType<typeof mapPartner>[]>(storageKeys.partners);
  if (cached) return cached;
  return fallback;
}

export async function getTeamMembers() {
  const cached = getLocalItem<ReturnType<typeof mapTeamMember>[]>(storageKeys.team);
  if (cached) return cached;
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
  const cached = getLocalItem<ReturnType<typeof mapVacancy>[]>(storageKeys.vacancies);
  if (cached) return cached;
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

export async function getAlertBanner() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("alert_banner")
          .select("*")
          .eq("active", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) return mapAlertBanner(data as AlertBannerRow);
      }
    } catch {
      // fall through
    }
  }
  const cached = getLocalItem<ReturnType<typeof mapAlertBanner>>(storageKeys.alertBanner);
  if (cached) return cached;
  return null;
}

export async function getPageHeader(
  pageKey: string,
  sectionKey: string,
  fallback?: { kicker?: string; title?: string; description?: string }
) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("page_headers")
          .select("*")
          .eq("page_key", pageKey)
          .eq("section_key", sectionKey)
          .maybeSingle();
        if (!error && data) {
          const mapped = mapPageHeader(data as PageHeaderRow);
          return {
            kicker: mapped.subtitle || fallback?.kicker || "",
            title: mapped.title,
            description: mapped.description || fallback?.description || "",
          };
        }
      }
    } catch {
      // fall through
    }
  }
  const cached = getLocalItem<ReturnType<typeof mapPageHeader>[]>(storageKeys.pageHeaders);
  const match = cached?.find(
    (h) => h.pageKey === pageKey && h.sectionKey === sectionKey
  );
  if (match) {
    return {
      kicker: match.subtitle || fallback?.kicker || "",
      title: match.title,
      description: match.description || fallback?.description || "",
    };
  }
  return {
    kicker: fallback?.kicker || "",
    title: fallback?.title || "",
    description: fallback?.description || "",
  };
}

export async function getPillars() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("pillars")
          .select("*")
          .eq("active", true)
          .order("order_index", { ascending: true });
        if (!error && data && data.length > 0) {
          return (data as PillarRow[]).map(mapPillar);
        }
      }
    } catch {
      // fall through
    }
  }
  const cached = getLocalItem<ReturnType<typeof mapPillar>[]>(storageKeys.pillars);
  if (cached) return cached;
  return focusAreas.map((area) => ({
    id: area.slug,
    slug: area.slug,
    title: area.title,
    shortTitle: area.shortTitle,
    shortDesc: area.description,
    description: area.description,
    longDescription: area.longDescription,
    interventions: area.interventions,
    icon: String(area.icon),
    orderIndex: 0,
    active: true,
  })) as ReturnType<typeof mapPillar>[];
}

export async function getGalleryPhotos(featuredOnly = false) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        let query = supabase
          .from("gallery_photos")
          .select("*")
          .order("created_at", { ascending: false });
        if (featuredOnly) query = query.eq("featured", true);
        const { data, error } = await query;
        if (!error && data) {
          return (data as GalleryPhotoRow[]).map(mapGalleryPhoto);
        }
      }
    } catch {
      // fall through
    }
  }
  const cached = getLocalItem<ReturnType<typeof mapGalleryPhoto>[]>(
    storageKeys.galleryPhotos
  );
  if (cached) return cached;
  return [];
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
