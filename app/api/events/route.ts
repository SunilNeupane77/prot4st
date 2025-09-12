import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, location, date, isPublic = true } = await request.json()
    
    const client = await clientPromise
    const db = client.db('protest-org')
    
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const event = {
      title,
      description,
      location,
      date: new Date(date),
      organizerId: new ObjectId(user._id),
      attendees: [user._id.toString()],
      isPublic,
      resources: [],
      createdAt: new Date()
    }
    
    const result = await db.collection('events').insertOne(event)
    
    return NextResponse.json({ 
      message: 'Event created',
      eventId: result.insertedId 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('protest-org')
    
    const events = await db.collection('events')
      .find({ isPublic: true })
      .sort({ date: 1 })
      .toArray()
    
    return NextResponse.json({ events })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
