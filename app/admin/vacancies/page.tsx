"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Download, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import { mapVacancy } from "@/lib/mappers";
import { getBrowserSupabase, uploadDirectFile } from "@/lib/supabaseBrowser";
import type { VacancyRow } from "@/lib/types";

const empty: Partial<VacancyRow> = {
  title: "",
  type: "job",
  location: "Baidoa, Somalia",
  deadline: "",
  description: "",
  status: "active",
  order_index: 0,
};

const adminKey = "arda_admin_vacancies_list";

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export default function VacanciesAdminPage() {
  const [items, setItems] = useState<VacancyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<Partial<VacancyRow>>(empty);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const supabase = getBrowserSupabase();
    if (supabase) {
      try {
        const { data, error: qErr } = await supabase
          .from("vacancies")
          .select("*")
          .order("order_index", { ascending: true });
        if (!qErr && data && data.length > 0) {
          setItems(data as VacancyRow[]);
          setLocalItem(adminKey, data);
          setLocalItem(storageKeys.vacancies, (data as VacancyRow[]).map(mapVacancy));
          setLoading(false);
          return;
        }
      } catch {
        // fallback
      }
    }

    try {
      const res = await fetch("/api/admin/vacancies", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { vacancies: VacancyRow[] };
        const list = data.vacancies?.length ? data.vacancies : [];
        setItems(list);
        setLocalItem(adminKey, list);
        setLocalItem(storageKeys.vacancies, list.map(mapVacancy));
        setLoading(false);
        return;
      }
    } catch {
      // fallback
    }

    const saved = getLocalItem<VacancyRow[]>(adminKey);
    setItems(saved?.length ? saved : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startAdd() {
    setEditing({ ...empty });
    if (fileRef.current) fileRef.current.value = "";
    setOpen(true);
  }

  function startEdit(item: VacancyRow) {
    setEditing(item);
    if (fileRef.current) fileRef.current.value = "";
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const file = fileRef.current?.files?.[0];
    const supabase = getBrowserSupabase();

    try {
      let fileUrl = editing.file_url ?? "";
      if (supabase && file) {
        try {
          fileUrl = await uploadDirectFile(supabase, "vacancy-files", file);
        } catch (storageErr) {
          console.warn("Storage upload failed, attempting fallback:", storageErr);
        }
      }

      const payload = {
        title: editing.title ?? "",
        type: editing.type ?? "job",
        location: editing.location ?? "",
        deadline: editing.deadline ?? "",
        description: editing.description ?? "",
        status: editing.status ?? "active",
        order_index: Number(editing.order_index ?? 0),
        file_url: fileUrl || null,
      };

      if (supabase) {
        let resultRow: VacancyRow | null = null;
        if (editing.id && isUuid(editing.id)) {
          const { data, error: updateError } = await supabase
            .from("vacancies")
            .update(payload)
            .eq("id", editing.id)
            .select("*")
            .single();
          if (updateError) throw new Error(updateError.message);
          resultRow = data as VacancyRow;
        } else {
          const { data, error: insertError } = await supabase
            .from("vacancies")
            .insert(payload)
            .select("*")
            .single();
          if (insertError) throw new Error(insertError.message);
          resultRow = data as VacancyRow;
        }

        if (resultRow) {
          const next = editing.id
            ? items.map((i) => (i.id === editing.id ? resultRow! : i))
            : [...items, resultRow];
          setItems(next);
          setLocalItem(adminKey, next);
          setLocalItem(storageKeys.vacancies, next.map(mapVacancy));
        }

        setSuccess("Saved Live to Supabase Cloud!");
        setOpen(false);
        setEditing(empty);
        if (fileRef.current) fileRef.current.value = "";
        return;
      }

      const fd = new FormData();
      fd.set("title", editing.title ?? "");
      fd.set("type", editing.type ?? "job");
      fd.set("location", editing.location ?? "");
      fd.set("deadline", editing.deadline ?? "");
      fd.set("description", editing.description ?? "");
      fd.set("status", editing.status ?? "active");
      fd.set("order_index", String(editing.order_index ?? 0));
      if (file) fd.set("file", file);

      const url = editing.id && isUuid(editing.id)
        ? `/api/admin/vacancies/${editing.id}`
        : "/api/admin/vacancies";
      const method = editing.id && isUuid(editing.id) ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setOpen(false);
      setEditing(empty);
      if (fileRef.current) fileRef.current.value = "";
      await load();
      setSuccess("Saved Live to Supabase Cloud!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cloud write failed.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this vacancy?")) return;
    setError("");
    setSuccess("");

    const supabase = getBrowserSupabase();
    if (supabase && isUuid(id)) {
      try {
        const { error: delErr } = await supabase.from("vacancies").delete().eq("id", id);
        if (delErr) throw new Error(delErr.message);
        const next = items.filter((i) => i.id !== id);
        setItems(next);
        setLocalItem(adminKey, next);
        setLocalItem(storageKeys.vacancies, next.map(mapVacancy));
        setSuccess("Saved Live to Supabase Cloud! (Deleted)");
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Cloud delete failed.";
        setError(msg);
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/vacancies/${id}`, { cache: "no-store", method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      const next = items.filter((i) => i.id !== id);
      setItems(next);
      setLocalItem(adminKey, next);
      setLocalItem(storageKeys.vacancies, next.map(mapVacancy));
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
          <h1 className="font-display text-2xl text-navy">Careers & Tenders</h1>
          <p className="text-sm text-navy/70">
            Publish job vacancies and procurement opportunities.
          </p>
        </div>
        <button type="button" onClick={startAdd} className="btn-action">
          <Plus className="h-4 w-4" /> Add opportunity
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
              value={editing.title}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Type
            <select
              value={editing.type}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  type: e.target.value as VacancyRow["type"],
                })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            >
              <option value="job">Job Opening</option>
              <option value="tender">Procurement / Tender</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Location
            <input
              value={editing.location ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, location: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Deadline
            <input
              value={editing.deadline ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, deadline: e.target.value })
              }
              placeholder="e.g. 2026-07-31 or Open"
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Status
            <select
              value={editing.status}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  status: e.target.value as VacancyRow["status"],
                })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            >
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
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
          <label className="block text-sm font-semibold">
            PDF File / TOR
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm file:mr-3 file:rounded file:border-0 file:bg-action file:px-3 file:py-1 file:text-white"
            />
            {editing.file_url && (
              <p className="mt-1 text-xs text-navy/60">
                Current file attached. Choose another to replace.
              </p>
            )}
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            Description / Requirements
            <textarea
              rows={4}
              value={editing.description ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            />
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-action" disabled={saving}>
              {saving ? "Saving Live to Cloud…" : editing.id ? "Update opportunity" : "Create opportunity"}
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
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Deadline</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-navy/10 last:border-0">
                  <td className="px-4 py-3 font-semibold text-navy">{item.title}</td>
                  <td className="px-4 py-3 capitalize">{item.type}</td>
                  <td className="px-4 py-3">{item.location || "—"}</td>
                  <td className="px-4 py-3">{item.deadline || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        item.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-surface text-navy/60"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {item.file_url && (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-navy/10 p-2 text-navy hover:bg-surface"
                          aria-label="Download TOR"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
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
