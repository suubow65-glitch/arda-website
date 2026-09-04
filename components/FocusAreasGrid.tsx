import Link from "next/link";
import { focusAreas } from "@/data/mockData";
import { getPillars } from "@/lib/content";
import { getPillarIcon } from "@/lib/pillarIcons";
import type { Pillar } from "@/lib/mappers";

export default async function FocusAreasGrid({
  compact = false,
}: {
  compact?: boolean;
}) {
  const pillars = (await getPillars()) as Pillar[];
  const areas = pillars.length ? pillars : (focusAreas as unknown as Pillar[]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {areas.map((area) => {
        const Icon = getPillarIcon(area.icon);
        return (
          <article
            key={area.slug}
            className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-relief-50 text-relief">
              <Icon className="h-6 w-6" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-relief">
              {(area as { shortTitle?: string }).shortTitle || area.title}
            </p>
            <h3 className="mt-1 font-display text-2xl text-navy">{area.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-navy/70">
              {compact
                ? (area as { shortDesc?: string }).shortDesc ||
                  (area as { description?: string }).description ||
                  (area as { longDescription?: string }).longDescription
                : (area as { longDescription?: string }).longDescription ||
                  (area as { shortDesc?: string }).shortDesc ||
                  (area as { description?: string }).description}
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
