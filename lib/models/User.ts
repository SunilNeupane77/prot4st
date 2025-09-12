import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  username: string
  email: string
  password: string
  role: 'organizer' | 'participant' | 'admin'
  verified: boolean
  profile: {
    firstName: string
    lastName: string
    phone?: string
    location?: string
    bio?: string
  }
  security: {
    twoFactorEnabled: boolean
    lastLogin: Date
    loginAttempts: number
    lockedUntil?: Date
  }
  groups: ObjectId[]
  createdAt: Date
  updatedAt: Date
}
