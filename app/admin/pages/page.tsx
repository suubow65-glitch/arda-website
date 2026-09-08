"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Type } from "lucide-react";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import type { PageHeaderRow } from "@/lib/types";

const pageOptions = ["home", "about", "activities", "documents", "careers", "contact", "focus-areas"];

const sectionOptions: Record<string, string[]> = {
  home: ["hero", "stats", "activities", "pillars", "partners"],
  about: ["hero", "values", "pillars", "leadership", "board", "volunteers"],
  activities: ["hero"],
  documents: ["hero"],
  careers: ["hero"],
  contact: ["hero"],
  "focus-areas": ["hero"],
};

const empty = {
  page_key: "",
  section_key: "",
  title: "",
  subtitle: "",
  description: "",
};

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export default function PageHeadersAdminPage() {
  const [items, setItems] = useState<PageHeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PageHeaderRow | null>(null);
  const [form, setForm] = useState(empty);

  async function load() {
    setLoading(true);
    const supabase = getBrowserSupabase();
    if (supabase) {
      try {
        const { data, error: qErr } = await supabase
          .from("page_headers")
          .select("*")
          .order("page_key", { ascending: true });
        if (!qErr && data && data.length > 0) {
          setItems(data as PageHeaderRow[]);
          setLocalItem(storageKeys.pageHeaders, data);
          setLoading(false);
          return;
        }
      } catch {
        // fallback
      }
    }

    try {
      const res = await fetch("/api/admin/pages", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { headers?: PageHeaderRow[] };
        const list = data.headers || [];
        setItems(list);
        setLocalItem(storageKeys.pageHeaders, list);
        setLoading(false);
        return;
      }
    } catch {
      // ignore
    }

    const cached = getLocalItem<PageHeaderRow[]>(storageKeys.pageHeaders);
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

  function startEdit(item: PageHeaderRow) {
    setEditing(item);
    setForm({
      page_key: item.page_key,
      section_key: item.section_key,
      title: item.title,
      subtitle: item.subtitle || "",
      description: item.description || "",
    });
    setOpen(true);
  }

  function reset() {
    setEditing(null);
    setForm(empty);
    setOpen(false);
    setError("");
  }

  function persist(list: PageHeaderRow[]) {
    setItems(list);
    setLocalItem(storageKeys.pageHeaders, list);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const supabase = getBrowserSupabase();

    try {
      const payload = {
        page_key: form.page_key,
        section_key: form.section_key,
        title: form.title,
        subtitle: form.subtitle || null,
        description: form.description || null,
        updated_at: new Date().toISOString(),
      };

      if (supabase) {
        let resultRow: PageHeaderRow | null = null;
        if (editing && isUuid(editing.id)) {
          const { data, error: updateError } = await supabase
            .from("page_headers")
            .update(payload)
            .eq("id", editing.id)
            .select("*")
            .single();
          if (updateError) throw new Error(updateError.message);
          resultRow = data as PageHeaderRow;
        } else {
          const { data, error: insertError } = await supabase
            .from("page_headers")
            .insert(payload)
            .select("*")
            .single();
          if (insertError) throw new Error(insertError.message);
          resultRow = data as PageHeaderRow;
        }

        if (resultRow) {
          const synced = editing
            ? items.map((i) => (i.id === editing.id ? resultRow! : i))
            : [...items, resultRow];
          persist(synced);
        }

        setSuccess("Saved Live to Supabase Cloud!");
        reset();
        return;
      }

      const fd = new FormData();
      fd.set("page_key", form.page_key);
      fd.set("section_key", form.section_key);
      fd.set("title", form.title);
      fd.set("subtitle", form.subtitle);
      fd.set("description", form.description);

      const url = editing ? `/api/admin/pages/${editing.id}` : "/api/admin/pages";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = (await res.json()) as { error?: string; header?: PageHeaderRow };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      if (data.header) {
        const synced = editing
          ? items.map((i) => (i.id === editing.id ? data.header! : i))
          : [...items, data.header!];
        persist(synced);
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

  async function remove(id: string) {
    if (!confirm("Delete this page header?")) return;
    setError("");
    setSuccess("");

    const supabase = getBrowserSupabase();
    if (supabase && isUuid(id)) {
      try {
        const { error: delErr } = await supabase.from("page_headers").delete().eq("id", id);
        if (delErr) throw new Error(delErr.message);
        const next = items.filter((i) => i.id !== id);
        persist(next);
        setSuccess("Saved Live to Supabase Cloud! (Deleted)");
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Cloud delete failed.";
        setError(msg);
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      const next = items.filter((i) => i.id !== id);
      persist(next);
      setSuccess("Saved Live to Supabase Cloud! (Deleted)");
    } catch {
      setSuccess("Removed locally.");
    }
  }

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Type className="h-6 w-6 text-action" />
          <div>
            <h1 className="font-display text-2xl text-navy">Page Headings</h1>
            <p className="text-sm text-navy/70">Edit section titles and subheadings across the site.</p>
          </div>
        </div>
        <button type="button" onClick={startAdd} className="btn-action">
          <Plus className="h-4 w-4" /> Add header
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
          <label className="block text-sm font-semibold">
            Page
            <select
              required
              value={form.page_key}
              onChange={(e) => setForm({ ...form, page_key: e.target.value, section_key: "" })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            >
              <option value="">Select page</option>
              {pageOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Section
            <select
              required
              value={form.section_key}
              onChange={(e) => setForm({ ...form, section_key: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            >
              <option value="">Select section</option>
              {(form.page_key ? sectionOptions[form.page_key] || [] : []).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
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
            Subtitle / Kicker
            <input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Description
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn-action" disabled={saving}>
              {saving ? "Saving Live to Cloud…" : editing ? "Update header" : "Create header"}
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
                <th className="px-4 py-3 font-semibold">Page</th>
                <th className="px-4 py-3 font-semibold">Section</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Subtitle</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-navy/10 last:border-0">
                  <td className="px-4 py-3 font-medium text-navy">{item.page_key}</td>
                  <td className="px-4 py-3">{item.section_key}</td>
                  <td className="px-4 py-3 font-semibold text-navy">{item.title}</td>
                  <td className="px-4 py-3 text-navy/70">{item.subtitle}</td>
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
