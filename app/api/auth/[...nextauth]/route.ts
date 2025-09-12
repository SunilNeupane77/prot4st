import { verifyPassword } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import FacebookProvider from 'next-auth/providers/facebook'

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

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
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'facebook') {
        const client = await clientPromise
        const db = client.db('protest-org')
        
        const existingUser = await db.collection('users').findOne({ email: user.email })
        
        if (!existingUser) {
          await db.collection('users').insertOne({
            username: user.name?.replace(/\s+/g, '').toLowerCase() || 'user',
            email: user.email,
            password: '', // No password for OAuth users
            role: 'participant',
            verified: true,
            profile: {
              firstName: profile?.name?.split(' ')[0] || '',
              lastName: profile?.name?.split(' ').slice(1).join(' ') || '',
              phone: '',
              location: '',
              bio: ''
            },
            security: {
              twoFactorEnabled: false,
              lastLogin: new Date(),
              loginAttempts: 0
            },
            groups: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            facebookId: account.providerAccountId
          })
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const client = await clientPromise
        const db = client.db('protest-org')
        
        const user = await db.collection('users').findOne({ email: session.user.email })
        if (user) {
          session.user.id = user._id.toString()
          session.user.role = user.role
          session.user.username = user.username
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth'
  },
  session: { strategy: 'jwt' }
})

export { handler as GET, handler as POST }
