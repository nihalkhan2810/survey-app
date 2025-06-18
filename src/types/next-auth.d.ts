declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: 'USER' | 'ADMIN' | 'MODERATOR'
    }
  }

  interface User {
    role: 'USER' | 'ADMIN' | 'MODERATOR'
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: 'USER' | 'ADMIN' | 'MODERATOR'
  }
}

declare module "next-auth/next" {
  export { getServerSession } from "next-auth"
}

declare module "next-auth/react"