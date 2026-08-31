import type { Activity, DocumentItem, HeroSlide } from "@/data/mockData";
import type { ActivityRow, DocumentRow, SlideRow } from "@/lib/types";

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
