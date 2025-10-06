import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()
    
    if (!['participant', 'organizer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('protest-org')

    const result = await db.collection('users').updateOne(
      { email: session.user.email },
      { 
        $set: { 
          role: role,
          updatedAt: new Date(),
          needsRoleSelection: false
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Role updated successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}
