import { FactCheckAlgorithm } from '@/lib/fact-check-algorithm'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { claim, sources = [] } = await request.json()
    
    if (!claim) {
      return NextResponse.json({ error: 'Claim text required' }, { status: 400 })
    }

    const factChecker = new FactCheckAlgorithm()
    const result = await factChecker.checkClaim(claim, sources)

    const client = await clientPromise
    const db = client.db('protest-org')
    
    const user = await db.collection('users').findOne({ email: session.user.email })
    
    // Store fact check result
    const factCheckRecord = {
      claim,
      sources,
      result,
      submittedBy: new ObjectId(user?._id),
      timestamp: new Date(),
      communityVotes: [],
      reportCount: 0
    }

    const insertResult = await db.collection('fact-checks').insertOne(factCheckRecord)
    
    return NextResponse.json({ 
      id: insertResult.insertedId,
      ...result
    })
  } catch {
    return NextResponse.json({ error: 'Fact check failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    const client = await clientPromise
    const db = client.db('protest-org')
    
    let searchQuery = {}
    if (query) {
      searchQuery = {
        $or: [
          { claim: { $regex: query, $options: 'i' } },
          { 'sources': { $regex: query, $options: 'i' } }
        ]
      }
    }

    const factChecks = await db.collection('fact-checks')
      .find(searchQuery)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({ factChecks })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch fact checks' }, { status: 500 })
  }
}
