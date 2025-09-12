import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'
import clientPromise from './mongodb'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getCurrentUser(request?: NextRequest) {
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
