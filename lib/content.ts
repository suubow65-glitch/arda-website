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
  const custom = getLocalItem<{ userModified: boolean; slides: SlideRow[] }>(
    "arda_user_custom_slides_v1"
  );
  if (custom?.userModified && custom.slides?.length) {
    return custom.slides
      .filter((s) => s.active !== false)
      .map(mapSlide);
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
          const mapped = sortByDateDesc((data as ActivityRow[]).map(mapActivity));
          setLocalItem(storageKeys.activities, mapped);
          return mapped;
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
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .order("year", { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped = (data as DocumentRow[]).map(mapDocument);
          setLocalItem(storageKeys.documents, mapped);
          return mapped;
        }
      }
    } catch {
      // fall through
    }
  }
  const cached = getLocalItem<ReturnType<typeof mapDocument>[]>(storageKeys.documents);
  if (cached) return cached;
  return mockDocuments;
}

export async function getSiteSettings() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) {
          const mapped = mapSiteSettings(data as SiteSettingsRow);
          setLocalItem(storageKeys.settings, mapped);
          return mapped;
        }
      }
    } catch {
      // fall through
    }
  }
  const cached = getLocalItem<ReturnType<typeof mapSiteSettings>>(storageKeys.settings);
  if (cached) return cached;
  return mapSiteSettings({} as SiteSettingsRow);
}

export async function getAboutContent() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("about_content")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) {
          const mapped = mapAboutContent(data as AboutContentRow);
          setLocalItem(storageKeys.about, mapped);
          return mapped;
        }
      }
    } catch {
      // fall through
    }
  }
  const cached = getLocalItem<{ vision: string; mission: string; coreValues: { title: string; description: string; icon: string }[] }>(storageKeys.about);
  if (cached) return cached;
  return { vision: org.vision, mission: org.mission, coreValues };
}

export async function getImpactStats() {
  // Cloud-first for cross-device sync when Supabase is configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("impact_stats")
          .select("*")
          .order("order_index", { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped = (data as ImpactStatRow[]).map(mapImpactStat);
          setLocalItem(storageKeys.impactStats, mapped);
          return mapped;
        }
      }
    } catch {
      // fall through
    }
  }
  const cached = getLocalItem<{ value: number; suffix: string; label: string }[]>(storageKeys.impactStats);
  if (cached) return cached;
  return impactStats;
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

  // 1) Public, unauthenticated cloud API — works identically on every
  // device (desktop, mobile, tablet) since it always hits Supabase Cloud.
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/partners", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { partners?: PartnerRow[] };
        if (data.partners && data.partners.length > 0) {
          const mapped = data.partners.map(mapPartner);
          setLocalItem(storageKeys.partners, mapped);
          return mapped;
        }
      }
    } catch {
      // fall through to direct client / local fallback
    }
  }

  // 2) Direct Supabase client (works for server components too).
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

  // 3) Locally persisted custom partners (admin edits made while offline).
  const custom = getLocalItem<{ userModified: boolean; partners: PartnerRow[] }>(
    "arda_user_custom_partners_v1"
  );
  if (custom?.userModified && custom.partners?.length) {
    return custom.partners.map(mapPartner);
  }

  // 4) Cached copy of the last successful cloud fetch.
  const cached = getLocalItem<ReturnType<typeof mapPartner>[]>(storageKeys.partners);
  if (cached) return cached;

  // 5) Static seed data as a last resort.
  return fallback;
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
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("team_members")
          .select("*")
          .order("order_index", { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped = (data as TeamMemberRow[]).map(mapTeamMember);
          setLocalItem(storageKeys.team, mapped);
          return mapped;
        }
      }
    } catch {
      // fall through
    }
  }
  const cached = getLocalItem<ReturnType<typeof mapTeamMember>[]>(storageKeys.team);
  if (cached) return cached;
  return fallback;
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
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("vacancies")
          .select("*")
          .eq("status", "active")
          .order("order_index", { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped = (data as VacancyRow[]).map(mapVacancy);
          setLocalItem(storageKeys.vacancies, mapped);
          return mapped;
        }
      }
    } catch {
      // fall through
    }
  }
  const cached = getLocalItem<ReturnType<typeof mapVacancy>[]>(storageKeys.vacancies);
  if (cached) return cached;
  return fallback;
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
