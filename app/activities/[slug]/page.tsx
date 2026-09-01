import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/constants";
import SafeImage from "@/components/SafeImage";
import { getActivities, getActivityBySlug } from "@/lib/content";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const all = await getActivities();
  return all.map((activity) => ({ slug: activity.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const activity = await getActivityBySlug(params.slug);
  return { title: activity?.title ?? "Activity" };
}

export default async function ActivityDetailPage({ params }: Props) {
  const activity = await getActivityBySlug(params.slug);
  if (!activity) notFound();

  const meta = [activity.location, activity.beneficiaries].filter(Boolean);
  const imageSrc =
    (activity as { imageUrl?: string }).imageUrl ||
    (activity as { image_url?: string }).image_url ||
    activity.image ||
    ACTIVITY_FALLBACK_IMAGE;

  return (
    <article>
      <section className="relative h-72 bg-navy">
        <SafeImage
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover opacity-50"
          fallback={ACTIVITY_FALLBACK_IMAGE}
        />
        <div className="container-arda absolute inset-0 flex flex-col justify-end pb-10 text-white">
          <span className="w-fit rounded-full bg-relief px-3 py-1 text-xs font-semibold">
            {activity.sector} · {activity.status}
          </span>
          <h1 className="mt-3 max-w-3xl font-display text-3xl sm:text-4xl">
            {activity.title}
          </h1>
        </div>
      </section>
      <section className="py-12">
        <div className="container-arda max-w-3xl">
          <p className="text-sm text-navy/60">
            {meta.join(" · ")} ·{" "}
            {new Date(activity.date).toLocaleDateString("en-GB")}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-navy/80">
            {activity.description}
          </p>
          <Link href="/activities" className="btn-navy mt-8">
            Back to activities
          </Link>
        </div>
      </section>
    </article>
  );
}
