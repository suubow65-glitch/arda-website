import Link from "next/link";
import { getLatestActivities } from "@/lib/content";
import ActivityCard from "@/components/ActivityCard";

export default async function LatestActivities() {
  const activities = await getLatestActivities(3);

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
