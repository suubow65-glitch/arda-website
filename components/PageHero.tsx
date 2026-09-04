"use client";

import { useEffect, useState } from "react";
import { getPageHeader } from "@/lib/content";

export default function PageHero({
  kicker,
  title,
  description,
  pageKey,
  sectionKey,
}: {
  kicker: string;
  title: string;
  description: string;
  pageKey?: string;
  sectionKey?: string;
}) {
  const [header, setHeader] = useState({ kicker, title, description });

  useEffect(() => {
    if (!pageKey || !sectionKey) return;
    getPageHeader(pageKey, sectionKey, { kicker, title, description }).then(setHeader);
  }, [pageKey, sectionKey, kicker, title, description]);

  return (
    <section className="bg-navy py-16 text-white">
      <div className="container-arda max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-relief">
          {header.kicker}
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">{header.title}</h1>
        <p className="mt-4 text-base text-white/80 sm:text-lg">{header.description}</p>
      </div>
    </section>
  );
}
