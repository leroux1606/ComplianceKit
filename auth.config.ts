/**
 * Lightweight NextAuth config for Edge Runtime (middleware/proxy).
 * Must NOT import Prisma, pg, bcrypt, or any Node.js-only module.
 * The full config with the database adapter lives in lib/auth.ts.
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
