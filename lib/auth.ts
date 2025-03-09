import type { NextAuthOptions, User, Session } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const allowedEmails = ["ismail27.dec@gmail.com", "ismaelmiah.swe@gmail.com"]

declare module "next-auth" {
  interface Session {
    error?: string;
    user?: {
      Id?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return allowedEmails.includes(user.email?.toLowerCase() ?? "")
    },
    async session({ session, token }) {
      // Check if the user's email is allowed
      if (session.user?.email && !allowedEmails.includes(session.user.email.toLowerCase())) {        
        session.user.name = null;
        session.user.email = null;
        session.user.image = null;
        session.error = "Email not allowed";
        return session;
      }

      // If the email is allowed, add additional data to the session
      if (session.user) {
        if (token.sub) {
          session.user.Id = token.sub;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}

