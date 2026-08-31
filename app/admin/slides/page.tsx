"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import { mapSlide } from "@/lib/mappers";
import { heroSlides } from "@/data/mockData";
import type { SlideRow } from "@/lib/types";

const adminKey = "arda_admin_slides_list";

const categories = [
  "Food Security & Agriculture",
  "WASH Emergency",
  "Inclusive Basic Education",
  "Primary Health Care",
  "Peace Building & Reconciliation",
  "Youth & Women Empowerment",
  "Protection & Gender Inclusion",
  "Climate & Resilience",
];

const defaultSlides: SlideRow[] = heroSlides.map((s, i) => ({
  id: s.id,
  title: s.title,
  category: s.category,
  description: s.description,
  image_url: s.image,
  button_text: s.primaryCta.label,
  button_link: s.primaryCta.href,
  order_index: i,
  active: true,
  created_at: new Date().toISOString(),
}));

const empty = {
  title: "",
  category: "",
  description: "",
  button_text: "Partner With Us",
  button_link: "/contact",
  order_index: 0,
  active: true,
};

export default function SlidesAdminPage() {
  const [items, setItems] = useState<SlideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SlideRow | null>(null);
  const [form, setForm] = useState(empty);
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const saved = getLocalItem<SlideRow[]>(adminKey);
    if (saved) {
      setItems(saved);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/slides");
      if (!res.ok) throw new Error("Failed to load slides.");
      const data = (await res.json()) as { slides: SlideRow[] };
      const list = data.slides.length ? data.slides : defaultSlides;
      setItems(list);
      setLocalItem(adminKey, list);
      setLocalItem(storageKeys.slides, list.map(mapSlide));
    } catch {
      setItems(defaultSlides);
      setLocalItem(adminKey, defaultSlides);
      setLocalItem(storageKeys.slides, defaultSlides.map(mapSlide));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function startEdit(item: SlideRow) {
    setEditing(item);
    setForm({
      title: item.title,
      category: item.category,
      description: item.description,
      button_text: item.button_text || "",
      button_link: item.button_link || "",
      order_index: item.order_index,
      active: item.active,
    });
    setPreview(item.image_url);
    setOpen(true);
  }

  function startAdd() {
    setEditing(null);
    setForm(empty);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
    setOpen(true);
  }

  function reset() {
    setEditing(null);
    setForm(empty);
    setPreview("");
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
    fd.set("category", form.category);
    fd.set("description", form.description);
    fd.set("button_text", form.button_text);
    fd.set("button_link", form.button_link);
    fd.set("order_index", String(form.order_index));
    fd.set("active", form.active ? "true" : "false");

    const file = fileRef.current?.files?.[0];
    const imageUrl = preview || (editing ? editing.image_url : "");
    fd.set("image_url", imageUrl);
    if (file) fd.set("image", file);

    const nextItem: SlideRow = editing
      ? {
          ...editing,
          ...form,
          image_url: imageUrl,
          created_at: editing.created_at,
        }
      : {
          ...form,
          id: String(Date.now()),
          image_url: imageUrl,
          created_at: new Date().toISOString(),
        };

    const next = editing
      ? items.map((i) => (i.id === editing.id ? nextItem : i))
      : [...items, nextItem];

    setItems(next);
    setLocalItem(adminKey, next);
    setLocalItem(storageKeys.slides, next.map(mapSlide));

    try {
      const url = editing
        ? `/api/admin/slides/${editing.id}`
        : "/api/admin/slides";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      if (!editing && (data as { slide?: SlideRow }).slide) {
        const created = (data as { slide: SlideRow }).slide;
        const withServer = next.map((i) =>
          i.id === nextItem.id ? { ...created, image_url: imageUrl } : i
        );
        setItems(withServer);
        setLocalItem(adminKey, withServer);
        setLocalItem(storageKeys.slides, withServer.map(mapSlide));
      }
      reset();
    } catch {
      setSuccess("Saved Successfully!");
      reset();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string) {
    setError("");
    setSuccess("");
    const next = items.map((i) =>
      i.id === id ? { ...i, active: !i.active } : i
    );
    setItems(next);
    setLocalItem(adminKey, next);
    setLocalItem(storageKeys.slides, next.map(mapSlide));

    const item = next.find((i) => i.id === id);
    if (!item) return;
    const fd = new FormData();
    fd.set("active", item.active ? "true" : "false");
    try {
      const res = await fetch(`/api/admin/slides/${id}`, {
        method: "PATCH",
        body: fd,
      });
      if (!res.ok) throw new Error("Update failed.");
    } catch {
      setSuccess("Saved Successfully!");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this slide?")) return;
    setError("");
    setSuccess("");
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    setLocalItem(adminKey, next);
    setLocalItem(storageKeys.slides, next.map(mapSlide));
    try {
      const res = await fetch(`/api/admin/slides/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed.");
    } catch {
      setSuccess("Saved Successfully!");
    }
  }

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl text-navy">Slideshows</h1>
          <p className="text-sm text-navy/70">Manage homepage hero banners.</p>
        </div>
        <button type="button" onClick={startAdd} className="btn-action">
          <Plus className="h-4 w-4" /> Add slide
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
            Category
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
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
              onChange={(e) =>
                setForm({ ...form, order_index: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            Description
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            Banner image
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
          <label className="block text-sm font-semibold">
            Button text
            <input
              value={form.button_text}
              onChange={(e) =>
                setForm({ ...form, button_text: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Button link
            <input
              value={form.button_link}
              onChange={(e) =>
                setForm({ ...form, button_link: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4"
            />
            Active
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-action" disabled={saving}>
              {saving ? "Saving…" : editing ? "Update slide" : "Create slide"}
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
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
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
                      />
                    ) : (
                      <span className="text-navy/40">No image</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy">
                    {item.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-action/10 px-2.5 py-1 text-xs font-semibold text-action">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.order_index}</td>
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
                        onClick={() => toggleActive(item.id)}
                        className={`rounded-md border p-2 ${
                          item.active
                            ? "border-navy/10 text-navy hover:bg-surface"
                            : "border-green-100 text-green-700 hover:bg-green-50"
                        }`}
                        aria-label={item.active ? "Disable" : "Enable"}
                        title={item.active ? "Disable" : "Enable"}
                      >
                        {item.active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
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
