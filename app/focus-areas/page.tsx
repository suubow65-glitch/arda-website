import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { getPillars } from "@/lib/content";
import { getPillarIcon } from "@/lib/pillarIcons";
import type { Pillar } from "@/lib/mappers";

export const metadata: Metadata = {
  title: "Focus Areas",
};

export default async function FocusAreasPage() {
  const pillars = (await getPillars()) as Pillar[];

  return (
    <>
      <PageHero
        kicker="Programmes"
        title="Thematic Sectors"
        description="ARDA concentrates resources across eight core pillars, from peace and protection to health, nutrition, WASH and inclusive education."
        pageKey="focus-areas"
        sectionKey="hero"
      />
      <section className="py-16">
        <div className="container-arda">
          <div className="space-y-12">
            {pillars.length === 0 && (
              <p className="text-center text-navy/60">
                No focus pillars published yet.
              </p>
            )}
            {pillars.map((area, index) => {
              const Icon = getPillarIcon(area.icon);
              const interventions = (area as { interventions?: string[] }).interventions || [];
              return (
                <article
                  key={area.slug}
                  id={area.slug}
                  className="grid items-start gap-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-card sm:p-8 lg:grid-cols-[5rem_1fr]"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-relief-50 text-relief">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-relief">
                      Pillar {index + 1}
                    </p>
                    <h2 className="mt-1 font-display text-2xl text-navy sm:text-3xl">
                      {area.title}
                    </h2>
                    <p className="mt-3 leading-relaxed text-navy/70">
                      {(area as { longDescription?: string }).longDescription ||
                        (area as { shortDesc?: string }).shortDesc ||
                        (area as { description?: string }).description}
                    </p>
                    {interventions.length > 0 && (
                      <>
                        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-navy">
                          Key sub-interventions
                        </h3>
                        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                          {interventions.map((item: string) => (
                            <li
                              key={item}
                              className="flex items-start gap-2 text-sm text-navy/80"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-relief" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
