'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Bell, BookOpen, Heart } from 'lucide-react'

interface UserStats {
  joinedGroups: number
  attendingEvents: number
  messagesCount: number
  resourcesAdded: number
}

export default function ParticipantDashboard() {
  const [stats, setStats] = useState<UserStats>({ 
    joinedGroups: 0, 
    attendingEvents: 0, 
    messagesCount: 0, 
    resourcesAdded: 0 
  })
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    fetchUserStats()
    fetchUpcomingEvents()
    fetchNotifications()
  }, [])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/participant/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch('/api/participant/upcoming-events')
      if (response.ok) {
        const data = await response.json()
        setUpcomingEvents(data.events || [])
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/participant/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Dashboard</h2>
        <Button variant="outline">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Groups Joined</p>
              <p className="text-2xl font-bold">{stats.joinedGroups}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Events Attending</p>
              <p className="text-2xl font-bold">{stats.attendingEvents}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Messages Sent</p>
              <p className="text-2xl font-bold">{stats.messagesCount}</p>
            </div>
            <Bell className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resources Added</p>
              <p className="text-2xl font-bold">{stats.resourcesAdded}</p>
            </div>
            <Heart className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
        </h3>
        <div className="space-y-3">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.slice(0, 3).map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary">Attending</Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming events</p>
              <Button variant="outline" className="mt-2">Browse Events</Button>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Notifications */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Recent Notifications
        </h3>
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.slice(0, 5).map((notification, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No new notifications</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-20 flex-col">
            <Users className="h-6 w-6 mb-2" />
            <span className="text-sm">Join Group</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Calendar className="h-6 w-6 mb-2" />
            <span className="text-sm">Find Events</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <MapPin className="h-6 w-6 mb-2" />
            <span className="text-sm">Add Resource</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <BookOpen className="h-6 w-6 mb-2" />
            <span className="text-sm">Safety Guide</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
