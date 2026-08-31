"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";

export default function SecurityAdminPage() {
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/security")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load credentials.");
        const data = (await res.json()) as { credentials: { email: string } | null };
        setEmail(data.credentials?.email || "");
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (passcode && passcode !== confirm) {
      setError("Passcodes do not match.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    const newPasscode = passcode.trim();
    if (!newPasscode) {
      setError("New passcode is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passcode: newPasscode }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Update failed.");
      setMessage("Admin credentials updated successfully.");
      setPasscode("");
      setConfirm("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-action" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Security</h1>
      <p className="text-sm text-navy/70">Update the admin login email and passcode.</p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </p>
      )}

      <form
        onSubmit={save}
        className="mt-6 max-w-xl space-y-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-card"
      >
        <label className="block text-sm font-semibold">
          Admin email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
          />
        </label>
        <label className="block text-sm font-semibold">
          New passcode
          <div className="relative">
            <input
              required
              type={show ? "text" : "password"}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/50"
              aria-label={show ? "Hide passcode" : "Show passcode"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>
        <label className="block text-sm font-semibold">
          Confirm passcode
          <input
            required
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-md border border-navy/15 bg-surface px-3 py-2.5 text-sm outline-none ring-action focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="btn-action inline-flex items-center gap-2"
          disabled={saving}
        >
          <Lock className="h-4 w-4" />
          {saving ? "Saving…" : "Update credentials"}
        </button>
      </form>
    </div>
  );
}
