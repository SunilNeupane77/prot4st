'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
// import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@radix-ui/react-switch'
import { Bell, Camera, Settings, Shield, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface UserProfile {
  _id?: string
  username: string
  email: string
  role: 'organizer' | 'participant' | 'admin'
  verified: boolean
  profile: {
    firstName: string
    lastName: string
    phone?: string
    location?: string
    bio?: string
    // Additional fields for UI that aren't in the backend model
    avatar?: string
    preferences?: {
      notifications?: {
        email: boolean
        sms: boolean
        emergencyAlerts: boolean
      }
      privacy?: {
        profileVisibility: 'public' | 'members' | 'private'
        locationSharing: boolean
      }
    }
  }
  security?: {
    twoFactorEnabled: boolean
  }
}

export default function ProfileForm() {
  // const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (err) {
      toast.error('Failed to load profile')
      console.error('Error loading profile:', err)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        toast.success('Profile updated successfully')
        fetchProfile()
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      toast.error('Failed to update profile')
    }
    setLoading(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)

    setLoading(true)
    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast.success('Avatar updated successfully')
        fetchProfile()
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to upload avatar')
      }
    } catch (err) {
      console.error('Error uploading avatar:', err)
      toast.error('Failed to upload avatar')
    }
    setLoading(false)
  }

  if (!user) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Settings className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            
            {/* Avatar Section */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user.profile.avatar ? (
                    // Using a div with background image instead of img tag to avoid nextjs warning
                    <div 
                      className="w-full h-full bg-cover bg-center" 
                      style={{ backgroundImage: `url(${user.profile.avatar})` }}
                      aria-label="User avatar"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer" aria-label="Upload profile picture">
                  <Camera className="h-3 w-3 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    aria-label="Upload profile picture"
                    title="Upload profile picture"
                  />
                </label>
              </div>
              <div>
                <h4 className="font-medium">{user.profile.firstName} {user.profile.lastName}</h4>
                <p className="text-sm text-gray-600">@{user.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                <Input
                  id="firstName"
                  value={user.profile.firstName}
                  onChange={(e) => setUser({
                    ...user,
                    profile: { ...user.profile, firstName: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                <Input
                  id="lastName"
                  value={user.profile.lastName}
                  onChange={(e) => setUser({
                    ...user,
                    profile: { ...user.profile, lastName: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">Username</label>
                <Input
                  id="username"
                  value={user.username}
                  onChange={(e) => setUser({
                    ...user,
                    username: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                <Input
                  id="phone"
                  value={user.profile.phone || ''}
                  onChange={(e) => setUser({
                    ...user,
                    profile: { ...user.profile, phone: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label htmlFor="bio" className="block text-sm font-medium">Bio</label>
              <textarea
                id="bio"
                className="w-full p-2 border rounded-md"
                rows={3}
                value={user.profile.bio || ''}
                onChange={(e) => setUser({
                  ...user,
                  profile: { ...user.profile, bio: e.target.value }
                })}
                placeholder="Tell us about yourself..."
              />
            </div>

            <Button onClick={() => updateProfile(user)} disabled={loading} className="mt-4">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Location</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                <Input
                  id="location"
                  placeholder="City, State, Country"
                  value={user.profile.location || ''}
                  onChange={(e) => setUser({
                    ...user,
                    profile: {
                      ...user.profile,
                      location: e.target.value
                    }
                  })}
                />
              </div>
              <p className="text-xs text-gray-500">
                This location will be used for finding nearby resources and events.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Role Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="font-medium">Current Role: </div>
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="font-medium">Account Status: </div>
                <Badge variant={user.verified ? "success" : "secondary"}>
                  {user.verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              
              <div className="mt-2 text-sm text-gray-500">
                Your role determines what features you can access on the platform.
                {!user.verified && " Please verify your account to access all features."}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <Switch
                  checked={user.profile.preferences.notifications.email}
                  onCheckedChange={(checked) => setUser({
                    ...user,
                    profile: {
                      ...user.profile,
                      preferences: {
                        ...user.profile.preferences,
                        notifications: { ...user.profile.preferences.notifications, email: checked }
                      }
                    }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">SMS Notifications</h4>
                  <p className="text-sm text-gray-600">Receive updates via SMS</p>
                </div>
                <Switch
                  checked={user.profile.preferences.notifications.sms}
                  onCheckedChange={(checked) => setUser({
                    ...user,
                    profile: {
                      ...user.profile,
                      preferences: {
                        ...user.profile.preferences,
                        notifications: { ...user.profile.preferences.notifications, sms: checked }
                      }
                    }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Emergency Alerts</h4>
                  <p className="text-sm text-gray-600">Critical safety notifications</p>
                </div>
                <Switch
                  checked={user.profile.preferences.notifications.emergencyAlerts}
                  onCheckedChange={(checked) => setUser({
                    ...user,
                    profile: {
                      ...user.profile,
                      preferences: {
                        ...user.profile.preferences,
                        notifications: { ...user.profile.preferences.notifications, emergencyAlerts: checked }
                      }
                    }
                  })}
                />
              </div>
            </div>
            <Button onClick={() => updateProfile(user)} disabled={loading} className="mt-4">
              Save Preferences
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={user.profile.preferences.privacy.profileVisibility}
                  onChange={(e) => setUser({
                    ...user,
                    profile: {
                      ...user.profile,
                      preferences: {
                        ...user.profile.preferences,
                        privacy: {
                          ...user.profile.preferences.privacy,
                          profileVisibility: e.target.value as 'public' | 'members' | 'private'
                        }
                      }
                    }
                  })}
                >
                  <option value="public">Public</option>
                  <option value="members">Members Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Location Sharing</h4>
                  <p className="text-sm text-gray-600">Share your location with group members</p>
                </div>
                <Switch
                  checked={user.profile.preferences.privacy.locationSharing}
                  onCheckedChange={(checked) => setUser({
                    ...user,
                    profile: {
                      ...user.profile,
                      preferences: {
                        ...user.profile.preferences,
                        privacy: { ...user.profile.preferences.privacy, locationSharing: checked }
                      }
                    }
                  })}
                />
              </div>
            </div>
            <Button onClick={() => updateProfile(user)} disabled={loading} className="mt-4">
              Save Privacy Settings
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
