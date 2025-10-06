// import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  username: string
  email: string
  password: string
  role: 'participant' | 'organizer' | 'admin'
  verified: boolean
  profile: UserProfile
  security: SecuritySettings
  groups: ObjectId[]
  events: ObjectId[]
  createdAt: Date
  updatedAt: Date
  googleId?: string
  lastActive?: Date
  status: 'active' | 'suspended' | 'banned'
}

export interface UserProfile {
  firstName: string
  lastName: string
  displayName?: string
  avatar?: string
  phone?: string
  location: Location
  bio?: string
  skills: string[]
  languages: string[]
  emergencyContact: EmergencyContact
  preferences: UserPreferences
}

export interface Location {
  address?: string
  city?: string
  state?: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface EmergencyContact {
  name?: string
  phone?: string
  relationship?: string
}

export interface UserPreferences {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    emergencyAlerts: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'members' | 'private'
    locationSharing: boolean
    contactSharing: boolean
  }
  communication: {
    language: string
    timezone: string
  }
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  lastLogin: Date
  loginAttempts: number
  passwordChangedAt?: Date
  securityQuestions?: SecurityQuestion[]
}

export interface SecurityQuestion {
  question: string
  answer: string
}

export interface Group {
  _id?: ObjectId
  name: string
  description: string
  type: 'public' | 'private' | 'secret'
  category: 'protest' | 'community' | 'legal' | 'medical' | 'media'
  avatar?: string
  banner?: string
  location: Location
  members: GroupMember[]
  admins: ObjectId[]
  moderators: ObjectId[]
  rules: string[]
  tags: string[]
  settings: GroupSettings
  stats: GroupStats
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'suspended' | 'archived'
}

export interface GroupMember {
  userId: ObjectId
  role: 'member' | 'moderator' | 'admin'
  joinedAt: Date
  permissions: string[]
}

export interface GroupSettings {
  requireApproval: boolean
  allowInvites: boolean
  messageRetention: number // days
  maxMembers?: number
}

export interface GroupStats {
  memberCount: number
  messageCount: number
  eventCount: number
  lastActivity: Date
}

export interface Event {
  _id?: ObjectId
  title: string
  description: string
  type: 'protest' | 'meeting' | 'training' | 'community' | 'emergency'
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled'
  startDate: Date
  endDate: Date
  location: EventLocation
  organizer: ObjectId
  coOrganizers: ObjectId[]
  participants: EventParticipant[]
  maxParticipants?: number
  requirements: string[]
  resources: EventResource[]
  safety: SafetyInfo
  media: MediaFile[]
  tags: string[]
  visibility: 'public' | 'members' | 'private'
  groupId?: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface EventLocation extends Location {
  venue?: string
  meetingPoint?: string
  alternativeLocations?: Location[]
}

export interface EventParticipant {
  userId: ObjectId
  status: 'registered' | 'confirmed' | 'attended' | 'cancelled'
  registeredAt: Date
  role?: string
  notes?: string
}

export interface EventResource {
  type: 'legal' | 'medical' | 'supplies' | 'transport' | 'communication'
  name: string
  description?: string
  contact?: string
  location?: Location
  availability: string
}

export interface SafetyInfo {
  riskLevel: 'low' | 'medium' | 'high'
  safetyGuidelines: string[]
  emergencyContacts: EmergencyContact[]
  evacuationPlan?: string
  legalObservers: ObjectId[]
  medicalSupport: ObjectId[]
}

export interface Message {
  _id?: ObjectId
  content: string
  encryptedContent?: string
  sender: ObjectId
  groupId?: ObjectId
  eventId?: ObjectId
  recipientId?: ObjectId // for direct messages
  type: 'text' | 'image' | 'file' | 'location' | 'alert'
  attachments: MediaFile[]
  replyTo?: ObjectId
  mentions: ObjectId[]
  priority: 'normal' | 'high' | 'urgent'
  readBy: MessageRead[]
  edited: boolean
  editedAt?: Date
  createdAt: Date
  deletedAt?: Date
}

export interface MessageRead {
  userId: ObjectId
  readAt: Date
}

export interface MediaFile {
  _id?: ObjectId
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnail?: string
  uploadedBy: ObjectId
  uploadedAt: Date
  metadata?: {
    width?: number
    height?: number
    duration?: number
  }
}

export interface Resource {
  _id?: ObjectId
  name: string
  type: 'legal' | 'medical' | 'shelter' | 'food' | 'transport' | 'communication'
  description: string
  contact: ContactInfo
  location: Location
  availability: AvailabilitySchedule
  capacity?: number
  requirements?: string[]
  tags: string[]
  verified: boolean
  verifiedBy?: ObjectId
  verifiedAt?: Date
  rating: number
  reviews: ResourceReview[]
  addedBy: ObjectId
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'inactive' | 'full'
}

export interface ContactInfo {
  phone?: string
  email?: string
  website?: string
  socialMedia?: {
    platform: string
    handle: string
  }[]
}

export interface AvailabilitySchedule {
  always: boolean
  hours?: {
    [key: string]: { // day of week
      open: string
      close: string
    }
  }
  emergencyOnly?: boolean
}

export interface ResourceReview {
  userId: ObjectId
  rating: number
  comment?: string
  createdAt: Date
}

export interface FactCheck {
  _id?: ObjectId
  claim: string
  source?: string
  status: 'pending' | 'verified' | 'false' | 'misleading' | 'unverified'
  evidence: Evidence[]
  votes: FactCheckVote[]
  verifiedBy?: ObjectId[]
  verificationDate?: Date
  category: 'event' | 'news' | 'rumor' | 'safety' | 'legal'
  priority: 'low' | 'medium' | 'high' | 'critical'
  submittedBy: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface Evidence {
  type: 'link' | 'document' | 'image' | 'video' | 'witness'
  content: string
  source?: string
  credibility: number
  submittedBy: ObjectId
  submittedAt: Date
}

export interface FactCheckVote {
  userId: ObjectId
  vote: 'true' | 'false' | 'unsure'
  reasoning?: string
  votedAt: Date
}

export interface Alert {
  _id?: ObjectId
  title: string
  message: string
  type: 'safety' | 'legal' | 'weather' | 'event' | 'system'
  severity: 'info' | 'warning' | 'critical' | 'emergency'
  location?: Location
  radius?: number // km
  targetAudience: 'all' | 'group' | 'event' | 'location'
  targetIds?: ObjectId[]
  expiresAt?: Date
  actionRequired?: boolean
  actionUrl?: string
  sentBy: ObjectId
  sentAt: Date
  readBy: ObjectId[]
  status: 'active' | 'expired' | 'cancelled'
}

export interface Notification {
  _id?: ObjectId
  userId: ObjectId
  title: string
  message: string
  type: 'message' | 'event' | 'group' | 'alert' | 'system'
  data?: Record<string, unknown>
  read: boolean
  actionUrl?: string
  createdAt: Date
  readAt?: Date
}

export interface AuditLog {
  _id?: ObjectId
  userId: ObjectId
  action: string
  resource: string
  resourceId?: ObjectId
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}
