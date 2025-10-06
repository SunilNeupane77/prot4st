'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Megaphone, Shield, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function RoleSelectionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  // const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<'participant' | 'organizer'>('participant')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session?.user?.email) {
      router.push('/auth')
      return
    }
    
    // If user already has a role and doesn't need role selection, redirect to dashboard
    if (session?.user?.role && session.user.needsRoleSelection === false) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  const handleRoleSelection = async () => {
    setLoading(true)
    try {
      console.log('Updating role to:', selectedRole)
      const response = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole })
      })

      const data = await response.json()
      console.log('Response:', data)

      if (response.ok) {
        toast.success('Role updated successfully!')
        // Force session refresh
        window.location.href = '/dashboard'
      } else {
        toast.error(data.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Role update error:', error)
      toast.error('Failed to update role')
    }
    setLoading(false)
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Welcome to Safe Protest Platform</h1>
          <p className="text-gray-600">Choose your role to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div 
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              selectedRole === 'participant' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedRole('participant')}
          >
            <Users className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Participant</h3>
            <p className="text-gray-600 text-sm">
              Join groups, participate in events, access resources, and stay informed about protests and community activities.
            </p>
            <ul className="mt-4 text-sm text-gray-500">
              <li>• Join existing groups</li>
              <li>• Participate in events</li>
              <li>• Access safety resources</li>
              <li>• Receive alerts and updates</li>
            </ul>
          </div>

          <div 
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              selectedRole === 'organizer' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedRole('organizer')}
          >
            <Megaphone className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Organizer</h3>
            <p className="text-gray-600 text-sm">
              Create and manage groups, organize events, coordinate protests, and lead community initiatives.
            </p>
            <ul className="mt-4 text-sm text-gray-500">
              <li>• Create and manage groups</li>
              <li>• Organize events and protests</li>
              <li>• Send alerts and notifications</li>
              <li>• Access advanced tools</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={handleRoleSelection}
            disabled={loading}
            className="px-8 py-3 text-lg"
          >
            {loading ? 'Setting up...' : `Continue as ${selectedRole === 'participant' ? 'Participant' : 'Organizer'}`}
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            You can change your role later in your profile settings
          </p>
        </div>
      </Card>
    </div>
  )
}
