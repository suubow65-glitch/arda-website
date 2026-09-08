"use client";

import { FormEvent, useState } from "react";

const inquiryTypes = [
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Partnership & Funding", label: "Partnership & Funding" },
  { value: "Program Support", label: "Program Support" },
  { value: "Media/Press", label: "Media/Press" },
];

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body = {
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      subject: String(form.get("subject") || "General Inquiry").trim(),
      organisation: String(form.get("organisation") || "").trim(),
      message: String(form.get("message") || "").trim(),
    };

    try {
      const response = await fetch("/api/contact", { cache: "no-store", 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Unable to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-relief/30 bg-relief-50 p-8 text-navy">
        <h3 className="font-display text-2xl">Thank you</h3>
        <p className="mt-2 text-sm leading-relaxed">
          Your enquiry has been received by the ARDA team. We aim to respond
          within two working days during Baidoa office hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-semibold">
        Full name
        <input
          required
          name="name"
          className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
        />
      </label>
      <label className="block text-sm font-semibold">
        Organisation
        <input
          name="organisation"
          className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
        />
      </label>
      <label className="block text-sm font-semibold">
        Email
        <input
          required
          type="email"
          name="email"
          className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
        />
      </label>
      <label className="block text-sm font-semibold">
        Inquiry type
        <select
          required
          name="subject"
          className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
        >
          {inquiryTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-2 block text-sm font-semibold">
        Message
        <textarea
          required
          name="message"
          rows={5}
          className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
        />
      </label>
      {error && (
        <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" className="btn-action" disabled={loading}>
          {loading ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
