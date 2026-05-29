import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Where to redirect when auth fails
  pages: {
    signIn: "/login",
  },

  // How long the session lasts (30 days)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // credentials comes from the login form
        if (!credentials?.email || !credentials?.password) {
          return null // returning null = login failed
        }

        // Look up the user in the database
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          return null // user not found
        }

        // Compare the typed password with the stored hash
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordsMatch) {
          return null // wrong password
        }

        // Return the user — this gets stored in the session
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
    }),
  ],

  callbacks: {
    // This adds user id to the session so we can use it in components
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})