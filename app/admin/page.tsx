"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, FolderOpen, Images, Inbox, Loader2 } from "lucide-react";

type Stats = {
  activities: number;
  documents: number;
  unreadMessages: number;
  supabaseReady: boolean;
};

const shortcuts = [
  { href: "/admin/slides", label: "Manage Slideshows", icon: Images },
  { href: "/admin/activities", label: "Manage Activities", icon: FolderOpen },
  { href: "/admin/documents", label: "Manage Documents", icon: FileText },
  { href: "/admin/messages", label: "View Messages", icon: Inbox },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unable to load dashboard stats.");
        const data = (await res.json()) as Stats;
        setStats(data);
      })
      .catch(() => setError("Unable to load dashboard stats."));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Overview</h1>
      <p className="mt-1 text-sm text-navy/70">
        Quick snapshot of the ARDA website content.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">
            Total Activities
          </p>
          <p className="mt-2 font-display text-3xl text-navy">
            {stats ? stats.activities : <Loader2 className="h-6 w-6 animate-spin text-action" />}
          </p>
        </div>
        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">
            Total Reports
          </p>
          <p className="mt-2 font-display text-3xl text-navy">
            {stats ? stats.documents : <Loader2 className="h-6 w-6 animate-spin text-action" />}
          </p>
        </div>
        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">
            Unread Messages
          </p>
          <p className="mt-2 font-display text-3xl text-navy">
            {stats ? stats.unreadMessages : <Loader2 className="h-6 w-6 animate-spin text-action" />}
          </p>
        </div>
        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">
            Database
          </p>
          <p className="mt-2 text-sm font-semibold text-navy">
            {stats ? (stats.supabaseReady ? "Connected" : "Not configured") : "Loading…"}
          </p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl text-navy">Quick shortcuts</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-2xl border border-navy/10 bg-white p-4 shadow-card transition hover:border-action"
            >
              <Icon className="h-5 w-5 text-action" />
              <span className="font-semibold text-navy">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
