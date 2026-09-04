import type { Activity, DocumentItem, HeroSlide, RegionHub } from "@/data/mockData";
import { coreValues, org } from "@/data/mockData";
import type {
  AboutContentRow,
  ActivityRow,
  AlertBannerRow,
  CoreValue,
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

export function mapSlide(row: SlideRow): HeroSlide {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    image: row.image_url,
    primaryCta: {
      label: row.button_text || "Partner With Us",
      href: row.button_link || "/contact",
    },
    secondaryCta: { label: "Learn more", href: "/about" },
  };
}

export function mapActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.description,
    description: row.content || row.description,
    location: row.location,
    region: row.location,
    date: row.date,
    status: row.status === "Completed" ? "Completed" : "Ongoing",
    sector: row.sector,
    beneficiaries: "",
    image: row.image_url,
  };
}

export function mapDocument(row: DocumentRow): DocumentItem {
  return {
    id: row.id,
    title: row.title,
    type: row.category as DocumentItem["type"],
    year: row.year,
    size: row.file_size || "",
    href: row.file_url,
    description: "",
  };
}

export function mapSiteSettings(row: SiteSettingsRow) {
  return {
    name: row.org_name || org.name,
    shortName: row.short_name || org.shortName,
    domain: "arda.org.so",
    website: row.website || org.website,
    email: row.email || org.email,
    phone: row.phone || org.phone,
    location: row.location || org.location,
    address: row.address || org.address,
    established: row.established || org.established,
    registrations: row.registrations || org.registrations,
    executiveDirector: row.executive_director || org.executiveDirector,
    tagline: row.tagline || org.tagline,
    phoneIct: row.phone_ict || "",
    emailIct: row.email_ict || "",
    subOfficeAddresses: row.sub_office_addresses || "",
    social: {
      facebook: row.social_facebook || "",
      x: row.social_x || "",
      linkedin: row.social_linkedin || "",
      instagram: row.social_instagram || "",
    },
  };
}

export function mapAboutContent(row: AboutContentRow) {
  return {
    vision: row.vision || org.vision,
    mission: row.mission || org.mission,
    coreValues:
      Array.isArray(row.core_values) && row.core_values.length
        ? (row.core_values as CoreValue[])
        : coreValues,
  };
}

export function mapImpactStat(row: ImpactStatRow) {
  return {
    id: row.id,
    value: row.value,
    suffix: row.suffix,
    label: row.label,
    orderIndex: row.order_index,
  };
}

export function mapPartner(row: PartnerRow) {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
  };
}

export function mapTeamMember(row: TeamMemberRow) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    category: row.category,
    image: row.image_url || "",
    bio: row.bio || "",
    orderIndex: row.order_index,
  };
}

export function mapVacancy(row: VacancyRow) {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    location: row.location || "",
    deadline: row.deadline || "",
    fileUrl: row.file_url || "",
    description: row.description || "",
    status: row.status,
    orderIndex: row.order_index,
  };
}

export function mapRegion(row: { name: string; hubs: string; focus: string }): RegionHub {
  return row;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatBytes(bytes: number) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function mapAlertBanner(row: AlertBannerRow) {
  return {
    id: row.id,
    message: row.message,
    buttonText: row.button_text || "",
    buttonUrl: row.button_url || "",
    active: row.active,
    bgColor: row.bg_color,
  };
}

export function mapPageHeader(row: PageHeaderRow) {
  return {
    id: row.id,
    pageKey: row.page_key,
    sectionKey: row.section_key,
    title: row.title,
    subtitle: row.subtitle || "",
    description: row.description || "",
  };
}

export function mapPillar(row: PillarRow) {
  return {
    id: row.id,
    slug: row.category_slug,
    title: row.title,
    shortTitle: row.title,
    shortDesc: row.short_desc,
    description: row.short_desc,
    longDescription: row.full_content,
    interventions: row.interventions || [],
    icon: row.icon_name,
    orderIndex: row.order_index,
    active: row.active,
  };
}

export type Pillar = ReturnType<typeof mapPillar>;

export function mapGalleryPhoto(row: GalleryPhotoRow) {
  return {
    id: row.id,
    title: row.title,
    location: row.location || "",
    category: row.category || "",
    image: row.image_url,
    date: row.date || "",
    featured: row.featured,
  };
}
