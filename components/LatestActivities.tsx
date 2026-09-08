"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Activity } from "@/data/mockData";
import { mapActivity } from "@/lib/mappers";
import ActivityCard from "@/components/ActivityCard";

export default function LatestActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetch("/api/admin/activities", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { activities?: unknown[] };
        if (data.activities) {
          const mapped = data.activities
            .map((a) =>
              mapActivity(a as Parameters<typeof mapActivity>[0])
            )
            .sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 3);
          setActivities(mapped);
        }
      })
      .catch(() => {
        // No-op; component will remain empty rather than crash.
      });
  }, []);

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/activities" className="btn-navy">
          View all activities
        </Link>
      </div>
    </div>
  );
}
