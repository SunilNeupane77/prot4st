import { ObjectId } from 'mongodb'

export interface Group {
  _id?: ObjectId
  name: string
  description: string
  type: 'public' | 'private' | 'secret'
  adminId: ObjectId
  moderators: ObjectId[]
  members: ObjectId[]
  inviteCode?: string
  settings: {
    allowInvites: boolean
    requireApproval: boolean
    messageRetention: number // days
    maxMembers: number
  }
  tags: string[]
  location?: string
  createdAt: Date
  updatedAt: Date
}
