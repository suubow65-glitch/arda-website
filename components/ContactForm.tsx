"use client";

import { FormEvent, useState } from "react";
import { org } from "@/data/mockData";

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
      subject: String(form.get("subject") || "General enquiry").trim(),
      organisation: String(form.get("organisation") || "").trim(),
      message: String(form.get("message") || "").trim(),
    };

    try {
      const response = await fetch("/api/contact", {
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
          Your message has been received. The ARDA partnerships team in
          Mogadishu will respond to {org.email} enquiries during working hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
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
          Subject
          <select
            name="subject"
            className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
          >
            <option>Partnership enquiry</option>
            <option>Programme collaboration</option>
            <option>Procurement / tender</option>
            <option>General enquiry</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block text-sm font-semibold">
        Message
        <textarea
          required
          name="message"
          rows={5}
          className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
        />
      </label>
      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="btn-action mt-6" disabled={loading}>
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
