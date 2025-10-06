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

    const resource = {
      name: data.name,
      type: data.type,
      description: data.description,
      contact: {
        phone: data.contact?.phone,
        email: data.contact?.email,
        website: data.contact?.website,
        socialMedia: data.contact?.socialMedia || []
      },
      location: {
        address: data.location?.address,
        city: data.location?.city,
        state: data.location?.state,
        country: data.location?.country,
        coordinates: data.location?.coordinates
      },
      availability: {
        always: data.availability?.always || false,
        hours: data.availability?.hours || {},
        emergencyOnly: data.availability?.emergencyOnly || false
      },
      capacity: data.capacity,
      requirements: data.requirements || [],
      tags: data.tags || [],
      verified: false,
      rating: 0,
      reviews: [],
      addedBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    }

    const result = await db.collection('resources').insertOne(resource)

    return NextResponse.json({ 
      message: 'Resource added successfully',
      resourceId: result.insertedId 
    })
  } catch {
    return NextResponse.json({ error: 'Failed to add resource' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const city = searchParams.get('city')
    const limit = parseInt(searchParams.get('limit') || '20')

    const client = await clientPromise
    const db = client.db('protest-org')

    const filter: Record<string, unknown> = { status: 'active' }
    if (type) filter.type = type
    if (city) filter['location.city'] = new RegExp(city, 'i')

    const resources = await db.collection('resources')
      .find(filter)
      .limit(limit)
      .sort({ rating: -1, createdAt: -1 })
      .toArray()

    return NextResponse.json({ resources })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
  }
}
