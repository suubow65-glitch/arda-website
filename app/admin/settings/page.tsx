"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { SiteSettingsRow } from "@/lib/types";

const empty: Partial<SiteSettingsRow> = {
  org_name: "",
  short_name: "",
  tagline: "",
  phone: "",
  phone_ict: "",
  email: "",
  email_ict: "",
  address: "",
  sub_office_addresses: "",
  location: "",
  website: "",
  established: "",
  registrations: "",
  executive_director: "",
  social_facebook: "",
  social_x: "",
  social_linkedin: "",
  social_instagram: "",
};

export default function SettingsAdminPage() {
  const [form, setForm] = useState<Partial<SiteSettingsRow>>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load settings.");
        const data = (await res.json()) as { settings: SiteSettingsRow | null };
        setForm(data.settings ?? empty);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed.");
    } catch (err) {
      setError((err as Error).message);
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
      <p className="text-sm text-navy/70">Update contact details and social links.</p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={save} className="mt-6 grid gap-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-card sm:grid-cols-2">
        {field("Organisation name", "org_name")}
        {field("Short name", "short_name")}
        {field("Tagline", "tagline")}
        {field("Primary phone", "phone")}
        {field("ICT phone", "phone_ict")}
        {field("Primary email", "email")}
        {field("ICT email", "email_ict")}
        {field("Head office address", "address")}
        {field("Sub-office addresses", "sub_office_addresses")}
        {field("Location", "location")}
        {field("Website", "website")}
        {field("Established", "established")}
        {field("Executive Director", "executive_director")}
        {field("Registrations", "registrations", "text")}
        {field("Facebook URL", "social_facebook")}
        {field("X / Twitter URL", "social_x")}
        {field("LinkedIn URL", "social_linkedin")}
        {field("Instagram URL", "social_instagram")}

        <div className="sm:col-span-2">
          <button type="submit" className="btn-action" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
