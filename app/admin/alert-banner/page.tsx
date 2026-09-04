"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Megaphone } from "lucide-react";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import type { AlertBannerRow } from "@/lib/types";

const defaultBanner: AlertBannerRow = {
  id: "",
  message: "🚨 Emergency Relief Operations Active in Baidoa & Burhakaba",
  button_text: "Donate Now",
  button_url: "/contact",
  active: false,
  bg_color: "#C60C30",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function AlertBannerAdminPage() {
  const [banner, setBanner] = useState<AlertBannerRow>(defaultBanner);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    const cached = getLocalItem<AlertBannerRow>(storageKeys.alertBanner);
    try {
      const res = await fetch("/api/admin/alert-banner");
      if (res.ok) {
        const data = (await res.json()) as { banners?: AlertBannerRow[] };
        const first = data.banners?.[0];
        if (first) {
          setBanner(first);
          setLocalItem(storageKeys.alertBanner, first);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore, fallback to cache
    }
    if (cached) setBanner(cached);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const fd = new FormData();
    fd.set("message", banner.message);
    fd.set("button_text", banner.button_text || "");
    fd.set("button_url", banner.button_url || "");
    fd.set("active", banner.active ? "true" : "false");
    fd.set("bg_color", banner.bg_color);

    setLocalItem(storageKeys.alertBanner, banner);

    try {
      const url = banner.id
        ? `/api/admin/alert-banner/${banner.id}`
        : "/api/admin/alert-banner";
      const method = banner.id ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = (await res.json()) as { error?: string; banner?: AlertBannerRow };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      if (data.banner) {
        setBanner(data.banner);
        setLocalItem(storageKeys.alertBanner, data.banner);
      }
      setSuccess("Alert banner saved!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Saved locally (cloud unavailable).";
      setSuccess(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Megaphone className="h-6 w-6 text-action" />
        <div>
          <h1 className="font-display text-2xl text-navy">Alert Banner</h1>
          <p className="text-sm text-navy/70">
            Manage the top emergency/announcement bar on the public website.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-action" />
        </div>
      ) : (
        <form
          onSubmit={save}
          className="grid gap-5 rounded-2xl border border-navy/10 bg-white p-6 shadow-card"
        >
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {success && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
          )}

          <label className="block text-sm font-semibold">
            Message
            <input
              required
              value={banner.message}
              onChange={(e) => setBanner({ ...banner, message: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
              placeholder="🚨 Emergency Relief Operations Active in Baidoa & Burhakaba"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Button text
              <input
                value={banner.button_text || ""}
                onChange={(e) => setBanner({ ...banner, button_text: e.target.value })}
                className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Button URL
              <input
                value={banner.button_url || ""}
                onChange={(e) => setBanner({ ...banner, button_url: e.target.value })}
                className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Background color
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  value={banner.bg_color}
                  onChange={(e) => setBanner({ ...banner, bg_color: e.target.value })}
                  className="h-10 w-16 rounded border border-navy/15 bg-surface"
                />
                <input
                  value={banner.bg_color}
                  onChange={(e) => setBanner({ ...banner, bg_color: e.target.value })}
                  className="w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
                />
              </div>
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={banner.active}
                onChange={(e) => setBanner({ ...banner, active: e.target.checked })}
                className="h-4 w-4"
              />
              Banner active
            </label>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-action" disabled={saving}>
              {saving ? "Saving…" : "Save alert banner"}
            </button>
          </div>

          <div
            className="mt-2 rounded-lg px-4 py-3 text-center text-sm font-semibold text-white"
            style={{ backgroundColor: banner.bg_color }}
          >
            {banner.message || "Preview banner message"}
            {banner.button_text && (
              <span className="ml-3 underline">{banner.button_text}</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
