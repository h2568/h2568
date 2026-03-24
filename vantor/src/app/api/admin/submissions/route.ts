import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "crypto";
import { getSubmissionsPage, initDb } from "@/lib/db";
import { checkRateLimit } from "@/lib/ratelimit";
import { getClientIp, hashIp } from "@/lib/ip";
export const runtime = "nodejs";
function timingSafeCompare(a: string, b: string): boolean {
  const ba = createHash("sha256").update(a).digest();
  const bb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ba, bb);
}
function parseBasicAuth(header: string | null) {
  if (!header?.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const colon   = decoded.indexOf(":");
    if (colon < 0) return null;
    return { user: decoded.slice(0, colon), pass: decoded.slice(colon + 1) };
  } catch { return null; }
}
export async function GET(req: NextRequest) {
  const rawIp  = getClientIp();
  const ipHash = hashIp(rawIp);
  const { allowed } = await checkRateLimit(ipHash, "admin");
  if (!allowed)
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  const creds     = parseBasicAuth(req.headers.get("authorization"));
  const adminUser = process.env.ADMIN_USER     ?? "admin";
  const adminPass = process.env.ADMIN_PASSWORD ?? "";
  if (!creds || !timingSafeCompare(creds.user, adminUser) || !timingSafeCompare(creds.pass, adminPass)) {
    return new NextResponse("Unauthorised", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Vantor Admin"' },
    });
  }
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10));
  try {
    await initDb();
    const result = await getSubmissionsPage(page);
    return NextResponse.json({ ...result, page });
  } catch (err) {
    console.error("Admin DB error:", err);
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }
}
