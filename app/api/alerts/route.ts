import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Create an alert input schema for validation
const alertInputSchema = z.object({
  title: z.string().min(3).max(100),
  message: z.string(),
  type: z.enum(['safety', 'info', 'warning', 'emergency']).default('info'),
  severity: z.enum(['info', 'low', 'medium', 'high', 'critical']).default('info'),
  location: z.object({
    address: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }).optional(),
  radius: z.number().optional(),
  targetAudience: z.enum(['all', 'organizers', 'specific']).default('all'),
  targetIds: z.array(z.string()).optional(),
  expiresAt: z.string().optional().transform(str => str ? new Date(str) : undefined),
  actionRequired: z.boolean().default(false),
  actionUrl: z.string().url().optional()
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
    const validationResult = alertInputSchema.safeParse(inputData)
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: validationResult.error.format() 
      }, { status: 400 })
    }
    
    const data = validationResult.data

    // Get user and check permissions
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user || !['organizer', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const alert = {
      title: data.title,
      message: data.message,
      type: data.type,
      severity: data.severity,
      location: data.location,
      radius: data.radius,
      targetAudience: data.targetAudience,
      targetIds: data.targetIds?.map(id => new ObjectId(id)) || [],
      expiresAt: data.expiresAt,
      actionRequired: data.actionRequired,
      actionUrl: data.actionUrl,
      sentBy: user._id,
      sentAt: new Date(),
      readBy: [],
      status: 'active'
    }

    const result = await db.collection('alerts').insertOne(alert)

    // Create notifications for targeted users
    if (data.targetAudience === 'all') {
      // Send to all active users
      const users = await db.collection('users').find({ status: 'active' }).toArray()
      const notifications = users.map(u => ({
        userId: u._id,
        title: data.title,
        message: data.message,
        type: 'alert',
        data: { alertId: result.insertedId, severity: data.severity },
        read: false,
        createdAt: new Date()
      }))
      
      if (notifications.length > 0) {
        await db.collection('notifications').insertMany(notifications)
      }
    }

    return NextResponse.json({ 
      message: 'Alert sent successfully',
      alertId: result.insertedId 
    })
  } catch {
    return NextResponse.json({ error: 'Failed to send alert' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')

    const client = await clientPromise
    const db = client.db('protest-org')

    const filter: Record<string, unknown> = { 
      status: 'active',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }
    
    if (severity) filter.severity = severity
    if (type) filter.type = type

    const alerts = await db.collection('alerts')
      .find(filter)
      .sort({ severity: -1, sentAt: -1 })
      .limit(20)
      .toArray()

    return NextResponse.json({ alerts })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}
