import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }: any) {
      if (account?.provider === "google") {
        const email = profile?.email ?? ""
        if (!email.endsWith("@go.buu.ac.th")) {
          return false  // ปฏิเสธ email อื่น
        }
        return true
      }
      return false
    },
    async session({ session, user }: any) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }