import Link from "next/link";
import {
  Apple,
  Droplets,
  GraduationCap,
  Handshake,
  Shield,
  Sprout,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { FocusArea } from "@/data/mockData";
import { focusAreas } from "@/data/mockData";

const icons: Record<FocusArea["icon"], LucideIcon> = {
  peace: Handshake,
  youth: Users,
  food: Sprout,
  education: GraduationCap,
  health: Stethoscope,
  nutrition: Apple,
  wash: Droplets,
  protection: Shield,
};

export default function FocusAreasGrid({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {focusAreas.map((area) => {
        const Icon = icons[area.icon];
        return (
          <article
            key={area.slug}
            className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-relief-50 text-relief">
              <Icon className="h-6 w-6" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-relief">
              {area.shortTitle}
            </p>
            <h3 className="mt-1 font-display text-2xl text-navy">{area.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-navy/70">
              {compact ? area.description : area.longDescription}
            </p>
            {compact && (
              <Link
                href="/focus-areas"
                className="mt-4 inline-flex text-sm font-semibold text-action hover:underline"
              >
                Learn more
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
