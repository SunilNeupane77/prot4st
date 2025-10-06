import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
// import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('protest-org')
    
    const safetyData = await db.collection('safety-info').findOne({ type: 'default' })
    
    if (!safetyData) {
      // Return default structure if no data exists
      return NextResponse.json({
        emergencyReminder: '',
        safetyTips: [],
        emergencyContacts: [],
        rights: [],
        checklistItems: []
      })
    }
    
    return NextResponse.json(safetyData)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch safety info' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('protest-org')
    
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user || user.role !== 'organizer') {
      return NextResponse.json({ error: 'Only organizers can update safety info' }, { status: 403 })
    }

    const safetyData = await request.json()
    
    await db.collection('safety-info').updateOne(
      { type: 'default' },
      { 
        $set: {
          ...safetyData,
          updatedBy: new ObjectId(user._id),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )
    
    return NextResponse.json({ message: 'Safety info updated successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to update safety info' }, { status: 500 })
  }
}
