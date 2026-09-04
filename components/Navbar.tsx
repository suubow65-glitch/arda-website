"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Menu, Phone, X } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { navLinks } from "@/data/mockData";
import { getAlertBanner, getSiteSettings } from "@/lib/content";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] =
    useState<Awaited<ReturnType<typeof getSiteSettings>> | null>(null);
  const [banner, setBanner] = useState<Awaited<ReturnType<typeof getAlertBanner>> | null>(null);
  const [bannerClosed, setBannerClosed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    getSiteSettings().then((s) => setSettings(s));
    getAlertBanner().then((b) => setBanner(b));
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {banner && banner.active && !bannerClosed && (
        <div
          className="relative px-4 py-2 text-center text-sm font-semibold text-white"
          style={{ backgroundColor: banner.bgColor || "#C60C30" }}
        >
          <div className="container-arda flex items-center justify-center gap-3">
            <span>{banner.message}</span>
            {banner.buttonText && banner.buttonUrl && (
              <a
                href={banner.buttonUrl}
                className="rounded bg-white/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wide hover:bg-white/30"
              >
                {banner.buttonText}
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => setBannerClosed(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/80 hover:text-white"
            aria-label="Close alert banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="bg-navy text-white">
        <div className="container-arda flex flex-wrap items-center justify-between gap-2 py-2 text-xs sm:text-sm">
          <a
            href={`mailto:${settings?.email ?? ""}`}
            className="inline-flex items-center gap-1.5 hover:text-relief"
          >
            <Mail className="h-3.5 w-3.5 text-relief" />
            {settings?.email}
          </a>
          <p className="hidden items-center gap-1.5 md:inline-flex">
            <MapPin className="h-3.5 w-3.5 text-action" />
            {settings?.location}
          </p>
          <a
            href={`tel:${(settings?.phone ?? "").replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 hover:text-action"
          >
            <Phone className="h-3.5 w-3.5 text-action" />
            {settings?.phone}
          </a>
          <Link
            href="/admin"
            className="ml-auto inline-flex items-center gap-1.5 font-semibold hover:text-relief"
          >
            Staff/Admin Login
          </Link>
        </div>
      </div>

      <div
        className={`border-b border-navy/10 bg-white transition-shadow ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container-arda flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <Link href="/" className="flex items-center">
            <SafeImage
              src="/logo.png"
              alt={`${settings?.shortName ?? "ARDA"} logo`}
              className="h-12 w-auto object-contain md:h-14"
            />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition ${
                    active
                      ? "text-relief"
                      : "text-navy/80 hover:text-navy"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/contact" className="btn-action hidden sm:inline-flex">
              Partner With Us
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-navy/15 text-navy lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-b border-navy/10 bg-white shadow-lg lg:hidden">
          <nav className="container-arda flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-sm font-semibold text-navy hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/contact" className="btn-action mt-2 w-full">
              Partner With Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
