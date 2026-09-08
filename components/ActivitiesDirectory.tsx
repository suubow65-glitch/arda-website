"use client";

import { useEffect, useMemo, useState } from "react";
import type { Activity } from "@/data/mockData";
import { mapActivity } from "@/lib/mappers";
import ActivityCard from "@/components/ActivityCard";

export default function ActivitiesDirectory({
  activities,
}: {
  activities: Activity[];
}) {
  const [items, setItems] = useState<Activity[]>(activities);

  useEffect(() => {
    setItems(activities);
  }, [activities]);

  // Always refresh from the live Supabase Cloud endpoint so mobile/desktop
  // visitors see the newest field activities immediately.
  useEffect(() => {
    fetch("/api/admin/activities", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { activities?: unknown[] };
        if (data.activities && data.activities.length > 0) {
          setItems(data.activities.map((a) => mapActivity(a as Parameters<typeof mapActivity>[0])));
        }
      })
      .catch(() => {
        // Keep the server-rendered initial data on error.
      });
  }, []);

  const [sector, setSector] = useState("All");
  const [region, setRegion] = useState("All");

  const sectors = useMemo(
    () => ["All", ...Array.from(new Set(items.map((a) => a.sector)))],
    [items]
  );
  const regions = useMemo(
    () => ["All", ...Array.from(new Set(items.map((a) => a.region)))],
    [items]
  );

  const filtered = useMemo(() => {
    return items.filter((activity) => {
      const sectorOk = sector === "All" || activity.sector === sector;
      const regionOk = region === "All" || activity.region === region;
      return sectorOk && regionOk;
    });
  }, [items, sector, region]);

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
