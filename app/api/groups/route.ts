import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, type = 'public', maxMembers = 100 } = await request.json()
    
    const client = await clientPromise
    const db = client.db('protest-org')
    
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const group = {
      name,
      description,
      type,
      adminId: new ObjectId(user._id),
      moderators: [],
      members: [new ObjectId(user._id)],
      inviteCode: type === 'private' ? Math.random().toString(36).substring(2, 15) : undefined,
      settings: {
        allowInvites: true,
        requireApproval: type === 'private',
        messageRetention: 30,
        maxMembers
      },
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('groups').insertOne(group)
    
    await db.collection('users').updateOne(
      { _id: new ObjectId(user._id) },
      { $push: { groups: result.insertedId } }
    )
    
    return NextResponse.json({ 
      message: 'Group created',
      groupId: result.insertedId 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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
    
    const groups = await db.collection('groups')
      .find({ 
        $or: [
          { members: new ObjectId(user._id) },
          { type: 'public' }
        ]
      })
      .sort({ updatedAt: -1 })
      .toArray()
    
    return NextResponse.json({ groups })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}
