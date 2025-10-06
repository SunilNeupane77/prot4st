import clientPromise from '@/lib/mongodb'
import { Document, ObjectId, UpdateFilter } from 'mongodb'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('protest-org')
    
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const event = await db.collection('events').findOne({ _id: new ObjectId(id) })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.attendees.includes(user._id.toString())) {
      return NextResponse.json({ error: 'Already joined this event' }, { status: 400 })
    }

    // Using a type cast to work around the type issue with MongoDB update operators
    await db.collection('events').updateOne(
      { _id: new ObjectId(id) },
      { $push: { attendees: user._id.toString() } } as unknown as UpdateFilter<Document>
    )
    
    return NextResponse.json({ message: 'Successfully joined event' })
  } catch {
    return NextResponse.json({ error: 'Failed to join event' }, { status: 500 })
  }
}
