export const revalidate = 0;
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { noStoreJson } from "@/lib/apiCache";
import { sessionCookieOptions } from "@/lib/adminAuth";

export async function POST() {
  const { name, ...options } = sessionCookieOptions();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(name, "", { ...options, maxAge: 0 });
  return response;
}
