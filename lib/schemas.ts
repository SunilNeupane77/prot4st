import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Helper function to handle MongoDB ObjectId validation
const objectIdSchema = z.custom<ObjectId>((val) => {
  try {
    if (val instanceof ObjectId) return true;
    if (typeof val === 'string' && ObjectId.isValid(val)) return true;
    return false;
  } catch {
    return false;
  }
}, 'Invalid ObjectID');

// Base schemas
export const profileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  displayName: z.string().optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }).optional(),
  preferences: z.object({
    notifications: z.object({
      email: z.boolean().default(true),
      sms: z.boolean().default(false),
      push: z.boolean().default(true),
      emergencyAlerts: z.boolean().default(true)
    }).optional(),
    privacy: z.object({
      profileVisibility: z.enum(['public', 'members', 'private']).default('members'),
      locationSharing: z.boolean().default(false),
      contactSharing: z.boolean().default(false)
    }).optional(),
    communication: z.object({
      language: z.string().default('en'),
      timezone: z.string().default('UTC')
    }).optional()
  }).optional()
});

export const securitySchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  lastLogin: z.date().optional(),
  loginAttempts: z.number().default(0),
  lockedUntil: z.date().optional()
});

// User schema
export const userSchema = z.object({
  _id: objectIdSchema.optional(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(['organizer', 'participant', 'admin']).default('participant'),
  verified: z.boolean().default(false),
  profile: profileSchema,
  security: securitySchema,
  groups: z.array(objectIdSchema).default([]),
  events: z.array(objectIdSchema).optional().default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  needsRoleSelection: z.boolean().default(false)
});

// Message schema
export const messageSchema = z.object({
  _id: objectIdSchema.optional(),
  senderId: objectIdSchema,
  groupId: objectIdSchema.optional(),
  recipientId: objectIdSchema.optional(),
  content: z.string(),
  type: z.enum(['text', 'image', 'location', 'alert', 'file']).default('text'),
  metadata: z.object({
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional(),
    alertLevel: z.enum(['low', 'medium', 'high', 'critical']).optional()
  }).optional(),
  encrypted: z.boolean().default(true),
  edited: z.boolean().default(false),
  editedAt: z.date().optional(),
  replyTo: objectIdSchema.optional(),
  reactions: z.array(z.object({
    userId: objectIdSchema,
    emoji: z.string()
  })).default([]),
  readBy: z.array(z.object({
    userId: objectIdSchema,
    readAt: z.date()
  })).default([]),
  timestamp: z.date().default(() => new Date()),
  expiresAt: z.date().optional()
});

// Group schema
export const groupSchema = z.object({
  _id: objectIdSchema.optional(),
  name: z.string().min(3).max(100),
  description: z.string(),
  type: z.enum(['public', 'private', 'secret']).default('private'),
  adminId: objectIdSchema,
  moderators: z.array(objectIdSchema).default([]),
  members: z.array(objectIdSchema).default([]),
  inviteCode: z.string().optional(),
  settings: z.object({
    allowInvites: z.boolean().default(true),
    requireApproval: z.boolean().default(false),
    messageRetention: z.number().default(30), // days
    maxMembers: z.number().default(100)
  }),
  tags: z.array(z.string()).default([]),
  location: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// Event schema
export const eventSchema = z.object({
  _id: objectIdSchema.optional(),
  title: z.string().min(3).max(100),
  description: z.string(),
  type: z.string().default('community'),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
  startDate: z.date(),
  endDate: z.date(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    venue: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional()
    }).optional()
  }),
  organizer: objectIdSchema,
  coOrganizers: z.array(objectIdSchema).default([]),
  participants: z.array(z.object({
    userId: objectIdSchema,
    status: z.enum(['confirmed', 'pending', 'declined']).default('pending'),
    registeredAt: z.date().default(() => new Date()),
    role: z.enum(['organizer', 'volunteer', 'participant']).default('participant')
  })).default([]),
  maxParticipants: z.number().optional(),
  requirements: z.array(z.string()).default([]),
  resources: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    quantity: z.number().optional()
  })).default([]),
  safety: z.object({
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
    safetyGuidelines: z.array(z.string()).default([])
  }).optional(),
  groupId: objectIdSchema.optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// Alert schema
export const alertSchema = z.object({
  _id: objectIdSchema.optional(),
  title: z.string().min(3).max(100),
  message: z.string(),
  type: z.enum(['safety', 'info', 'warning', 'emergency']).default('info'),
  severity: z.enum(['info', 'low', 'medium', 'high', 'critical']).default('info'),
  location: z.object({
    address: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }).optional(),
  radius: z.number().optional(), // in meters
  targetAudience: z.enum(['all', 'organizers', 'specific']).default('all'),
  targetIds: z.array(objectIdSchema).default([]),
  expiresAt: z.date().optional(),
  actionRequired: z.boolean().default(false),
  actionUrl: z.string().optional(),
  sentBy: objectIdSchema,
  sentAt: z.date().default(() => new Date()),
  readBy: z.array(objectIdSchema).default([]),
  status: z.enum(['active', 'expired', 'cancelled']).default('active')
});

// Resource schema
export const resourceSchema = z.object({
  _id: objectIdSchema.optional(),
  name: z.string().min(3).max(100),
  type: z.enum(['hospital', 'legal', 'emergency', 'safe-house']),
  address: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  hours: z.string().optional(),
  verified: z.boolean().default(false),
  notes: z.string().optional(),
  createdBy: objectIdSchema,
  location: z.object({
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// FactCheck schema
export const factCheckSchema = z.object({
  _id: objectIdSchema.optional(),
  claim: z.string(),
  sources: z.array(z.string()).default([]),
  result: z.object({
    score: z.number(),
    status: z.enum(['verified', 'false', 'unverified', 'disputed']),
    confidence: z.number(),
    sources: z.array(z.string()),
    reasoning: z.array(z.string())
  }),
  submittedBy: objectIdSchema,
  timestamp: z.date().default(() => new Date()),
  communityVotes: z.array(z.object({
    userId: objectIdSchema,
    vote: z.enum(['true', 'false', 'unsure']),
    timestamp: z.date().default(() => new Date())
  })).default([]),
  reportCount: z.number().default(0)
});

// Types derived from schemas
export type User = z.infer<typeof userSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Group = z.infer<typeof groupSchema>;
export type Event = z.infer<typeof eventSchema>;
export type Alert = z.infer<typeof alertSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type FactCheck = z.infer<typeof factCheckSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Security = z.infer<typeof securitySchema>;
