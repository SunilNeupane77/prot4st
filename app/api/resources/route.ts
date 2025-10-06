import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { name, type, address, phone, coordinates, notes } = await request.json()
    
    const client = await clientPromise
    const db = client.db('protest-org')
    
    const resource = {
      name,
      type,
      address,
      phone,
      coordinates,
      verified: false,
      notes,
      createdAt: new Date()
    }
    
    const result = await db.collection('resources').insertOne(resource)
    
    return NextResponse.json({ 
      message: 'Resource added',
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
    
    const client = await clientPromise
    const db = client.db('protest-org')
    
    const query = type ? { type } : {}
    const resources = await db.collection('resources')
      .find(query)
      .toArray()
    
    return NextResponse.json({ resources })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
  }
}
