import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signInSchema } from "@/lib/validations";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days max (but controlled by JWT callback)
  },
  cookies: {
    sessionToken: {
      name: `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days (but session controlled by JWT)
      },
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = signInSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;
        const rememberMe = (credentials as any).rememberMe === 'true';

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          rememberMe,
        };
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      
      const now = Date.now();
      const lastActivity = (token.lastActivity as number) || now;
      const loginTime = (token.loginTime as number) || now;
      const rememberMe = token.rememberMe as boolean;
      
      // Idle timeout: 30 minutes of inactivity
      const idleTimeout = 30 * 60 * 1000;
      if (now - lastActivity > idleTimeout) {
        return null as any; // Force re-authentication
      }
      
      // Session duration based on remember me preference
      if (!rememberMe) {
        // Without "remember me": session expires after 24 hours
        const sessionDuration = 24 * 60 * 60 * 1000;
        if (now - loginTime > sessionDuration) {
          return null as any; // Force re-authentication
        }
      } else {
        // With "remember me": session lasts 30 days
        const sessionDuration = 30 * 24 * 60 * 60 * 1000;
        if (now - loginTime > sessionDuration) {
          return null as any; // Force re-authentication
        }
      }
      
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.loginTime = Date.now();
        token.lastActivity = Date.now();
        token.rememberMe = (user as any).rememberMe || false;
      }
      
      // Update last activity on each request to track idle time
      if (trigger === "update" || trigger === undefined) {
        token.lastActivity = Date.now();
      }
      
      return token;
    },
  },
});




