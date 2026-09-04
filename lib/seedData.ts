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

/**
 * Default rows used to auto-seed empty Supabase tables so the Admin CMS and
 * public site are never blank on a freshly created database.
 */

export function seedSlideRows() {
  return mockSlides.map((s, i) => ({
    title: s.title,
    category: s.category,
    description: s.description,
    image_url: s.image,
    button_text: s.primaryCta.label,
    button_link: s.primaryCta.href,
    order_index: i,
    active: true,
  }));
}

export function seedActivityRows() {
  return mockActivities.map((a) => ({
    title: a.title,
    slug: a.slug,
    sector: a.sector,
    location: a.location,
    date: a.date,
    image_url: a.image,
    description: a.summary,
    content: a.description,
    status: a.status,
  }));
}

export function seedPartnerRows() {
  return mockPartners.map((p, i) => ({
    name: p.name,
    initials: p.initials,
    logo_url: p.logoUrl || "",
    website_url: p.websiteUrl || "",
    order_index: i,
  }));
}

export function seedTeamRows() {
  return [
    ...boardMembers.map((m, i) => ({
      name: m.name,
      role: m.role,
      category: "board" as const,
      image_url: "",
      bio: m.bio || "",
      order_index: i,
    })),
    ...leadership.map((m, i) => ({
      name: m.name,
      role: m.role,
      category: "executive" as const,
      image_url: "",
      bio: m.bio || "",
      order_index: i,
    })),
  ];
}

export function seedDocumentRows() {
  return mockDocuments.map((d) => ({
    title: d.title,
    category: d.type,
    year: d.year,
    file_url: d.href,
    file_size: d.size || "",
  }));
}

export function seedVacancyRows() {
  return [
    {
      title: "Call for Expressions of Interest — ARDA Framework Partnership 2026",
      type: "tender" as const,
      location: "Baidoa, Somalia",
      deadline: "Open",
      file_url: "",
      description:
        "ARDA invites prospective local and international partners to express interest in future collaboration for 2026/2027 programme cycles.",
      status: "active" as const,
      order_index: 0,
    },
  ];
}

export function seedImpactStatRows() {
  return impactStats.map((s, i) => ({
    label: s.label,
    value: s.value,
    suffix: s.suffix,
    order_index: i,
  }));
}

export function seedSiteSettingsRow() {
  return {
    org_name: org.name,
    short_name: org.shortName,
    tagline: org.tagline,
    phone: org.phone,
    email: org.email,
    address: org.address,
    location: org.location,
    website: org.website,
    established: org.established,
    registrations: org.registrations,
    executive_director: org.executiveDirector,
  };
}

export function seedAboutContentRow() {
  return {
    vision: org.vision,
    mission: org.mission,
    core_values: coreValues,
  };
}
