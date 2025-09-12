import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { encrypt, decrypt } from '@/lib/encryption'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId, content, type = 'text', metadata } = await request.json()
    
    const client = await clientPromise
    const db = client.db('protest-org')
    
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Verify user is member of group
    const group = await db.collection('groups').findOne({
      _id: new ObjectId(groupId),
      members: new ObjectId(user._id)
    })
    
    if (!group) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    const encryptedContent = encrypt(content)
    
    const message = {
      senderId: new ObjectId(user._id),
      groupId: new ObjectId(groupId),
      content: encryptedContent,
      type,
      metadata: metadata || {},
      encrypted: true,
      edited: false,
      reactions: [],
      readBy: [{ userId: new ObjectId(user._id), readAt: new Date() }],
      timestamp: new Date(),
      expiresAt: group.settings.messageRetention > 0 
        ? new Date(Date.now() + group.settings.messageRetention * 24 * 60 * 60 * 1000)
        : undefined
    }
    
    const result = await db.collection('messages').insertOne(message)
    
    // Update group last activity
    await db.collection('groups').updateOne(
      { _id: new ObjectId(groupId) },
      { $set: { updatedAt: new Date() } }
    )
    
    return NextResponse.json({ 
      message: 'Message sent',
      messageId: result.insertedId 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const before = searchParams.get('before')
    
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID required' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('protest-org')
    
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Verify user access
    const group = await db.collection('groups').findOne({
      _id: new ObjectId(groupId),
      members: new ObjectId(user._id)
    })
    
    if (!group) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    const query: any = { groupId: new ObjectId(groupId) }
    if (before) {
      query.timestamp = { $lt: new Date(before) }
    }
    
    const messages = await db.collection('messages')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray()
    
    // Decrypt messages and populate sender info
    const decryptedMessages = await Promise.all(
      messages.map(async (msg) => {
        const sender = await db.collection('users').findOne(
          { _id: msg.senderId },
          { projection: { username: 1, profile: 1 } }
        )
        
        return {
          ...msg,
          content: msg.encrypted ? decrypt(msg.content) : msg.content,
          sender: sender ? {
            username: sender.username,
            firstName: sender.profile?.firstName
          } : null
        }
      })
    )
    
    // Mark messages as read
    await db.collection('messages').updateMany(
      { 
        groupId: new ObjectId(groupId),
        'readBy.userId': { $ne: new ObjectId(user._id) }
      },
      { 
        $push: { 
          readBy: { userId: new ObjectId(user._id), readAt: new Date() }
        }
      }
    )
    
    return NextResponse.json({ messages: decryptedMessages.reverse() })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
