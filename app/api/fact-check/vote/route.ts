import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
// import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { factCheckId, vote, evidence } = await request.json()
    
    if (!factCheckId || !vote || !['true', 'false', 'disputed'].includes(vote)) {
      return NextResponse.json({ error: 'Invalid vote data' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('protest-org')
    
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already voted
    const existingVote = await db.collection('fact-checks').findOne({
      _id: new ObjectId(factCheckId),
      'communityVotes.userId': new ObjectId(user._id)
    })

    if (existingVote) {
      // Update existing vote
      await db.collection('fact-checks').updateOne(
        { 
          _id: new ObjectId(factCheckId),
          'communityVotes.userId': new ObjectId(user._id)
        },
        {
          $set: {
            'communityVotes.$.vote': vote,
            'communityVotes.$.evidence': evidence,
            'communityVotes.$.timestamp': new Date()
          }
        }
      )
    } else {
      // Add new vote
      await db.collection('fact-checks').updateOne(
        { _id: new ObjectId(factCheckId) },
        {
          $push: {
            communityVotes: {
              userId: new ObjectId(user._id),
              username: user.username,
              vote,
              evidence,
              timestamp: new Date()
            }
          }
        }
      )
    }

    return NextResponse.json({ message: 'Vote recorded successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
  }
}
