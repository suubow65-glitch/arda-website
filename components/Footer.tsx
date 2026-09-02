"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { navLinks } from "@/data/mockData";
import SafeImage from "@/components/SafeImage";
import { getSiteSettings } from "@/lib/content";
import { mapSiteSettings } from "@/lib/mappers";

export default function Footer() {
  const [settings, setSettings] = useState(mapSiteSettings({} as Parameters<typeof mapSiteSettings>[0]));

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  const socials = [
    { icon: Facebook, label: "Facebook", url: settings.social.facebook },
    { icon: Twitter, label: "X", url: settings.social.x },
    { icon: Linkedin, label: "LinkedIn", url: settings.social.linkedin },
    { icon: Instagram, label: "Instagram", url: settings.social.instagram },
  ];

  return (
    <footer className="bg-navy text-white">
      <div className="container-arda grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center">
            <SafeImage
              src="/logo.png"
              alt="ARDA Logo"
              className="h-12 w-auto object-contain rounded-lg bg-white/90 p-1.5"
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/75">
            {settings.tagline}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-relief">
            Quick Links
          </h2>
          <ul className="mt-4 space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/80 transition hover:text-action"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/admin"
                className="text-sm text-white/80 transition hover:text-action"
              >
                Admin Portal
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-relief">
            Head Office
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-action" />
              {settings.address}
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-action" />
              <a href={`mailto:${settings.email}`} className="hover:text-white">
                {settings.email}
              </a>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-action" />
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {settings.phone}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-relief">
            Follow ARDA
          </h2>
          <p className="mt-4 text-sm text-white/75">
            Updates from field programmes in Baidoa, Burhakaba, Bay, Bakool and
            Mogadishu.
          </p>
          <div className="mt-4 flex gap-3">
            {socials.map(({ icon: Icon, label, url }) => (
              <a
                key={label}
                href={url || "#"}
                aria-label={label}
                target={url ? "_blank" : undefined}
                rel={url ? "noopener noreferrer" : undefined}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-action"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-arda flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.name}. All rights reserved. · {settings.registrations}
          </p>
          <p>{settings.website} · {settings.location}</p>
        </div>
      </div>
    </footer>
  );
}
