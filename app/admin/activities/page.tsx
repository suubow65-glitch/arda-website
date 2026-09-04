"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  SECTORS,
  LOCATIONS,
  ACTIVITY_STATUSES,
  ACTIVITY_FALLBACK_IMAGE,
} from "@/lib/constants";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import { mapActivity, slugify } from "@/lib/mappers";
import { compressImageFile } from "@/lib/imageCompressor";
import { activities as mockActivities } from "@/data/mockData";
import type { ActivityRow } from "@/lib/types";

const adminKey = "arda_admin_activities_list";
const customKey = "arda_user_custom_activities_v1";

const empty = {
  title: "",
  sector: "",
  location: "",
  date: "",
  description: "",
  content: "",
  status: "Ongoing" as const,
};

const defaultActivities: ActivityRow[] = mockActivities.map((a) => ({
  id: a.id,
  title: a.title,
  slug: a.slug,
  sector: a.sector,
  location: a.location,
  date: a.date,
  image_url: a.image,
  description: a.summary,
  content: a.description,
  status: a.status,
  created_at: new Date().toISOString(),
}));

function sortByDateDesc(rows: ActivityRow[]): ActivityRow[] {
  return [...rows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function persistActivities(rows: ActivityRow[]) {
  const ordered = sortByDateDesc(rows);
  if (typeof window !== "undefined") {
    localStorage.setItem(
      customKey,
      JSON.stringify({ userModified: true, activities: ordered })
    );
    localStorage.setItem(adminKey, JSON.stringify(ordered));
  }
  setLocalItem(storageKeys.activities, ordered.map(mapActivity));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("arda-activities-updated"));
  }
}

export default function ActivitiesAdminPage() {
  const [items, setItems] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityRow | null>(null);
  const [form, setForm] = useState(empty);
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const compressedFileRef = useRef<File | null>(null);

  const displayed = useMemo(() => sortByDateDesc(items), [items]);

  async function load() {
    setLoading(true);
    const custom = getLocalItem<{
      userModified: boolean;
      activities: ActivityRow[];
    }>(customKey);
    if (custom?.userModified && custom.activities?.length) {
      setItems(custom.activities);
      persistActivities(custom.activities);
      setLoading(false);
      return;
    }
    const saved = getLocalItem<ActivityRow[]>(adminKey);
    if (saved) {
      setItems(saved);
      persistActivities(saved);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/activities");
      if (!res.ok) throw new Error("Failed to load activities.");
      const data = (await res.json()) as { activities: ActivityRow[] };
      const list = data.activities.length ? data.activities : defaultActivities;
      setItems(list);
      persistActivities(list);
    } catch {
      setItems(defaultActivities);
      persistActivities(defaultActivities);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    compressedFileRef.current = compressed;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(compressed);
  }

  function startEdit(item: ActivityRow) {
    setEditing(item);
    setForm({
      title: item.title,
      sector: item.sector,
      location: item.location,
      date: item.date,
      description: item.description,
      content: item.content || "",
      status: (item.status === "Completed" ? "Completed" : "Ongoing") as typeof empty.status,
    });
    setPreview(item.image_url);
    compressedFileRef.current = null;
    setOpen(true);
  }

  function startAdd() {
    setEditing(null);
    setForm(empty);
    setPreview("");
    compressedFileRef.current = null;
    if (fileRef.current) fileRef.current.value = "";
    setOpen(true);
  }

  function reset() {
    setEditing(null);
    setForm(empty);
    setPreview("");
    compressedFileRef.current = null;
    if (fileRef.current) fileRef.current.value = "";
    setOpen(false);
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const fd = new FormData();
    fd.set("title", form.title);
    fd.set("sector", form.sector);
    fd.set("location", form.location);
    fd.set("date", form.date);
    fd.set("description", form.description);
    fd.set("content", form.content || form.description);
    fd.set("status", form.status);

    const file = compressedFileRef.current || fileRef.current?.files?.[0];
    const imageUrl = preview || (editing ? editing.image_url : "");
    if (file) fd.set("image", file);
    if (editing && !file) fd.set("image_url", imageUrl);

    const nextItem: ActivityRow = editing
      ? {
          ...editing,
          ...form,
          image_url: imageUrl,
          slug: slugify(form.title),
          status: form.status,
          created_at: editing.created_at,
        }
      : {
          ...form,
          id: String(Date.now()),
          slug: slugify(form.title),
          image_url: imageUrl,
          created_at: new Date().toISOString(),
        };

    const next = editing
      ? items.map((i) => (i.id === editing.id ? nextItem : i))
      : [nextItem, ...items];

    const ordered = sortByDateDesc(next);
    setItems(ordered);
    persistActivities(ordered);

    try {
      const url = editing
        ? `/api/admin/activities/${editing.id}`
        : "/api/admin/activities";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      await load();
      reset();
      setSuccess("Saved Successfully!");
    } catch {
      setSuccess("Saved Successfully!");
      reset();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this activity?")) return;
    setError("");
    setSuccess("");
    const next = items.filter((i) => i.id !== id);
    const ordered = sortByDateDesc(next);
    setItems(ordered);
    persistActivities(ordered);
    try {
      const res = await fetch(`/api/admin/activities/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      await load();
    } catch {
      setSuccess("Saved Successfully!");
    }
  }

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl text-navy">Activities</h1>
          <p className="text-sm text-navy/70">
            Manage field programmes and project pages.
          </p>
        </div>
        <button type="button" onClick={startAdd} className="btn-action">
          <Plus className="h-4 w-4" /> Add activity
        </button>
      </div>

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

      {open && (
        <form
          onSubmit={save}
          className="mt-6 grid gap-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-card sm:grid-cols-2"
        >
          <label className="block text-sm font-semibold sm:col-span-2">
            Title
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Sector
            <select
              required
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            >
              <option value="">Select a sector</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Location
            <select
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            >
              <option value="">Select a location</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Date
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Status
            <select
              required
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as typeof empty.status })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            >
              {ACTIVITY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            Project image
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required={!editing}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm file:mr-3 file:rounded file:border-0 file:bg-action file:px-3 file:py-1 file:text-white"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 h-32 w-full rounded-md object-cover"
              />
            )}
            {editing && !preview && (
              <p className="mt-1 text-xs text-navy/60">
                Leave empty to keep the existing image.
              </p>
            )}
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            Summary
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            Full content
            <textarea
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-action" disabled={saving}>
              {saving ? "Saving…" : editing ? "Update activity" : "Create activity"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-navy/15 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-surface"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-action" />
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Image</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Sector</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-navy/10 last:border-0"
                >
                  <td className="px-4 py-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-12 w-20 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.src = ACTIVITY_FALLBACK_IMAGE;
                        }}
                      />
                    ) : (
                      <span className="text-navy/50">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy">
                    {item.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-relief/10 px-2.5 py-1 text-xs font-semibold text-relief">
                      {item.sector}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-navy/10 px-2.5 py-1 text-xs font-semibold text-navy">
                      {item.location}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(item.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        item.status === "Ongoing"
                          ? "bg-relief-100 text-relief-700"
                          : "bg-surface text-navy/60"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="rounded-md border border-navy/10 p-2 text-navy hover:bg-surface"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="rounded-md border border-red-100 p-2 text-red-700 hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
