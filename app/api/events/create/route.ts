import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Create an event input schema with only the fields needed from the frontend
// Using a more specific schema for input validation
const eventInputSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string(),
  type: z.string().default('community'),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    venue: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional()
    }).optional()
  }).optional(),
  coOrganizers: z.array(z.string()).optional(),
  maxParticipants: z.number().optional(),
  requirements: z.array(z.string()).optional(),
  resources: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    quantity: z.number().optional()
  })).optional(),
  safety: z.object({
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
    safetyGuidelines: z.array(z.string()).optional()
  }).optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'private', 'members']).default('public'),
  groupId: z.string().optional()
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
    
    // Validate the input data
    const validationResult = eventInputSchema.safeParse(inputData)
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
    
    // Transform any string IDs to ObjectId instances
    const coOrganizerIds = data.coOrganizers?.map(id => new ObjectId(id)) || []
    
    // Prepare the event object
    const event = {
      title: data.title,
      description: data.description,
      type: data.type,
      status: 'draft',
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location || {
        address: '',
        city: '',
        state: '',
        country: '',
      },
      organizer: user._id,
      coOrganizers: coOrganizerIds,
      participants: [{
        userId: user._id,
        status: 'confirmed',
        registeredAt: new Date(),
        role: 'organizer'
      }],
      maxParticipants: data.maxParticipants,
      requirements: data.requirements || [],
      resources: data.resources || [],
      safety: {
        riskLevel: data.safety?.riskLevel || 'low',
        safetyGuidelines: data.safety?.safetyGuidelines || [],
      },
      tags: data.tags || [],
      visibility: data.visibility,
      groupId: data.groupId ? new ObjectId(data.groupId) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('events').insertOne(event)

    // Add event to user's events
    await db.collection('users').updateOne(
      { _id: user._id },
      { $push: { events: result.insertedId } }
    )

    // If event belongs to a group, update group stats
    if (data.groupId) {
      await db.collection('groups').updateOne(
        { _id: new ObjectId(data.groupId) },
        { 
          $inc: { 'stats.eventCount': 1 },
          $set: { 'stats.lastActivity': new Date() }
        }
      )
    }

    return NextResponse.json({ 
      message: 'Event created successfully',
      eventId: result.insertedId 
    })
  } catch {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
