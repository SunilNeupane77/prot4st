'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SecureChat from '@/components/messaging/secure-chat'
import DirectMessages from '@/components/messaging/direct-messages'
import GroupSelector from '@/components/groups/group-selector'
import EventCalendar from '@/components/events/event-calendar'
import CalendarView from '@/components/calendar/calendar-view'
import ResourceMap from '@/components/resources/resource-map'
import RumorChecker from '@/components/fact-check/rumor-checker'
import SafetyGuide from '@/components/safety/safety-guide'
import OrganizerDashboard from '@/components/organizer/organizer-dashboard'
import ParticipantDashboard from '@/components/participant/participant-dashboard'
import CreateEventModal from '@/components/events/create-event-modal'
import { useSession } from 'next-auth/react'
import { Shield, MessageSquare, Calendar, Map, AlertTriangle, Search, LogOut, Home, CalendarDays, BookOpen, Mail } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [userRole, setUserRole] = useState<string>('participant')
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth')
      return
    }
    
    // Fetch user role from database
    fetchUserRole()
  }, [session, status, router])

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.user?.role || 'participant')
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const handleEventCreated = () => {
    setShowCreateEventModal(false)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p>Loading secure platform...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold">Safe Protest Platform</h1>
                <p className="text-gray-600">
                  Welcome back, {session.user?.name || session.user?.email} 
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {userRole}
                  </span>
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="direct-messages" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="fact-check" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Fact Check
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Safety
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {userRole === 'organizer' ? (
              <OrganizerDashboard />
            ) : (
              <ParticipantDashboard />
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <GroupSelector 
                selectedGroupId={selectedGroupId}
                onGroupSelect={setSelectedGroupId}
              />
              <div className="md:col-span-2">
                {selectedGroupId ? (
                  <SecureChat groupId={selectedGroupId} />
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-gray-500">Select a group to start messaging</p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="direct-messages">
            <DirectMessages />
          </TabsContent>

          <TabsContent value="events">
            <EventCalendar />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView onCreateEvent={() => setShowCreateEventModal(true)} />
          </TabsContent>

          <TabsContent value="resources">
            <ResourceMap />
          </TabsContent>

          <TabsContent value="fact-check">
            <RumorChecker />
          </TabsContent>

          <TabsContent value="safety">
            <SafetyGuide />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Emergency Alerts
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-red-800">High Priority Alert</div>
                  <div className="text-sm text-red-600 mt-1">
                    Police activity reported near City Hall. Exercise caution.
                  </div>
                  <div className="text-xs text-red-500 mt-2">2 minutes ago</div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-medium text-yellow-800">Weather Update</div>
                  <div className="text-sm text-yellow-600 mt-1">
                    Rain expected this afternoon. Bring protective gear.
                  </div>
                  <div className="text-xs text-yellow-500 mt-2">1 hour ago</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-blue-800">Safety Reminder</div>
                  <div className="text-sm text-blue-600 mt-1">
                    Remember to stay hydrated and keep emergency contacts handy.
                  </div>
                  <div className="text-xs text-blue-500 mt-2">1 hour ago</div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateEventModal 
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
}
