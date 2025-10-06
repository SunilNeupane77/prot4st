import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      username?: string
      role?: string
      needsRoleSelection?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    username?: string
    role?: string
    needsRoleSelection?: boolean
  }
}
