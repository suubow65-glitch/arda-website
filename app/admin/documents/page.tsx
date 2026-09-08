"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Download, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import { formatBytes, mapDocument } from "@/lib/mappers";
import { documents as mockDocuments } from "@/data/mockData";
import { getBrowserSupabase, uploadDirectFile } from "@/lib/supabaseBrowser";
import type { DocumentRow } from "@/lib/types";

const adminKey = "arda_admin_documents_list";

const defaultDocuments: DocumentRow[] = mockDocuments.map((d) => ({
  id: d.id,
  title: d.title,
  category: d.type,
  year: d.year,
  file_url: d.href,
  file_size: d.size,
  created_at: new Date().toISOString(),
}));

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export default function DocumentsAdminPage() {
  const currentYear = new Date().getFullYear();
  const [items, setItems] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    year: String(currentYear),
  });
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const supabase = getBrowserSupabase();
    if (supabase) {
      try {
        const { data, error: qErr } = await supabase
          .from("documents")
          .select("*")
          .order("created_at", { ascending: false });
        if (!qErr && data && data.length > 0) {
          setItems(data as DocumentRow[]);
          setLocalItem(adminKey, data);
          setLocalItem(storageKeys.documents, (data as DocumentRow[]).map(mapDocument));
          setLoading(false);
          return;
        }
      } catch {
        // fallback
      }
    }

    try {
      const res = await fetch("/api/admin/documents", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { documents: DocumentRow[] };
        const list = data.documents?.length ? data.documents : defaultDocuments;
        setItems(list);
        setLocalItem(adminKey, list);
        setLocalItem(storageKeys.documents, list.map(mapDocument));
        setLoading(false);
        return;
      }
    } catch {
      // fallback
    }

    const saved = getLocalItem<DocumentRow[]>(adminKey);
    const list = saved?.length ? saved : defaultDocuments;
    setItems(list);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function reset() {
    setForm({ title: "", category: "", year: String(currentYear) });
    if (fileRef.current) fileRef.current.value = "";
    setOpen(false);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const file = fileRef.current?.files?.[0];
    const supabase = getBrowserSupabase();

    try {
      if (!file) {
        throw new Error("A PDF file is required.");
      }

      // 1) Direct Supabase Cloud write if configured
      if (supabase) {
        let fileUrl = "";
        try {
          fileUrl = await uploadDirectFile(supabase, "pdf-documents", file);
        } catch (storageErr) {
          console.warn("Storage upload failed, attempting fallback:", storageErr);
        }

        if (!fileUrl) {
          throw new Error("Failed to upload PDF file to storage.");
        }

        const payload = {
          title: form.title.trim(),
          category: form.category,
          year: form.year,
          file_url: fileUrl,
          file_size: formatBytes(file.size),
        };

        const { data, error: insertError } = await supabase
          .from("documents")
          .insert(payload)
          .select("*")
          .single();
        if (insertError) throw new Error(insertError.message);

        const newRow = data as DocumentRow;
        const next = [newRow, ...items];
        setItems(next);
        setLocalItem(adminKey, next);
        setLocalItem(storageKeys.documents, next.map(mapDocument));

        setSuccess("Saved Live to Supabase Cloud!");
        reset();
        return;
      }

      // 2) Serverless fallback
      const fd = new FormData();
      fd.set("title", form.title);
      fd.set("category", form.category);
      fd.set("year", form.year);
      fd.set("file", file);

      const res = await fetch("/api/admin/documents", { cache: "no-store", method: "POST", body: fd });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      await load();
      reset();
      setSuccess("Saved Live to Supabase Cloud!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cloud write failed.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this document?")) return;
    setError("");
    setSuccess("");

    const supabase = getBrowserSupabase();
    if (supabase && isUuid(id)) {
      try {
        const { error: delErr } = await supabase.from("documents").delete().eq("id", id);
        if (delErr) throw new Error(delErr.message);
        const next = items.filter((i) => i.id !== id);
        setItems(next);
        setLocalItem(adminKey, next);
        setLocalItem(storageKeys.documents, next.map(mapDocument));
        setSuccess("Saved Live to Supabase Cloud! (Deleted)");
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Delete failed.";
        setError(msg);
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/documents/${id}`, { cache: "no-store", method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      const next = items.filter((i) => i.id !== id);
      setItems(next);
      setLocalItem(adminKey, next);
      setLocalItem(storageKeys.documents, next.map(mapDocument));
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
          <h1 className="font-display text-2xl text-navy">Documents</h1>
          <p className="text-sm text-navy/70">
            Upload PDF reports, policies and tenders.
          </p>
        </div>
        <button type="button" onClick={() => setOpen(!open)} className="btn-action">
          <Plus className="h-4 w-4" />
          {open ? "Close" : "Upload document"}
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
            Report title
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
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Publication year
            <input
              required
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            PDF File
            <input
              ref={fileRef}
              required
              type="file"
              accept="application/pdf"
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm file:mr-3 file:rounded file:border-0 file:bg-action file:px-3 file:py-1 file:text-white"
            />
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-action" disabled={saving}>
              {saving ? "Uploading Live to Cloud…" : "Save Document"}
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
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Year</th>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-navy/10 last:border-0"
                >
                  <td className="px-4 py-3 font-semibold text-navy">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-action" />
                      {item.title}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-navy/10 px-2.5 py-1 text-xs font-semibold text-navy">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.year}</td>
                  <td className="px-4 py-3 text-navy/70">
                    {item.file_size || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {item.file_url && (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-navy/10 p-2 text-navy hover:bg-surface"
                          aria-label="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
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
