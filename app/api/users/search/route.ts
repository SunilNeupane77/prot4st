import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('protest-org')
    
    const currentUser = await db.collection('users').findOne({ email: session.user.email })
    
    const users = await db.collection('users')
      .find({
        $and: [
          { _id: { $ne: currentUser?._id } }, // Exclude current user
          {
            $or: [
              { username: { $regex: query, $options: 'i' } },
              { 'profile.firstName': { $regex: query, $options: 'i' } },
              { 'profile.lastName': { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } }
            ]
          }
        ]
      })
      .limit(limit)
      .project({
        username: 1,
        'profile.firstName': 1,
        'profile.lastName': 1,
        role: 1
      })
      .toArray()

    return NextResponse.json({ 
      users: users.map(user => ({
        _id: user._id,
        username: user.username,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        role: user.role
      }))
    })
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
