import type { Metadata } from "next";
import { MapPin, Calendar, Star } from "lucide-react";
import PageHero from "@/components/PageHero";
import SafeImage from "@/components/SafeImage";
import { getGalleryPhotos } from "@/lib/content";

export const metadata: Metadata = {
  title: "Field Photo Gallery",
};

export default async function GalleryPage() {
  const photos = (await getGalleryPhotos()) as {
    id: string;
    title: string;
    location: string;
    category: string;
    image: string;
    date: string;
    featured: boolean;
  }[];

  return (
    <>
      <PageHero
        kicker="In the field"
        title="Photo Gallery"
        description="Images from ARDA programmes across Baidoa, Burhakaba, Bay, Bakool and surrounding districts."
        pageKey="gallery"
        sectionKey="hero"
      />
      <section className="py-16">
        <div className="container-arda">
          {photos.length === 0 ? (
            <p className="text-center text-navy/60">No gallery photos published yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <article
                  key={photo.id}
                  className="group overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card"
                >
                  <div className="relative h-56 bg-surface">
                    <SafeImage
                      src={photo.image}
                      alt={photo.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {photo.featured && (
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-action px-2 py-1 text-xs font-semibold text-white">
                        <Star className="h-3 w-3" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl text-navy">{photo.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-navy/70">
                      {photo.category && (
                        <span className="rounded-full bg-relief-50 px-2 py-1 text-relief">
                          {photo.category}
                        </span>
                      )}
                      {photo.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {photo.location}
                        </span>
                      )}
                      {photo.date && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {photo.date}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
