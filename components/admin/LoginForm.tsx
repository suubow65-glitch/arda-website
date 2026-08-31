"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        passcode: form.get("passcode"),
      }),
    });
    const data = (await response.json()) as { error?: string };
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Unable to sign in.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-relief">
          ARDA CMS
        </p>
        <h1 className="mt-2 font-display text-3xl text-navy">Admin login</h1>
        <p className="mt-2 text-sm text-navy/65">
          Enter your staff email and passcode to manage slideshows, activities,
          documents and contact messages.
        </p>
        <label className="mt-6 block text-sm font-semibold text-navy">
          Email
          <input
            required
            type="email"
            name="email"
            autoComplete="username"
            className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-navy">
          Passcode
          <input
            required
            type="password"
            name="passcode"
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm font-normal outline-none ring-action focus:ring-2"
          />
        </label>
        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="submit" className="btn-action mt-6 w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
