import { hashPassword } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { userSchema } from '@/lib/schemas'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Create a registration input schema with only the fields needed for registration
const registrationSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['organizer', 'participant']).default('participant')
})

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate the incoming data
    const result = registrationSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: result.error.format() 
      }, { status: 400 })
    }
    
    const { username, email, password, firstName, lastName, role } = result.data
    
    const client = await clientPromise
    const db = client.db('protest-org')
    
    const existingUser = await db.collection('users').findOne({
      $or: [{ email }, { username }]
    })
    
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }
    
    const hashedPassword = await hashPassword(password)
    
    // Prepare the user object with validated data
    const userData = {
      username,
      email,
      password: hashedPassword,
      role,
      verified: false,
      needsRoleSelection: role === 'participant' ? false : true, // Only organizers need additional role selection
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
      updatedAt: new Date(),
      status: 'active'
    }
     // Validate the user data with Zod schema
    const validatedUser = userSchema.parse(userData)

    // Insert the validated user into the database
    const insertResult = await db.collection('users').insertOne(validatedUser)
    
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: insertResult.insertedId,
        username,
        email,
        role
      }
    })
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
