import clientPromise from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Create a group input schema for validation
const groupInputSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string(),
  type: z.enum(['public', 'private', 'secret']).default('public'),
  category: z.string().default('community'),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional()
    }).optional()
  }).optional(),
  rules: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  requireApproval: z.boolean().optional(),
  allowInvites: z.boolean().optional(),
  messageRetention: z.number().optional(),
  maxMembers: z.number().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inputData = await request.json()
    const client = await clientPromise
    const db = client.db('protest-org')

    // Validate input data
    const validationResult = groupInputSchema.safeParse(inputData)
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: validationResult.error.format() 
      }, { status: 400 })
    }
    
    const data = validationResult.data

    // Get user ID
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const group = {
      name: data.name,
      description: data.description,
      type: data.type,
      category: data.category,
      location: data.location || {},
      members: [{
        userId: user._id,
        role: 'admin',
        joinedAt: new Date(),
        permissions: ['all']
      }],
      admins: [user._id],
      moderators: [],
      rules: data.rules || [],
      tags: data.tags || [],
      settings: {
        requireApproval: data.requireApproval ?? false,
        allowInvites: data.allowInvites ?? true,
        messageRetention: data.messageRetention ?? 30,
        maxMembers: data.maxMembers
      },
      stats: {
        memberCount: 1,
        messageCount: 0,
        eventCount: 0,
        lastActivity: new Date()
      },
      createdBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    }

    const result = await db.collection('groups').insertOne(group)

    // Add group to user's groups
    await db.collection('users').updateOne(
      { _id: user._id },
      { $push: { groups: result.insertedId } }
    )

    return NextResponse.json({ 
      message: 'Group created successfully',
      groupId: result.insertedId 
    })
  } catch {
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}
