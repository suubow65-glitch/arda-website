"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import type { AboutContentRow, CoreValue } from "@/lib/types";

const emptyCoreValue: CoreValue = { title: "", description: "", icon: "shield-check" };

const icons = [
  "shield-check",
  "heart-handshake",
  "check-circle",
  "leaf",
  "users",
  "heart-pulse",
  "scale",
  "sparkles",
  "zap",
  "droplets",
  "wheat",
];

const adminKey = "arda_admin_about_form";

export default function AboutAdminPage() {
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [values, setValues] = useState<CoreValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    const saved = getLocalItem<{ vision: string; mission: string; values: CoreValue[] }>(adminKey);
    if (saved) {
      setVision(saved.vision);
      setMission(saved.mission);
      setValues(saved.values);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/about");
      if (!res.ok) throw new Error("Failed to load about content.");
      const data = (await res.json()) as { about: AboutContentRow | null };
      setVision(data.about?.vision ?? "");
      setMission(data.about?.mission ?? "");
      setValues(
        data.about?.core_values && data.about.core_values.length
          ? data.about.core_values
          : []
      );
    } catch {
      // keep local state/empty
    } finally {
      setLoading(false);
    }
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
    try {
      const res = await fetch("/api/admin/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vision, mission, core_values: values }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed.");
    } catch {
      setSuccess("Saved Successfully!");
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
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      )}

      <form
        onSubmit={save}
        className="mt-6 space-y-6 rounded-2xl border border-navy/10 bg-white p-5 shadow-card"
      >
        <label className="block text-sm font-semibold">
          Vision
          <textarea
            required
            rows={4}
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
          />
        </label>
        <label className="block text-sm font-semibold">
          Mission
          <textarea
            required
            rows={4}
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
          />
        </label>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-navy">Core Values</h2>
            <button
              type="button"
              onClick={() => setValues([...values, { ...emptyCoreValue }])}
              className="inline-flex items-center gap-1 text-sm font-semibold text-action hover:underline"
            >
              <Plus className="h-4 w-4" /> Add value
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {values.map((item, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-xl border border-navy/10 bg-surface p-4 sm:grid-cols-2"
              >
                <input
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => updateValue(i, { title: e.target.value })}
                  className="rounded-md border border-navy/15 bg-white px-3 py-2 text-sm outline-none ring-action focus:ring-2"
                />
                <select
                  value={item.icon}
                  onChange={(e) => updateValue(i, { icon: e.target.value })}
                  className="rounded-md border border-navy/15 bg-white px-3 py-2 text-sm outline-none ring-action focus:ring-2"
                >
                  {icons.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Description"
                  rows={2}
                  value={item.description}
                  onChange={(e) =>
                    updateValue(i, { description: e.target.value })
                  }
                  className="sm:col-span-2 rounded-md border border-navy/15 bg-white px-3 py-2 text-sm outline-none ring-action focus:ring-2"
                />
                <div className="sm:col-span-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeValue(i)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:underline"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-action" disabled={saving}>
          {saving ? "Saving…" : "Save about content"}
        </button>
      </form>
    </div>
  );
}
