// @ts-ignore
import NextAuth from 'next-auth'
// @ts-ignore  
import CredentialsProvider from 'next-auth/providers/credentials'
import { database } from '@/lib/database'
import bcrypt from 'bcryptjs'

export const authOptions: any = {
  providers: [                                                    
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await database.findUserByEmail(credentials.email)

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as 'USER' | 'ADMIN' | 'MODERATOR',
          }
        } catch (error) {
          console.error('NextAuth authorization error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt: async ({ token, user }: any) => {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    session: async ({ session, token }: any) => {
      if (token && session.user) {
        (session.user as any).id = token.id || token.sub
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/signin',
  },
  // Production configuration
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-change-in-production',
  trustHost: true,
  // Add better error handling
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code: any, metadata: any) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code: any) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code: any, metadata: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata)
      }
    }
  }
}

// @ts-ignore
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }