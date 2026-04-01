import type { NextAuthOptions } from "next-auth";
import GithubProvider  from "next-auth/providers/github";
import GoogleProvider  from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const providers: NextAuthOptions["providers"] = [];

// GitHub OAuth — set GITHUB_ID + GITHUB_SECRET
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({ clientId: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET })
  );
}

// Google OAuth — set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Demo credentials — always available (username: demo / password: demo)
providers.push(
  CredentialsProvider({
    name: "Demo account",
    credentials: {
      username: { label: "Username", type: "text",     placeholder: "demo" },
      password: { label: "Password", type: "password", placeholder: "demo" },
    },
    async authorize(credentials) {
      const user = process.env.DEMO_USERNAME ?? "demo";
      const pass = process.env.DEMO_PASSWORD ?? "demo";
      if (credentials?.username === user && credentials?.password === pass) {
        return { id: "1", name: "Demo User", email: "demo@claude-flow.ai" };
      }
      return null;
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages:   { signIn: "/login" },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
};

/** Returns true if auth is enabled (NEXTAUTH_SECRET is set). */
export function authEnabled(): boolean {
  return Boolean(process.env.NEXTAUTH_SECRET);
}
