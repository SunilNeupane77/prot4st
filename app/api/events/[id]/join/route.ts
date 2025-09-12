import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

    const event = await db.collection('events').findOne({ _id: new ObjectId(params.id) })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.attendees.includes(user._id.toString())) {
      return NextResponse.json({ error: 'Already joined this event' }, { status: 400 })
    }

    await db.collection('events').updateOne(
      { _id: new ObjectId(params.id) },
      { $push: { attendees: user._id.toString() } }
    )
    
    return NextResponse.json({ message: 'Successfully joined event' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join event' }, { status: 500 })
  }
}
