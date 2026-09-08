"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import { coreValues as defaultValues, org } from "@/data/mockData";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import type { AboutContentRow, CoreValue } from "@/lib/types";

const adminKey = "arda_admin_about_data";

export default function AboutAdminPage() {
  const [vision, setVision] = useState(org.vision);
  const [mission, setMission] = useState(org.mission);
  const [values, setValues] = useState<CoreValue[]>(defaultValues);
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
          .from("about_content")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!qErr && data) {
          const row = data as AboutContentRow;
          setVision(row.vision || org.vision);
          setMission(row.mission || org.mission);
          setValues(row.core_values?.length ? row.core_values : defaultValues);
          setLocalItem(adminKey, { vision: row.vision, mission: row.mission, values: row.core_values });
          setLocalItem(storageKeys.about, { vision: row.vision, mission: row.mission, coreValues: row.core_values });
          setLoading(false);
          return;
        }
      } catch {
        // fallback
      }
    }

    try {
      const res = await fetch("/api/admin/about", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { about: AboutContentRow | null };
        if (data.about) {
          setVision(data.about.vision || org.vision);
          setMission(data.about.mission || org.mission);
          setValues(data.about.core_values?.length ? data.about.core_values : defaultValues);
          setLoading(false);
          return;
        }
      }
    } catch {
      // fallback
    }

    const saved = getLocalItem<{
      vision: string;
      mission: string;
      values: CoreValue[];
    }>(adminKey);
    if (saved) {
      setVision(saved.vision);
      setMission(saved.mission);
      setValues(saved.values);
    }
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

    setLocalItem(adminKey, { vision, mission, values });
    setLocalItem(storageKeys.about, { vision, mission, coreValues: values });

    const supabase = getBrowserSupabase();
    try {
      if (supabase) {
        const payload = {
          vision,
          mission,
          core_values: values,
          updated_at: new Date().toISOString(),
        };
        const { error: upsertError } = await supabase.from("about_content").upsert(payload);
        if (upsertError) throw new Error(upsertError.message);
        setSuccess("Saved Live to Supabase Cloud!");
        return;
      }

      const res = await fetch("/api/admin/about", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vision, mission, core_values: values }),
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

  function updateValue(index: number, patch: Partial<CoreValue>) {
    const next = [...values];
    next[index] = { ...next[index], ...patch };
    setValues(next);
  }

  function removeValue(index: number) {
    setValues((v) => v.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-action" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">About Content</h1>
      <p className="text-sm text-navy/70">Edit vision, mission and core values.</p>

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
          <label className="block text-sm font-semibold">
            Vision statement
            <textarea
              required
              rows={3}
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
          <label className="block text-sm font-semibold">
            Mission statement
            <textarea
              required
              rows={3}
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-navy">Core Values</h2>
            <button
              type="button"
              onClick={() =>
                setValues([
                  ...values,
                  { title: "New value", description: "", icon: "sparkles" },
                ])
              }
              className="rounded-md border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-surface"
            >
              <Plus className="mr-1 inline h-3.5 w-3.5" /> Add value
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {values.map((v, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-navy/10 bg-surface p-3"
              >
                <div className="flex-1 space-y-2">
                  <input
                    required
                    value={v.title}
                    onChange={(e) => updateValue(i, { title: e.target.value })}
                    className="w-full rounded border border-navy/15 bg-white px-2.5 py-1.5 text-sm font-semibold outline-none ring-action focus:ring-2"
                    placeholder="Title"
                  />
                  <textarea
                    required
                    rows={2}
                    value={v.description}
                    onChange={(e) =>
                      updateValue(i, { description: e.target.value })
                    }
                    className="w-full rounded border border-navy/15 bg-white px-2.5 py-1.5 text-sm outline-none ring-action focus:ring-2"
                    placeholder="Description"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeValue(i)}
                  className="rounded p-1 text-red-600 hover:bg-red-50"
                  aria-label="Remove value"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-action" disabled={saving}>
          {saving ? "Saving Live to Cloud…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
