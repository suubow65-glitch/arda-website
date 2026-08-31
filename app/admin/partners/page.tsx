"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { PartnerRow } from "@/lib/types";

const empty = { name: "", initials: "", website_url: "", order_index: 0 };

export default function PartnersAdminPage() {
  const [items, setItems] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Partial<PartnerRow>>(empty);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/partners");
      if (!res.ok) throw new Error("Failed to load partners.");
      const data = (await res.json()) as { partners: PartnerRow[] };
      setItems(data.partners);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startAdd() {
    setEditing({ ...empty });
    if (fileRef.current) fileRef.current.value = "";
    setOpen(true);
  }

  function startEdit(item: PartnerRow) {
    setEditing(item);
    if (fileRef.current) fileRef.current.value = "";
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const fd = new FormData();
    fd.set("name", editing.name ?? "");
    fd.set("initials", editing.initials ?? "");
    fd.set("website_url", editing.website_url ?? "");
    fd.set("order_index", String(editing.order_index ?? 0));
    const file = fileRef.current?.files?.[0];
    if (file) fd.set("logo", file);

    try {
      const url = editing.id
        ? `/api/admin/partners/${editing.id}`
        : "/api/admin/partners";
      const method = editing.id ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setOpen(false);
      setEditing(empty);
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this partner?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl text-navy">Partners</h1>
          <p className="text-sm text-navy/70">Manage donors and partner logos.</p>
        </div>
        <button type="button" onClick={startAdd} className="btn-action">
          <Plus className="h-4 w-4" /> Add partner
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {open && (
        <form
          onSubmit={save}
          className="mt-6 grid gap-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-card sm:grid-cols-2"
        >
          <label className="block text-sm font-semibold sm:col-span-2">
            Partner name
            <input
              required
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Initials
            <input
              required
              value={editing.initials}
              onChange={(e) =>
                setEditing({ ...editing, initials: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Website URL
            <input
              value={editing.website_url ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, website_url: e.target.value })
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
          <label className="block text-sm font-semibold sm:col-span-2">
            Logo
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              required={!editing.id}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm file:mr-3 file:rounded file:border-0 file:bg-action file:px-3 file:py-1 file:text-white"
            />
            {editing.id && (
              <p className="mt-1 text-xs text-navy/60">
                Leave empty to keep the existing logo.
              </p>
            )}
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-action" disabled={saving}>
              {saving ? "Saving…" : editing.id ? "Update partner" : "Create partner"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setEditing(empty); if (fileRef.current) fileRef.current.value = ""; }}
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
                <th className="px-4 py-3 font-semibold">Logo</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Initials</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-navy/10 last:border-0">
                  <td className="px-4 py-3">
                    {item.logo_url ? (
                      <img
                        src={item.logo_url}
                        alt=""
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <span className="text-navy/50">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy">{item.name}</td>
                  <td className="px-4 py-3">{item.initials}</td>
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
