import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // If NEXTAUTH_SECRET is not set, auth is disabled — allow everyone
        if (!process.env.NEXTAUTH_SECRET) return true;
        return Boolean(token);
      },
    },
  }
);

// Protect all routes except auth endpoints, login page, and Next.js internals
export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};
