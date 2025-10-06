import { encrypt } from '@/lib/encryption'
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

    const { recipientId, content, type = 'text' } = await request.json()
    
    const client = await clientPromise
    const db = client.db('protest-org')
    
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const encryptedContent = encrypt(content)
    
    const message = {
      senderId: new ObjectId(user._id),
      recipientId: new ObjectId(recipientId),
      content: encryptedContent,
      type,
      encrypted: true,
      read: false,
      timestamp: new Date()
    }
    
    const result = await db.collection('direct-messages').insertOne(message)
    
    return NextResponse.json({ 
      message: 'Message sent',
      messageId: result.insertedId 
    })
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const recipientId = searchParams.get('recipientId')
    
    const client = await clientPromise
    const db = client.db('protest-org')
    
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let query
    if (recipientId) {
      // Get conversation with specific user
      query = {
        $or: [
          { senderId: new ObjectId(user._id), recipientId: new ObjectId(recipientId) },
          { senderId: new ObjectId(recipientId), recipientId: new ObjectId(user._id) }
        ]
      }
    } else {
      // Get all conversations
      query = {
        $or: [
          { senderId: new ObjectId(user._id) },
          { recipientId: new ObjectId(user._id) }
        ]
      }
    }

    const messages = await db.collection('direct-messages')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray()

    // Mark messages as read
    if (recipientId) {
      await db.collection('direct-messages').updateMany(
        { 
          senderId: new ObjectId(recipientId),
          recipientId: new ObjectId(user._id),
          read: false
        },
        { $set: { read: true } }
      )
    }

    return NextResponse.json({ messages: messages.reverse() })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
