"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { getLocalItem, storageKeys } from "@/lib/storage";
import { compressHeroBanner } from "@/lib/imageCompressor";
import { heroSlides } from "@/data/mockData";
import { getBrowserSupabase, uploadDirectFile } from "@/lib/supabaseBrowser";
import type { SlideRow } from "@/lib/types";

const adminKey = "arda_admin_slides_list";
const overrideKey = "arda_slides_override";
const customKey = "arda_user_custom_slides_v1";

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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function persistSlides(rows: SlideRow[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    customKey,
    JSON.stringify({ userModified: true, slides: rows })
  );
  localStorage.setItem(adminKey, JSON.stringify(rows));
  localStorage.setItem(overrideKey, JSON.stringify(rows));
  localStorage.setItem(storageKeys.slides, JSON.stringify(rows));
  window.dispatchEvent(new Event("arda-slides-updated"));
}

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
  const compressedFileRef = useRef<File | null>(null);

  async function load() {
    setLoading(true);
    const supabase = getBrowserSupabase();
    if (supabase) {
      try {
        const { data, error: qErr } = await supabase
          .from("slides")
          .select("*")
          .order("order_index", { ascending: true });
        if (!qErr && data && data.length > 0) {
          setItems(data as SlideRow[]);
          persistSlides(data as SlideRow[]);
          setLoading(false);
          return;
        }
      } catch {
        // fallback
      }
    }

    try {
      const res = await fetch("/api/admin/slides", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { slides: SlideRow[] };
        const list = data.slides?.length ? data.slides : defaultSlides;
        setItems(list);
        persistSlides(list);
        setLoading(false);
        return;
      }
    } catch {
      // fallback
    }

    const custom = getLocalItem<{ userModified: boolean; slides: SlideRow[] }>(customKey);
    if (custom?.userModified && custom.slides?.length) {
      setItems(custom.slides);
      persistSlides(custom.slides);
      setLoading(false);
      return;
    }
    const saved = getLocalItem<SlideRow[]>(adminKey);
    if (saved) {
      setItems(saved);
      persistSlides(saved);
      setLoading(false);
      return;
    }

    setItems(defaultSlides);
    persistSlides(defaultSlides);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressHeroBanner(file);
    compressedFileRef.current = compressed;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(compressed);
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
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const file = compressedFileRef.current || fileRef.current?.files?.[0];
    const supabase = getBrowserSupabase();

    try {
      let imageUrl = preview || (editing ? editing.image_url : "");

      // 1) Direct Supabase Cloud write if configured
      if (supabase) {
        if (file) {
          try {
            imageUrl = await uploadDirectFile(supabase, "slide-images", file);
          } catch (storageErr) {
            console.warn("Storage upload failed, attempting fallback:", storageErr);
          }
        }

        if (!imageUrl) {
          throw new Error("A banner image is required.");
        }

        const payload = {
          title: form.title,
          category: form.category,
          description: form.description,
          button_text: form.button_text || null,
          button_link: form.button_link || null,
          order_index: Number(form.order_index),
          active: Boolean(form.active),
          image_url: imageUrl,
        };

        let resultRow: SlideRow | null = null;
        if (editing && isUuid(editing.id)) {
          const { data, error: updateError } = await supabase
            .from("slides")
            .update(payload)
            .eq("id", editing.id)
            .select("*")
            .single();
          if (updateError) throw new Error(updateError.message);
          resultRow = data as SlideRow;
        } else {
          const { data, error: insertError } = await supabase
            .from("slides")
            .insert(payload)
            .select("*")
            .single();
          if (insertError) throw new Error(insertError.message);
          resultRow = data as SlideRow;
        }

        if (resultRow) {
          const synced = editing
            ? items.map((i) => (i.id === editing.id ? resultRow! : i))
            : [...items, resultRow];
          setItems(synced);
          persistSlides(synced);
        }

        setSuccess("Saved Live to Supabase Cloud!");
        reset();
        return;
      }

      // 2) Serverless fallback
      const fd = new FormData();
      fd.set("title", form.title);
      fd.set("category", form.category);
      fd.set("description", form.description);
      fd.set("button_text", form.button_text);
      fd.set("button_link", form.button_link);
      fd.set("order_index", String(form.order_index));
      fd.set("active", form.active ? "true" : "false");
      fd.set("image_url", imageUrl);
      if (file) fd.set("image", file);

      const isEditingCloud = editing && isUuid(editing.id);
      const url = isEditingCloud ? `/api/admin/slides/${editing.id}` : "/api/admin/slides";
      const method = isEditingCloud ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = (await res.json()) as { error?: string; slide?: SlideRow };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      if (data.slide) {
        const synced = editing
          ? items.map((i) => (i.id === editing.id ? data.slide! : i))
          : [...items, data.slide];
        setItems(synced);
        persistSlides(synced);
      }
      setSuccess("Saved Live to Supabase Cloud!");
      reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cloud write failed.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string) {
    setError("");
    setSuccess("");
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newActive = !item.active;
    const next = items.map((i) => (i.id === id ? { ...i, active: newActive } : i));
    setItems(next);
    persistSlides(next);

    const supabase = getBrowserSupabase();
    if (supabase && isUuid(id)) {
      try {
        const { error: updErr } = await supabase
          .from("slides")
          .update({ active: newActive })
          .eq("id", id);
        if (updErr) throw new Error(updErr.message);
        setSuccess("Saved Live to Supabase Cloud!");
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Update failed.";
        setError(msg);
        return;
      }
    }

    const fd = new FormData();
    fd.set("active", newActive ? "true" : "false");
    try {
      const res = await fetch(`/api/admin/slides/${id}`, { method: "PATCH", body: fd });
      if (!res.ok) throw new Error("Update failed.");
      setSuccess("Saved Live to Supabase Cloud!");
    } catch {
      setSuccess("Updated locally.");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this slide?")) return;
    setError("");
    setSuccess("");

    const supabase = getBrowserSupabase();
    if (supabase && isUuid(id)) {
      try {
        const { error: delErr } = await supabase.from("slides").delete().eq("id", id);
        if (delErr) throw new Error(delErr.message);
        const next = items.filter((i) => i.id !== id);
        setItems(next);
        persistSlides(next);
        setSuccess("Saved Live to Supabase Cloud! (Deleted)");
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Delete failed.";
        setError(msg);
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/slides/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      const next = items.filter((i) => i.id !== id);
      setItems(next);
      persistSlides(next);
      setSuccess("Saved Live to Supabase Cloud! (Deleted)");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed.";
      setError(msg);
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
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-sm">
          ⚠️ Cloud error: {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700 shadow-sm">
          ✓ {success}
        </div>
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
              required={!editing && !preview}
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
              {saving ? "Saving Live to Cloud…" : editing ? "Update slide" : "Create slide"}
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
