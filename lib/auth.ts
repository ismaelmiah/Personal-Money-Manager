import type { NextAuthOptions, User, Session } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Load allowed emails from environment variable
const allowedemails = (process.env.ALLOWED_EMAILS || "").split(",")

declare module "next-auth" {
  interface Session {
    error?: string
    user?: {
      id?: string | null
      name?: string | null
      email?: string | null
      image?: string | null
    }
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
      return allowedemails.includes(user.email?.toLowerCase() ?? "")
    },
    async session({ session, token }) {
      // Check if the user's email is allowed
      if (session.user?.email && !allowedemails.includes(session.user.email.toLowerCase())) {
        session.user.name = null
        session.user.email = null
        session.user.image = null
        session.error = "email not allowed"
        return session
      }

      // If the email is allowed, add additional data to the session
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}

