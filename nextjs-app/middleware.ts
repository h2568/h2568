import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC = ["/login", "/api/auth"];

export async function middleware(req: NextRequest) {
  // Auth disabled — allow everything
  if (!process.env.NEXTAUTH_SECRET) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Always allow public paths
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Check JWT token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
