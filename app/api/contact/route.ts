import { NextResponse } from "next/server";
import { submitContactMessage } from "@/lib/content";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    organisation?: string;
  };

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const subject = (body.subject || "General enquiry").trim();
  const organisation = (body.organisation || "").trim();
  const messageBody = (body.message || "").trim();

  if (!name || !email || !messageBody) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  const message = organisation
    ? `Organisation: ${organisation}\n\n${messageBody}`
    : messageBody;

  const result = await submitContactMessage({ name, email, subject, message });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Unable to save your message. Please email info@arda.org.so." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, stored: result.stored });
}
