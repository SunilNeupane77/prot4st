import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, firstName, lastName, role = 'participant' } = await request.json()
    
    if (!username || !email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('protest-org')
    
    const existingUser = await db.collection('users').findOne({
      $or: [{ email }, { username }]
    })
    
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }
    
    const hashedPassword = await hashPassword(password)
    
    const user = {
      username,
      email,
      password: hashedPassword,
      role,
      verified: false,
      profile: {
        firstName,
        lastName,
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
      updatedAt: new Date()
    }
    
    const result = await db.collection('users').insertOne(user)
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user: {
        id: result.insertedId,
        username,
        email,
        role
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
