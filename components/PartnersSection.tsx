import { partners } from "@/data/mockData";

export default function PartnersSection() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {partners.map((partner) => (
        <div
          key={partner.name}
          className="flex h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-navy/20 bg-white px-3 text-center"
        >
          <span className="text-xs font-bold tracking-wide text-navy">
            {partner.initials}
          </span>
          <span className="mt-1 text-[11px] text-navy/55">{partner.name}</span>
        </div>
      ))}
    </div>
  );
}
