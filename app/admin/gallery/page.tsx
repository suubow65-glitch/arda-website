"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Image, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import { compressImageFile } from "@/lib/imageCompressor";
import type { GalleryPhotoRow } from "@/lib/types";

const categoryOptions = ["WASH", "Health", "Nutrition", "Education", "Protection", "Agriculture", "Peace", "Climate", "General"];

const empty = {
  title: "",
  location: "",
  category: "",
  date: "",
  featured: false,
};

export default function GalleryAdminPage() {
  const [items, setItems] = useState<GalleryPhotoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryPhotoRow | null>(null);
  const [form, setForm] = useState(empty);
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const compressedFileRef = useRef<File | null>(null);

  async function load() {
    setLoading(true);
    const cached = getLocalItem<GalleryPhotoRow[]>(storageKeys.galleryPhotos);
    try {
      const res = await fetch("/api/admin/gallery");
      if (res.ok) {
        const data = (await res.json()) as { photos?: GalleryPhotoRow[] };
        const list = data.photos || [];
        setItems(list);
        setLocalItem(storageKeys.galleryPhotos, list);
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    compressedFileRef.current = compressed;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(compressed);
  }

  function startAdd() {
    setEditing(null);
    setForm(empty);
    setPreview("");
    compressedFileRef.current = null;
    if (fileRef.current) fileRef.current.value = "";
    setOpen(true);
  }

  function startEdit(item: GalleryPhotoRow) {
    setEditing(item);
    setForm({
      title: item.title,
      location: item.location || "",
      category: item.category || "",
      date: item.date || "",
      featured: item.featured,
    });
    setPreview(item.image_url);
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

  function persist(list: GalleryPhotoRow[]) {
    setItems(list);
    setLocalItem(storageKeys.galleryPhotos, list);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("arda-gallery-updated"));
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const file = compressedFileRef.current || fileRef.current?.files?.[0];
    const imageUrl = preview || (editing ? editing.image_url : "");
    if (!imageUrl) {
      setError("Please upload or provide an image.");
      setSaving(false);
      return;
    }

    const nextItem: GalleryPhotoRow = editing
      ? { ...editing, ...form, image_url: imageUrl }
      : {
          ...empty,
          ...form,
          id: String(Date.now()),
          image_url: imageUrl,
          created_at: new Date().toISOString(),
        };

    const next = editing
      ? items.map((i) => (i.id === editing.id ? nextItem : i))
      : [nextItem, ...items];
    persist(next);

    const fd = new FormData();
    fd.set("title", form.title);
    fd.set("location", form.location);
    fd.set("category", form.category);
    fd.set("date", form.date);
    fd.set("featured", form.featured ? "true" : "false");
    fd.set("image_url", imageUrl);
    if (file) fd.set("image", file);

    try {
      const url = editing ? `/api/admin/gallery/${editing.id}` : "/api/admin/gallery";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = (await res.json()) as { error?: string; photo?: GalleryPhotoRow };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      if (data.photo) {
        const synced = editing
          ? items.map((i) => (i.id === editing.id ? data.photo! : i))
          : [data.photo!, ...items];
        persist(synced);
      }
      setSuccess("Saved Successfully!");
      reset();
    } catch {
      setSuccess("Saved Successfully! (stored locally, cloud unavailable)");
      reset();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this photo?")) return;
    const next = items.filter((i) => i.id !== id);
    persist(next);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
    } catch {
      setSuccess("Removed locally.");
    }
  }

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Image className="h-6 w-6 text-action" />
          <div>
            <h1 className="font-display text-2xl text-navy">Photo Gallery</h1>
            <p className="text-sm text-navy/70">Upload and caption ARDA field photos from Somalia.</p>
          </div>
        </div>
        <button type="button" onClick={startAdd} className="btn-action">
          <Plus className="h-4 w-4" /> Add photo
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
          <label className="block text-sm font-semibold">
            Title / Caption
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-semibold">
              Location
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Baidoa, Somalia"
                className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Category / Sector
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
              >
                <option value="">Select category</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
              />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Photo
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
                className="mt-3 h-40 w-full rounded-md object-cover"
              />
            )}
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="h-4 w-4"
            />
            Featured on homepage
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-action" disabled={saving}>
              {saving ? "Saving…" : editing ? "Update photo" : "Create photo"}
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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card"
            >
              <div className="relative h-40 bg-surface">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-navy/30">
                    <Image className="h-10 w-10" />
                  </div>
                )}
                {item.featured && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-action px-2 py-1 text-xs font-semibold text-white">
                    <Star className="h-3 w-3" /> Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg text-navy">{item.title}</h3>
                <p className="text-sm text-navy/70">
                  {[item.category, item.location, item.date].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-3 flex justify-end gap-2">
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
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
