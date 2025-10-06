// import { ObjectId } from 'mongodb'

export interface Message {
  _id?: ObjectId
  senderId: ObjectId
  groupId: ObjectId
  content: string
  type: 'text' | 'image' | 'location' | 'alert' | 'file'
  metadata?: {
    fileName?: string
    fileSize?: number
    coordinates?: { lat: number; lng: number }
    alertLevel?: 'low' | 'medium' | 'high' | 'critical'
  }
  encrypted: boolean
  edited: boolean
  editedAt?: Date
  replyTo?: ObjectId
  reactions: { userId: ObjectId; emoji: string }[]
  readBy: { userId: ObjectId; readAt: Date }[]
  timestamp: Date
  expiresAt?: Date
}
