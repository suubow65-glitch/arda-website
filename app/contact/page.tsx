import type { Metadata } from "next";
import { Mail, MapPin, Phone, User } from "lucide-react";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { org } from "@/data/mockData";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Get in touch"
        title="Contact Us"
        description="Partner with ARDA on relief and development programmes across Southwest State and Banadir, Somalia."
      />
      <section className="py-16">
        <div className="container-arda grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="font-display text-3xl">Baidoa Head Office</h2>
            <ul className="mt-6 space-y-4 text-sm text-navy/80">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-action" />
                {org.address}
              </li>
              <li className="flex gap-3">
                <Mail className="h-5 w-5 shrink-0 text-action" />
                <a href={`mailto:${org.email}`} className="hover:text-navy">
                  {org.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-action" />
                <a
                  href={`tel:${org.phone.replace(/\s/g, "")}`}
                  className="hover:text-navy"
                >
                  {org.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <User className="h-5 w-5 shrink-0 text-action" />
                Executive Director: {org.executiveDirector}
              </li>
            </ul>
            <p className="mt-6 text-sm text-navy/65">
              Website: <a href={`https://${org.website}`} className="text-action hover:underline">{org.website}</a>
            </p>
          </div>
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </section>
      <section className="bg-white pb-16">
        <div className="container-arda">
          <h2 className="mb-4 font-display text-2xl">Location</h2>
          <div className="overflow-hidden rounded-2xl border border-navy/10">
            <iframe
              title="ARDA Baidoa Head Office map"
              src="https://maps.google.com/maps?q=Baidoa%20Southwest%20State%20Somalia&t=&z=12&ie=UTF8&iwloc=&output=embed"
              className="h-80 w-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
