import { NextResponse } from "next/server";

/** Shared headers to guarantee every API response bypasses all caches
 * (browser, CDN, Vercel Data Cache) so admin edits reach every device
 * immediately. */
export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/** Drop-in replacement for `NextResponse.json` that always attaches
 * no-store cache headers. */
export function noStoreJson<T>(
  body: T,
  init?: { status?: number; headers?: Record<string, string> }
) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...(init?.headers ?? {}), ...NO_STORE_HEADERS },
  });
}
