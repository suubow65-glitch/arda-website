"use client";

import { useEffect, useState } from "react";
import { Mail, MapPin, Phone, User, Users, Building2 } from "lucide-react";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { getSiteSettings } from "@/lib/content";
import { mapSiteSettings } from "@/lib/mappers";

export default function ContactPage() {
  const [settings, setSettings] = useState(mapSiteSettings({} as Parameters<typeof mapSiteSettings>[0]));

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  return (
    <>
      <PageHero
        kicker="Contact & Partnerships"
        title="Get in Touch With ARDA"
        description="Reach out for partnerships, funding, programme support or media enquiries. ARDA is based in Baidoa, Southwest State, Somalia."
        pageKey="contact"
        sectionKey="hero"
      />

      <section className="py-16">
        <div className="container-arda grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="font-display text-3xl text-navy">Baidoa Headquarters</h2>
            <p className="mt-4 text-sm leading-relaxed text-navy/70">
              ARDA’s headquarters is located on Mogadishu Road, Adaada, Baidoa,
              Southwest State, Somalia. We coordinate field programmes across Bay,
              Bakool and Banadir regions.
            </p>

            <ul className="mt-8 space-y-5 text-sm text-navy/80">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-action" />
                <span className="font-medium">{settings.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-action" />
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="font-medium hover:text-navy"
                >
                  {settings.phone}
                </a>
              </li>
              {settings.phoneIct && (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-action" />
                  <span className="text-navy/60">ICT / Technical:</span>
                  <a
                    href={`tel:${settings.phoneIct.replace(/\s/g, "")}`}
                    className="font-medium hover:text-navy"
                  >
                    {settings.phoneIct}
                  </a>
                </li>
              )}
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-action" />
                <span className="text-navy/60">General:</span>
                <a href={`mailto:${settings.email}`} className="font-medium hover:text-navy">
                  {settings.email}
                </a>
              </li>
              {settings.emailIct && (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-action" />
                  <span className="text-navy/60">ICT / Admin:</span>
                  <a href={`mailto:${settings.emailIct}`} className="font-medium hover:text-navy">
                    {settings.emailIct}
                  </a>
                </li>
              )}
              <li className="flex gap-3">
                <User className="mt-0.5 h-5 w-5 shrink-0 text-action" />
                <span className="text-navy/60">Executive Director:</span>
                <span className="font-medium">{settings.executiveDirector}</span>
              </li>
              {settings.subOfficeAddresses && (
                <li className="flex gap-3">
                  <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-action" />
                  <span className="text-navy/60">Sub-offices:</span>
                  <span className="font-medium">{settings.subOfficeAddresses}</span>
                </li>
              )}
            </ul>

            <div className="mt-8 rounded-2xl border border-navy/10 bg-surface p-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-action" />
                <h3 className="font-semibold text-navy">Partner with ARDA</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-navy/70">
                ARDA welcomes collaboration with donors, government, UN agencies,
                and civil-society partners. Select “Partnership & Funding” in the
                form and tell us how you would like to work together.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
              <h3 className="mb-2 font-display text-2xl text-navy">Send an enquiry</h3>
              <p className="mb-6 text-sm text-navy/70">
                All submissions are routed to the ARDA team. We aim to respond within two working days.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16">
        <div className="container-arda">
          <h2 className="mb-4 font-display text-2xl">Office Location</h2>
          <div className="overflow-hidden rounded-2xl border border-navy/10">
            <iframe
              title="ARDA Baidoa Head Office map"
              src="https://maps.google.com/maps?q=Baidoa%20Somalia&t=&z=12&ie=UTF8&iwloc=&output=embed"
              className="h-80 w-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
