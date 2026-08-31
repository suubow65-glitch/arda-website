"use client";

import { useMemo, useState } from "react";
import type { Activity } from "@/data/mockData";
import ActivityCard from "@/components/ActivityCard";

export default function ActivitiesDirectory({
  activities,
}: {
  activities: Activity[];
}) {
  const [sector, setSector] = useState("All");
  const [region, setRegion] = useState("All");

  const sectors = useMemo(
    () => ["All", ...Array.from(new Set(activities.map((a) => a.sector)))],
    [activities]
  );
  const regions = useMemo(
    () => ["All", ...Array.from(new Set(activities.map((a) => a.region)))],
    [activities]
  );

  const filtered = useMemo(() => {
    return activities.filter((activity) => {
      const sectorOk = sector === "All" || activity.sector === sector;
      const regionOk = region === "All" || activity.region === region;
      return sectorOk && regionOk;
    });
  }, [activities, sector, region]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {sectors.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSector(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                sector === item
                  ? "bg-relief text-white"
                  : "bg-surface text-navy hover:bg-navy/10"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {regions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRegion(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                region === item
                  ? "bg-navy text-white"
                  : "bg-surface text-navy hover:bg-navy/10"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-navy/70">
          No projects match these filters.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
