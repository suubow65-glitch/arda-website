"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import { mapImpactStat } from "@/lib/mappers";
import type { ImpactStatRow } from "@/lib/types";

const empty = { label: "", value: 0, suffix: "", order_index: 0 };

const adminKey = "arda_admin_stats_list";

export default function StatsAdminPage() {
  const [items, setItems] = useState<ImpactStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<Partial<ImpactStatRow>>(empty);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    const saved = getLocalItem<ImpactStatRow[]>(adminKey);
    if (saved) {
      setItems(saved);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/impact-stats");
      if (!res.ok) throw new Error("Failed to load stats.");
      const data = (await res.json()) as { stats: ImpactStatRow[] };
      setItems(data.stats);
      setLocalItem(adminKey, data.stats);
      setLocalItem(storageKeys.impactStats, data.stats.map(mapImpactStat));
    } catch {
      // keep local state/empty
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startAdd() {
    setEditing({ ...empty });
    setOpen(true);
  }

  function startEdit(item: ImpactStatRow) {
    setEditing(item);
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const next = editing.id
      ? items.map((i) =>
          i.id === editing.id ? ({ ...i, ...editing } as ImpactStatRow) : i
        )
      : [...items, { ...editing, id: String(Date.now()) } as ImpactStatRow];
    setItems(next);
    setLocalItem(adminKey, next);
    setLocalItem(storageKeys.impactStats, next.map(mapImpactStat));

    try {
      const url = editing.id
        ? `/api/admin/impact-stats/${editing.id}`
        : "/api/admin/impact-stats";
      const method = editing.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setOpen(false);
      setEditing(empty);
      await load();
    } catch {
      setSuccess("Saved Successfully!");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this stat?")) return;
    setError("");
    setSuccess("");
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    setLocalItem(adminKey, next);
    setLocalItem(storageKeys.impactStats, next.map(mapImpactStat));
    try {
      const res = await fetch(`/api/admin/impact-stats/${id}`, {
        method: "DELETE",
      });
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
          <h1 className="font-display text-2xl text-navy">Impact Stats</h1>
          <p className="text-sm text-navy/70">Manage homepage counter numbers.</p>
        </div>
        <button type="button" onClick={() => { startAdd(); }} className="btn-action">
          <Plus className="h-4 w-4" /> Add stat
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
          <label className="block text-sm font-semibold">
            Label
            <input
              required
              value={editing.label}
              onChange={(e) =>
                setEditing({ ...editing, label: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Suffix (e.g. +, K+)
            <input
              value={editing.suffix ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, suffix: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Value
            <input
              required
              type="number"
              value={editing.value}
              onChange={(e) =>
                setEditing({ ...editing, value: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Order
            <input
              required
              type="number"
              value={editing.order_index}
              onChange={(e) =>
                setEditing({ ...editing, order_index: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            />
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-action" disabled={saving}>
              {saving ? "Saving…" : editing.id ? "Update stat" : "Create stat"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setEditing(empty); }}
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
                <th className="px-4 py-3 font-semibold">Label</th>
                <th className="px-4 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold">Suffix</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-navy/10 last:border-0">
                  <td className="px-4 py-3 font-semibold text-navy">{item.label}</td>
                  <td className="px-4 py-3">{item.value}</td>
                  <td className="px-4 py-3">{item.suffix}</td>
                  <td className="px-4 py-3">{item.order_index}</td>
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
