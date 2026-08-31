import { MapPin } from "lucide-react";
import { regions } from "@/data/mockData";

export default function RegionalCoverage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {regions.map((region) => (
        <article
          key={region.name}
          className="rounded-2xl bg-navy p-6 text-white"
        >
          <div className="flex items-center gap-2 text-action">
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Intervention hub
            </span>
          </div>
          <h3 className="mt-3 font-display text-2xl">{region.name}</h3>
          <p className="mt-1 text-sm text-white/80">{region.hubs}</p>
          <p className="mt-3 text-sm text-white/70">{region.focus}</p>
        </article>
      ))}
    </div>
  );
}
