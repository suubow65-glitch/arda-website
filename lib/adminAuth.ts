import { ADMIN_COOKIE } from "@/lib/constants";

const SESSION_DAYS = 7;

function getSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSCODE ||
    "arda-dev-session-secret"
  );
}

function bytesToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return bytesToHex(signature);
}

export function timingSafeEqual(a: string, b: string) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left[i] ^ right[i];
  }
  return diff === 0;
}

export async function createSessionToken(email: string) {
  const payload = JSON.stringify({
    email,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
  const encoded = btoa(payload);
  const signature = await hmacHex(encoded);
  return `${encoded}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token || !token.includes(".")) return null;
  const [encoded, signature] = token.split(".");
  const expected = await hmacHex(encoded);
  if (!timingSafeEqual(signature, expected)) return null;
  try {
    const payload = JSON.parse(atob(encoded)) as { email: string; exp: number };
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    name: ADMIN_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  };
}

export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL || "ict@arda.org.so";
  const passcode = process.env.ADMIN_PASSCODE || "ArdaAdmin2026!";
  return { email, passcode };
}
