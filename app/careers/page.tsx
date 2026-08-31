"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, Calendar, MapPin } from "lucide-react";
import PageHero from "@/components/PageHero";
import { getSiteSettings, getVacancies } from "@/lib/content";
import { mapSiteSettings, mapVacancy } from "@/lib/mappers";

export default function CareersPage() {
  const [settings, setSettings] = useState(mapSiteSettings({} as Parameters<typeof mapSiteSettings>[0]));
  const [vacancies, setVacancies] = useState<ReturnType<typeof mapVacancy>[]>([]);

  useEffect(() => {
    getSiteSettings().then(setSettings);
    getVacancies().then(setVacancies);
  }, []);

  const jobs = vacancies.filter((v) => v.type === "job");
  const tenders = vacancies.filter((v) => v.type === "tender");

  return (
    <>
      <PageHero
        kicker="Work with us"
        title="Careers & Tenders"
        description="Join ARDA in delivering relief and development programmes across Somalia, or respond to our open procurement opportunities."
      />

      <section className="py-16">
        <div className="container-arda">
          <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-card lg:p-10">
            <h2 className="font-display text-3xl text-navy">Why work with ARDA?</h2>
            <p className="mt-4 leading-relaxed text-navy/70">
              {settings.name} is a growing Somali NGO committed to humanitarian
              excellence and sustainable development. We value local talent,
              accountability, and innovation. Active vacancies and tender
              opportunities are posted below.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-arda">
          <p className="section-kicker">Openings</p>
          <h2 className="mt-2 font-display text-3xl text-navy">Job Vacancies</h2>
          {jobs.length === 0 ? (
            <p className="mt-6 text-navy/70">
              There are no active job vacancies at the moment. Please check back
              soon or follow us on social media.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {jobs.map((job) => (
                <VacancyCard key={job.id} vacancy={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container-arda">
          <p className="section-kicker">Procurement</p>
          <h2 className="mt-2 font-display text-3xl text-navy">Supplier Tenders</h2>
          {tenders.length === 0 ? (
            <p className="mt-6 text-navy/70">
              No active procurement tenders at the moment.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {tenders.map((tender) => (
                <VacancyCard key={tender.id} vacancy={tender} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function VacancyCard({
  vacancy,
}: {
  vacancy: ReturnType<typeof mapVacancy>;
}) {
  return (
    <article className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-block rounded-full bg-action/10 px-2.5 py-1 text-xs font-semibold text-action">
            {vacancy.type === "job" ? "Job" : "Tender"}
          </span>
          <h3 className="mt-3 font-display text-xl text-navy">{vacancy.title}</h3>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-navy/70">
        {vacancy.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-navy/70">
        {vacancy.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4 text-relief" />
            {vacancy.location}
          </span>
        )}
        {vacancy.deadline && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-4 w-4 text-relief" />
            {vacancy.deadline}
          </span>
        )}
      </div>
      {vacancy.fileUrl && (
        <a
          href={vacancy.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Download details
        </a>
      )}
    </article>
  );
}
