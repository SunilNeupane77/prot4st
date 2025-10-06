import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth'
import clientPromise from './mongodb'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export async function getCurrentUser() {
  const session = await getServerSession()
  if (!session?.user?.email) return null

  const client = await clientPromise
  const db = client.db('protest-org')
  
  const user = await db.collection('users').findOne(
    { email: session.user.email },
    { projection: { password: 0 } }
  )
  
  return user
}
