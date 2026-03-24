import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { saveSubmission, initDb } from "@/lib/db";
import { sendEnquiryEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { getClientIp, hashIp } from "@/lib/ip";
export const runtime = "nodejs";
const MAX_BODY_BYTES = 32 * 1024;
async function sendEmailWithTimeout(payload: Parameters<typeof sendEnquiryEmail>[0]) {
  await Promise.race([
    sendEnquiryEmail(payload),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Email timeout")), 6_000)
    ),
  ]);
}
function sanitise(str: string) {
  return str.trim().replace(/[\x00-\x1F\x7F]/g, "");
}
export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json"))
    return NextResponse.json({ error: "Invalid content type." }, { status: 415 });
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES)
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  const rawIp  = await getClientIp();
  const ipHash = hashIp(rawIp);
  const { allowed } = await checkRateLimit(ipHash, "contact");
  if (!allowed)
    return NextResponse.json(
      { error: "Too many requests. Please call us directly." }, { status: 429 }
    );
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const turnstileToken = typeof body.cf_turnstile_response === "string" ? body.cf_turnstile_response : "";
  if (!await verifyTurnstile(turnstileToken, rawIp ?? ""))
    return NextResponse.json({ error: "Security check failed." }, { status: 403 });
  const result = contactSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json(
      { error: "Validation failed.", issues: result.error.flatten().fieldErrors }, { status: 422 }
    );
  const d = result.data;
  const submission = {
    full_name:   sanitise(d.full_name),
    company:     sanitise(d.company),
    phone:       sanitise(d.phone),
    email:       sanitise(d.email).toLowerCase(),
    location:    d.location,
    crew_type:   d.crew_type,
    event_dates: sanitise(d.event_dates),
    message:     d.message ? sanitise(d.message) : null,
    ip_hash:     ipHash,
  };
  try {
    await initDb();
    await saveSubmission(submission);
  } catch (err) {
    console.error("DB save failed:", err);
    return NextResponse.json(
      { error: "Could not save enquiry. Please call us directly." }, { status: 500 }
    );
  }
  try { await sendEmailWithTimeout({ submission }); }
  catch (err) { console.error("Email failed (saved to DB):", err); }
  return NextResponse.json({ success: true, message: "Enquiry received." });
}
