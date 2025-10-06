import clientPromise from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const client = await clientPromise
    const db = client.db('protest-org')

    // Get user ID
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const factCheck = {
      claim: data.claim,
      source: data.source,
      status: 'pending',
      evidence: data.evidence?.map((e: { url: string; description: string; type: string }) => ({
        ...e,
        submittedBy: user._id,
        submittedAt: new Date()
      })) || [],
      votes: [],
      category: data.category || 'rumor',
      priority: data.priority || 'medium',
      submittedBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('factchecks').insertOne(factCheck)

    return NextResponse.json({ 
      message: 'Fact-check submitted successfully',
      factCheckId: result.insertedId 
    })
  } catch {
    return NextResponse.json({ error: 'Failed to submit fact-check' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('protest-org')

    const factChecks = await db.collection('factchecks')
      .find({ status: { $in: ['pending', 'verified', 'false'] } })
      .sort({ priority: -1, createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ factChecks })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch fact-checks' }, { status: 500 })
  }
}
