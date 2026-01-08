import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Temporary simple auth without database
        if (credentials?.email === "test@test.com" && credentials?.password === "password") {
          return {
            id: "1",
            email: "test@test.com",
            name: "Test User",
          }
        }
        return null
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  callbacks: {
    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
