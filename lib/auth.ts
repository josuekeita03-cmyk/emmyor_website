import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import AppleProvider from "next-auth/providers/apple"
import { prisma } from "./prisma"
import { compare } from "bcryptjs"
import { type Role } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            customer: true,
            farmer: true,
            cooperative: true,
            company: true,
            individualProducer: true,
            retailer: true,
            commercial: true,
          }
        })

        if (!user) {
          throw new Error("Invalid credentials")
        }

        // OAuth users don't have passwords, they must use OAuth
        if (!user.password) {
          throw new Error("Please use social login to sign in")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "CUSTOMER"
      }
      
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as Role) || "CUSTOMER"
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "facebook" || account?.provider === "apple") {
        // For OAuth, ensure user exists in database with proper role
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (existingUser) {
          // Update the user object with role from database
          user.id = existingUser.id
          ;(user as any).role = existingUser.role
        } else {
          // Create new user with default CUSTOMER role
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              fullName: user.name || "",
              role: "CUSTOMER",
              isActive: true,
              password: "", // OAuth users don't have passwords
            }
          })
          user.id = newUser.id
          ;(user as any).role = newUser.role
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // If the URL is relative, prepend the base URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // If the URL is on the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url
      }
      // Otherwise, redirect to dashboard with locale
      return `${baseUrl}/en/dashboard`
    },
  },
}
