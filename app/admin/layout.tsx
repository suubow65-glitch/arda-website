"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Briefcase,
  FileText,
  FolderOpen,
  Globe,
  Image,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  Shield,
  Target,
  Type,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

type NavLink = { href: string; label: string; icon: React.ElementType };
type Section = { title: string; links: NavLink[] };

const sections: Section[] = [
  {
    title: "Dashboard",
    links: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }],
  },
  {
    title: "Hero & Notices",
    links: [
      { href: "/admin/alert-banner", label: "Alert Banner", icon: Megaphone },
      { href: "/admin/slides", label: "Hero Slideshows", icon: Image },
    ],
  },
  {
    title: "Programs & Field Work",
    links: [
      { href: "/admin/pillars", label: "Focus Pillars", icon: Target },
      { href: "/admin/activities", label: "Field Activities", icon: FolderOpen },
      { href: "/admin/gallery", label: "Photo Gallery", icon: Image },
    ],
  },
  {
    title: "Publications & Jobs",
    links: [
      { href: "/admin/documents", label: "PDF Documents", icon: FileText },
      { href: "/admin/vacancies", label: "Jobs & Tenders", icon: Briefcase },
    ],
  },
  {
    title: "NGO Profile",
    links: [
      { href: "/admin/about", label: "Vision & Mission", icon: BookOpen },
      { href: "/admin/team", label: "Team & Board", icon: Users },
      { href: "/admin/partners", label: "Partners & Donors", icon: Globe },
      { href: "/admin/stats", label: "Impact Stats", icon: Target },
    ],
  },
  {
    title: "Settings & Security",
    links: [
      { href: "/admin/pages", label: "Page Headings", icon: Type },
      { href: "/admin/settings", label: "Site Settings", icon: Settings },
      { href: "/admin/security", label: "Admin Security", icon: Shield },
      { href: "/admin/messages", label: "Contact Messages", icon: Inbox },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy text-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin" className="font-display text-xl">
            ARDA Admin
          </Link>
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-4 p-3">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-white/40">
                {section.title}
              </p>
              <div className="mt-1 flex flex-col gap-1">
                {section.links.map((link) => {
                  const active = isActive(pathname, link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                        active
                          ? "bg-action text-white"
                          : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </aside>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-navy/40 lg:hidden"
          aria-label="Close overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-navy/10 bg-white px-4 lg:px-8">
          <button
            type="button"
            className="rounded-md border border-navy/15 p-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-navy/70">
            Action for Relief And Development Agency
          </p>
          <Link href="/" className="text-sm font-semibold text-action hover:underline">
            View site
          </Link>
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
