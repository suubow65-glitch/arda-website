import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/constants";
import SafeImage from "@/components/SafeImage";
import type { Activity } from "@/data/mockData";

export default function ActivityCard({ activity }: { activity: Activity }) {
  const imageSrc =
    (activity as { imageUrl?: string }).imageUrl ||
    (activity as { image_url?: string }).image_url ||
    activity.image ||
    "";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card">
      <div className="relative h-48">
        <SafeImage
          src={imageSrc}
          alt=""
          className="h-48 w-full object-cover rounded-t-lg"
          fallback={ACTIVITY_FALLBACK_IMAGE}
        />
        <span className="absolute left-4 top-4 rounded-full bg-relief px-3 py-1 text-xs font-semibold text-white">
          {activity.sector}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-3 text-xs text-navy/60">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(activity.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {activity.location}
          </span>
        </div>
        <h3 className="mt-3 font-display text-xl text-navy">{activity.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-navy/70">
          {activity.summary}
        </p>
        <Link
          href={`/activities/${activity.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-action hover:underline"
        >
          Read More <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
