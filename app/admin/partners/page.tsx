"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import { mapPartner } from "@/lib/mappers";
import { partners as mockPartners } from "@/data/mockData";
import type { PartnerRow } from "@/lib/types";

const empty = { name: "", initials: "", website_url: "", order_index: 0 };

const adminKey = "arda_admin_partners_list";
const customKey = "arda_user_custom_partners_v1";

const defaultPartners: PartnerRow[] = mockPartners.map((p, i) => ({
  id: p.name,
  name: p.name,
  initials: p.initials,
  logo_url: p.logoUrl || null,
  website_url: p.websiteUrl || null,
  order_index: i,
  created_at: new Date().toISOString(),
}));

function persistAll(rows: PartnerRow[]) {
  if (typeof window === "undefined") return;
  setLocalItem(adminKey, rows);
  setLocalItem(customKey, { userModified: true, partners: rows });
  setLocalItem(storageKeys.partners, rows.map(mapPartner));
  window.dispatchEvent(new Event("arda-partners-updated"));
}

export default function PartnersAdminPage() {
  const [items, setItems] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<Partial<PartnerRow>>(empty);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/partners");
      if (res.ok) {
        const data = (await res.json()) as { partners: PartnerRow[] };
        const list = data.partners.length ? data.partners : getLocalItem<PartnerRow[]>(adminKey) || defaultPartners;
        setItems(list);
        persistAll(list);
        setLoading(false);
        return;
      }
    } catch {
      // ignore
    }
    const saved =
      getLocalItem<PartnerRow[]>(adminKey) ||
      (getLocalItem<{ userModified: boolean; partners: PartnerRow[] }>(customKey)?.partners) ||
      defaultPartners;
    setItems(saved);
    persistAll(saved);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startAdd() {
    setEditing({ ...empty });
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
    setOpen(true);
  }

  function startEdit(item: PartnerRow) {
    setEditing(item);
    setPreview(item.logo_url || "");
    if (fileRef.current) fileRef.current.value = "";
    setOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const fd = new FormData();
    fd.set("name", editing.name ?? "");
    fd.set("initials", editing.initials ?? "");
    fd.set("website_url", editing.website_url ?? "");
    fd.set("order_index", String(editing.order_index ?? 0));
    const file = fileRef.current?.files?.[0];
    if (file) fd.set("logo", file);

    // Use the Base64 preview (or existing logo) as the immediate local logo URL
    const logoUrl = preview || (editing.id ? editing.logo_url || "" : "");

    const tempId = editing.id || String(Date.now());
    const nextItem: PartnerRow = editing.id
      ? ({ ...(items.find((i) => i.id === editing.id) as PartnerRow), ...editing, logo_url: logoUrl } as PartnerRow)
      : ({ ...empty, ...editing, id: tempId, logo_url: logoUrl, created_at: new Date().toISOString() } as PartnerRow);

    const next = editing.id
      ? items.map((i) => (i.id === editing.id ? nextItem : i))
      : [...items, nextItem];
    setItems(next);
    persistAll(next);

    try {
      const url = editing.id ? `/api/admin/partners/${editing.id}` : "/api/admin/partners";
      const method = editing.id ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = (await res.json()) as { error?: string; partner?: PartnerRow };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      if (data.partner) {
        // Prefer the cloud-uploaded URL, but keep our local logo if the cloud omitted it
        const serverPartner: PartnerRow = {
          ...data.partner,
          logo_url: data.partner.logo_url || logoUrl,
        };
        const synced = editing.id
          ? items.map((i) => (i.id === editing.id ? serverPartner : i))
          : [...items, serverPartner];
        setItems(synced);
        persistAll(synced);
      }
      setOpen(false);
      setEditing(empty);
      setPreview("");
      if (fileRef.current) fileRef.current.value = "";
      setSuccess("Partner Saved Successfully!");
    } catch {
      setOpen(false);
      setEditing(empty);
      setPreview("");
      if (fileRef.current) fileRef.current.value = "";
      setSuccess("Partner Saved Successfully! (stored locally, cloud unavailable)");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this partner?")) return;
    setError("");
    setSuccess("");
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    persistAll(next);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      setSuccess("Deleted successfully!");
    } catch {
      setSuccess("Removed locally.");
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
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
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
              onChange={handleFileChange}
              required={!editing.id}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm file:mr-3 file:rounded file:border-0 file:bg-action file:px-3 file:py-1 file:text-white"
            />
            {preview && (
              <img
                src={preview}
                alt="Logo preview"
                className="mt-3 h-16 w-auto max-w-[200px] rounded-md border border-navy/10 bg-white object-contain p-2"
              />
            )}
            {editing.id && !preview && (
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
              onClick={() => { setOpen(false); setEditing(empty); setPreview(""); if (fileRef.current) fileRef.current.value = ""; }}
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
