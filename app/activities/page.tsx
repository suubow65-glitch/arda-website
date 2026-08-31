import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ActivitiesDirectory from "@/components/ActivitiesDirectory";
import { getActivities } from "@/lib/content";

export const metadata: Metadata = {
  title: "Activities",
};

export default async function ActivitiesPage() {
  const activities = await getActivities();

  return (
    <>
      <PageHero
        kicker="Field programmes"
        title="Projects & Activities"
        description="Filter ARDA projects by sector and region — from EPI/PHC and nutrition in Southwest State to agriculture and livestock in Baidoa."
      />
      <section className="py-16">
        <div className="container-arda">
          <ActivitiesDirectory activities={activities} />
        </div>
      </section>
    </>
  );
}
