import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from './db'

export const authOptions: NextAuthOptions = {
    providers: [
          CredentialsProvider({
                  name: 'credentials',
                  credentials: {
                            email: { label: 'Email', type: 'email' },
                            password: { label: 'Password', type: 'password' }
                  },
                  async authorize(credentials) {
                            if (!credentials?.email || !credentials?.password) return null
                            const user = await prisma.user.findUnique({ where: { email: credentials.email }, include: { customer: true } })
                            if (!user || !user.isActive) return null
                            const isValid = await compare(credentials.password, user.passwordHash)
                            if (!isValid) return null
                            return { id: String(user.id), email: user.email, name: `${user.firstName} ${user.lastName}`, role: user.role, customerId: user.customer?.id }
                  }
          })
        ],
    callbacks: {
          async jwt({ token, user }) {
                  if (user) { token.role = user.role; token.customerId = user.customerId }
                  return token
          },
          async session({ session, token }) {
                  if (session.user) { session.user.id = token.sub; session.user.role = token.role; session.user.customerId = token.customerId }
                  return session
          }
    },
    pages: { signIn: '/login' },
    session: { strategy: 'jwt' },
}
