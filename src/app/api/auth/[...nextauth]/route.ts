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
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    jwt: async ({ token, user }: any) => {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    session: async ({ session, token }: any) => {
      if (token && session.user) {
        (session.user as any).id = token.sub
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
}

// @ts-ignore
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }