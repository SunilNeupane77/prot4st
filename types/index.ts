export interface User {
  _id?: string
  username: string
  email: string
  password: string
  role: 'organizer' | 'participant'
  verified: boolean
  createdAt: Date
}

export interface Message {
  _id?: string
  senderId: string
  groupId: string
  content: string
  encrypted: boolean
  timestamp: Date
  type: 'text' | 'location' | 'alert'
}

export interface Group {
  _id?: string
  name: string
  description: string
  adminId: string
  members: string[]
  isPrivate: boolean
  inviteCode?: string
  createdAt: Date
}

export interface Event {
  _id?: string
  title: string
  description: string
  location: string
  date: Date
  organizerId: string
  attendees: string[]
  isPublic: boolean
  resources: Resource[]
}

export interface Resource {
  _id?: string
  name: string
  type: 'hospital' | 'legal' | 'emergency' | 'safe-house'
  address: string
  phone: string
  coordinates: { lat: number; lng: number }
  verified: boolean
  notes?: string
}
