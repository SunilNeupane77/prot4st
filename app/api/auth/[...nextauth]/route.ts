import { verifyPassword } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const client = await clientPromise
          const db = client.db('protest-org')
          
          const user = await db.collection('users').findOne({ email: credentials.email })
          if (!user) return null

          const isValid = await verifyPassword(credentials.password, user.password)
          if (!isValid) return null

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            role: user.role
          }
        } catch (err) {
          console.error('Auth error:', err)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const client = await clientPromise
          const db = client.db('protest-org')
          
          const existingUser = await db.collection('users').findOne({ email: user.email })
          
          if (!existingUser) {
            // Create new user
            const newUser = {
              username: user.name?.replace(/\s+/g, '').toLowerCase() || `user${Date.now()}`,
              email: user.email,
              password: '',
              role: 'participant',
              verified: true,
              profile: {
                firstName: (profile as Record<string, unknown>)?.given_name as string || '',
                lastName: (profile as Record<string, unknown>)?.family_name as string || '',
                displayName: user.name || '',
                avatar: user.image || '',
                phone: '',
                bio: '',
                skills: [],
                languages: [],
                location: { address: '', city: '', state: '', country: '' },
                emergencyContact: { name: '', phone: '', relationship: '' },
                preferences: {
                  notifications: { email: true, sms: false, push: true, emergencyAlerts: true },
                  privacy: { profileVisibility: 'members', locationSharing: false, contactSharing: false },
                  communication: { language: 'en', timezone: 'UTC' }
                }
              },
              security: { twoFactorEnabled: false, lastLogin: new Date(), loginAttempts: 0 },
              groups: [],
              events: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              status: 'active',
              needsRoleSelection: true
            }
            
            await db.collection('users').insertOne(newUser)
            user.needsRoleSelection = true
            user.role = 'participant'
          } else {
            user.role = existingUser.role
            user.needsRoleSelection = existingUser.needsRoleSelection || false
          }
        } catch (err) {
          console.error('Google sign-in error:', err)
          return false
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          const client = await clientPromise
          const db = client.db('protest-org')
          
          const user = await db.collection('users').findOne({ email: session.user.email })
          if (user) {
            session.user.id = user._id.toString()
            session.user.role = user.role
            session.user.username = user.username
            session.user.needsRoleSelection = user.needsRoleSelection || false
          }
        } catch (err) {
          console.error('Session callback error:', err)
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth'
  },
  session: { strategy: 'jwt' },
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
