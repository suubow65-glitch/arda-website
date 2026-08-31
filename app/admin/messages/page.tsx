"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Mail, MailOpen, Trash2 } from "lucide-react";
import type { ContactMessageRow } from "@/lib/types";

export default function MessagesAdminPage() {
  const [items, setItems] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/admin/messages");
      if (!res.ok) throw new Error("Failed to load messages.");
      const data = (await res.json()) as { messages: ContactMessageRow[] };
      setItems(data.messages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string, read: boolean) {
    setError("");
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Update failed.");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Contact Messages</h1>
      <p className="text-sm text-navy/70">Inquiries submitted through the website.</p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-action" />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.length === 0 && (
            <p className="rounded-2xl bg-white p-8 text-center text-navy/70">
              No messages yet.
            </p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border border-navy/10 bg-white p-5 shadow-card ${
                !item.read ? "border-l-4 border-l-action" : ""
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {item.read ? (
                      <MailOpen className="h-4 w-4 text-navy/50" />
                    ) : (
                      <Mail className="h-4 w-4 text-action" />
                    )}
                    <h3 className="font-display text-lg text-navy">{item.subject}</h3>
                    {!item.read && (
                      <span className="rounded-full bg-action px-2 py-0.5 text-xs font-semibold text-white">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-navy/70">
                    From <span className="font-semibold text-navy">{item.name}</span> ·{" "}
                    <a href={`mailto:${item.email}`} className="text-action hover:underline">
                      {item.email}
                    </a>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-navy/80">
                    {item.message}
                  </p>
                  <p className="mt-3 text-xs text-navy/50">
                    {new Date(item.created_at).toLocaleString("en-GB")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!item.read ? (
                    <button
                      type="button"
                      onClick={() => markRead(item.id, true)}
                      className="inline-flex items-center gap-1 rounded-md border border-navy/10 px-3 py-2 text-sm font-semibold text-navy hover:bg-surface"
                    >
                      <Check className="h-4 w-4" /> Mark as read
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markRead(item.id, false)}
                      className="inline-flex items-center gap-1 rounded-md border border-navy/10 px-3 py-2 text-sm font-semibold text-navy hover:bg-surface"
                    >
                      Mark unread
                    </button>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
