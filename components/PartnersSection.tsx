"use client";

import { useEffect, useState } from "react";
import SafeImage from "@/components/SafeImage";
import { getPartners } from "@/lib/content";
import { mapPartner } from "@/lib/mappers";

export default function PartnersSection() {
  const [partners, setPartners] = useState<ReturnType<typeof mapPartner>[]>([]);

  useEffect(() => {
    getPartners().then(setPartners);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {partners.map((partner) => {
        const logo =
          partner.logoUrl ||
          (partner as { logo_url?: string }).logo_url ||
          "";
        return logo ? (
          <a
            key={partner.id}
            href={partner.websiteUrl || "#"}
            target={partner.websiteUrl ? "_blank" : undefined}
            rel={partner.websiteUrl ? "noopener noreferrer" : undefined}
            className="flex h-24 items-center justify-center rounded-2xl border border-navy/10 bg-white p-3 transition hover:shadow-sm"
          >
            <SafeImage
              src={logo}
              alt={partner.name}
              className="mb-2 h-12 max-w-[150px] object-contain"
            />
          </a>
        ) : (
          <div
            key={partner.id}
            className="flex h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-navy/20 bg-white px-3 text-center"
          >
            <span className="text-xs font-bold tracking-wide text-navy">
              {partner.initials}
            </span>
            <span className="mt-1 text-[11px] text-navy/55">{partner.name}</span>
          </div>
        );
      })}
    </div>
  );
}
