"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { org } from "@/data/mockData";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import { mapSiteSettings } from "@/lib/mappers";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import type { SiteSettingsRow } from "@/lib/types";

const adminKey = "arda_admin_site_settings";

const empty: SiteSettingsRow = {
  id: "00000000-0000-0000-0000-000000000001",
  org_name: org.name,
  short_name: org.shortName,
  tagline: org.tagline,
  phone: org.phone,
  phone_ict: "+252-0615555555",
  email: org.email,
  email_ict: "ict@arda.org.so",
  address: org.address,
  sub_office_addresses: "Burhakaba · Mogadishu",
  location: org.location,
  website: org.website,
  established: org.established,
  registrations: org.registrations,
  executive_director: org.executiveDirector,
  social_facebook: "",
  social_x: "",
  social_linkedin: "",
  social_instagram: "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function SettingsAdminPage() {
  const [form, setForm] = useState<SiteSettingsRow>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    const supabase = getBrowserSupabase();
    if (supabase) {
      try {
        const { data, error: qErr } = await supabase
          .from("site_settings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!qErr && data) {
          const row = data as SiteSettingsRow;
          setForm(row);
          setLocalItem(adminKey, row);
          setLocalItem(storageKeys.settings, mapSiteSettings(row));
          setLoading(false);
          return;
        }
      } catch {
        // fallback
      }
    }

    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { settings: SiteSettingsRow | null };
        if (data.settings) {
          setForm(data.settings);
          setLocalItem(adminKey, data.settings);
          setLocalItem(storageKeys.settings, mapSiteSettings(data.settings));
          setLoading(false);
          return;
        }
      }
    } catch {
      // fallback
    }

    const saved = getLocalItem<SiteSettingsRow>(adminKey);
    setForm(saved ?? empty);
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

    setLocalItem(adminKey, form);
    setLocalItem(storageKeys.settings, mapSiteSettings(form));

    const supabase = getBrowserSupabase();
    try {
      if (supabase) {
        const payload = {
          ...form,
          updated_at: new Date().toISOString(),
        };
        const { error: upsertError } = await supabase.from("site_settings").upsert(payload);
        if (upsertError) throw new Error(upsertError.message);
        setSuccess("Saved Live to Supabase Cloud!");
        return;
      }

      const res = await fetch("/api/admin/settings", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setSuccess("Saved Live to Supabase Cloud!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cloud write failed.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-action" />
      </div>
    );
  }

  const field = (
    label: string,
    name: keyof SiteSettingsRow,
    type = "text",
    required = false
  ) => (
    <label key={name} className="block text-sm font-semibold">
      {label}
      {type === "textarea" ? (
        <textarea
          required={required}
          rows={3}
          value={String(form[name] ?? "")}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
        />
      ) : (
        <input
          required={required}
          type={type}
          value={String(form[name] ?? "")}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
        />
      )}
    </label>
  );

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Site Settings</h1>
      <p className="text-sm text-navy/70">
        Update organization details, contacts, registrations, and social links.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-sm">
          ⚠️ Cloud error: {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700 shadow-sm">
          ✓ {success}
        </div>
      )}

      <form onSubmit={save} className="mt-6 space-y-6">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
          <h2 className="mb-4 font-display text-lg text-navy">Organization Identity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Organization Name", "org_name", "text", true)}
            {field("Short Name", "short_name", "text", true)}
            <div className="sm:col-span-2">
              {field("Tagline / Mandate", "tagline", "textarea", true)}
            </div>
            {field("Executive Director", "executive_director", "text", true)}
            {field("Established Year", "established")}
            <div className="sm:col-span-2">
              {field("Official Registrations", "registrations", "textarea")}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
          <h2 className="mb-4 font-display text-lg text-navy">Contact Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Primary Email", "email", "email", true)}
            {field("ICT / Admin Email", "email_ict", "email")}
            {field("Primary Phone", "phone", "tel", true)}
            {field("ICT / Technical Phone", "phone_ict", "tel")}
            {field("Website Domain", "website")}
            {field("Head Office Location", "location")}
            <div className="sm:col-span-2">
              {field("Head Office Address", "address", "textarea", true)}
            </div>
            <div className="sm:col-span-2">
              {field("Sub-Office Locations", "sub_office_addresses", "textarea")}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
          <h2 className="mb-4 font-display text-lg text-navy">Social Media Links</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Facebook URL", "social_facebook")}
            {field("X (Twitter) URL", "social_x")}
            {field("LinkedIn URL", "social_linkedin")}
            {field("Instagram URL", "social_instagram")}
          </div>
        </div>

        <button type="submit" className="btn-action" disabled={saving}>
          {saving ? "Saving Live to Cloud…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
