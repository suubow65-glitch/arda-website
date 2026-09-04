"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Target } from "lucide-react";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import type { PillarRow } from "@/lib/types";

const iconOptions = [
  "peace",
  "youth",
  "food",
  "agriculture",
  "education",
  "health",
  "nutrition",
  "wash",
  "protection",
  "gender",
  "climate",
  "environment",
  "globe",
];

const empty = {
  title: "",
  category_slug: "",
  icon_name: "globe",
  short_desc: "",
  full_content: "",
  interventions: "",
  order_index: 0,
  active: true,
};

export default function PillarsAdminPage() {
  const [items, setItems] = useState<PillarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PillarRow | null>(null);
  const [form, setForm] = useState(empty);

  async function load() {
    setLoading(true);
    const cached = getLocalItem<PillarRow[]>(storageKeys.pillars);
    try {
      const res = await fetch("/api/admin/pillars");
      if (res.ok) {
        const data = (await res.json()) as { pillars?: PillarRow[] };
        const list = data.pillars || [];
        setItems(list);
        setLocalItem(storageKeys.pillars, list);
        setLoading(false);
        return;
      }
    } catch {
      // ignore
    }
    if (cached) setItems(cached);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startAdd() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function startEdit(item: PillarRow) {
    setEditing(item);
    setForm({
      title: item.title,
      category_slug: item.category_slug,
      icon_name: item.icon_name,
      short_desc: item.short_desc,
      full_content: item.full_content,
      interventions: (item.interventions || []).join("\n"),
      order_index: item.order_index,
      active: item.active,
    });
    setOpen(true);
  }

  function reset() {
    setEditing(null);
    setForm(empty);
    setOpen(false);
    setError("");
  }

  function persist(list: PillarRow[]) {
    setItems(list);
    setLocalItem(storageKeys.pillars, list);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const interventions = form.interventions
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);

    const nextItem: PillarRow = editing
      ? { ...editing, ...form, interventions }
      : {
          ...empty,
          ...form,
          interventions,
          id: String(Date.now()),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

    const next = editing
      ? items.map((i) => (i.id === editing.id ? nextItem : i))
      : [...items, nextItem];
    persist(next);

    const fd = new FormData();
    fd.set("title", form.title);
    fd.set("category_slug", form.category_slug);
    fd.set("icon_name", form.icon_name);
    fd.set("short_desc", form.short_desc);
    fd.set("full_content", form.full_content);
    fd.set("interventions", form.interventions);
    fd.set("order_index", String(form.order_index));
    fd.set("active", form.active ? "true" : "false");

    try {
      const url = editing ? `/api/admin/pillars/${editing.id}` : "/api/admin/pillars";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = (await res.json()) as { error?: string; pillar?: PillarRow };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      if (data.pillar) {
        const synced = editing
          ? items.map((i) => (i.id === editing.id ? data.pillar! : i))
          : [...items, data.pillar!];
        persist(synced);
      }
      setSuccess("Pillar saved!");
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Saved locally (cloud unavailable).";
      setSuccess(message);
      reset();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this pillar?")) return;
    const next = items.filter((i) => i.id !== id);
    persist(next);
    try {
      const res = await fetch(`/api/admin/pillars/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
    } catch {
      setSuccess("Removed locally.");
    }
  }

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-action" />
          <div>
            <h1 className="font-display text-2xl text-navy">Focus Pillars</h1>
            <p className="text-sm text-navy/70">Manage the eight programmatic thematic pillars.</p>
          </div>
        </div>
        <button type="button" onClick={startAdd} className="btn-action">
          <Plus className="h-4 w-4" /> Add pillar
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
      )}

      {open && (
        <form
          onSubmit={save}
          className="mt-6 grid gap-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-card"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Title
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Slug / Category key
              <input
                required
                value={form.category_slug}
                onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
                className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Icon name
              <select
                value={form.icon_name}
                onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
                className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
              >
                {iconOptions.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Order
              <input
                required
                type="number"
                value={form.order_index}
                onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
              />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Short description
            <textarea
              required
              rows={2}
              value={form.short_desc}
              onChange={(e) => setForm({ ...form, short_desc: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Full content
            <textarea
              required
              rows={5}
              value={form.full_content}
              onChange={(e) => setForm({ ...form, full_content: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Key sub-interventions (one per line)
            <textarea
              rows={4}
              value={form.interventions}
              onChange={(e) => setForm({ ...form, interventions: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4"
            />
            Active
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-action" disabled={saving}>
              {saving ? "Saving…" : editing ? "Update pillar" : "Create pillar"}
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
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Icon</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...items].sort((a, b) => a.order_index - b.order_index).map((item) => (
                <tr key={item.id} className="border-b border-navy/10 last:border-0">
                  <td className="px-4 py-3">{item.order_index}</td>
                  <td className="px-4 py-3 font-semibold text-navy">{item.title}</td>
                  <td className="px-4 py-3">{item.category_slug}</td>
                  <td className="px-4 py-3">{item.icon_name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        item.active
                          ? "bg-green-100 text-green-700"
                          : "bg-surface text-navy/60"
                      }`}
                    >
                      {item.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="rounded-md border border-navy/10 p-2 text-navy hover:bg-surface"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="rounded-md border border-red-100 p-2 text-red-700 hover:bg-red-50"
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
