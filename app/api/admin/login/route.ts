import { NextResponse } from "next/server";
import {
  createSessionToken,
  getAdminCredentials,
  sessionCookieOptions,
  timingSafeEqual,
} from "@/lib/adminAuth";

export async function POST(request: Request) {
  const credentials = getAdminCredentials();
  if (!credentials) {
    return NextResponse.json(
      {
        error:
          "Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSCODE in .env.local.",
      },
      { status: 503 }
    );
  }

  const body = (await request.json()) as { email?: string; passcode?: string };
  const email = (body.email || "").trim().toLowerCase();
  const passcode = body.passcode || "";

  const emailOk = timingSafeEqual(email, credentials.email.trim().toLowerCase());
  const passOk = timingSafeEqual(passcode, credentials.passcode);

  if (!emailOk || !passOk) {
    return NextResponse.json({ error: "Invalid email or passcode." }, { status: 401 });
  }

  const token = await createSessionToken(email);
  const { name, ...options } = sessionCookieOptions();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(name, token, options);
  return response;
}
