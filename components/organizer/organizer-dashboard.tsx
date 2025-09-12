'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, MessageSquare, BarChart3, Settings, Bell } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Stats {
  totalGroups: number
  totalEvents: number
  totalMembers: number
  activeChats: number
}

export default function OrganizerDashboard() {
  const [stats, setStats] = useState<Stats>({ totalGroups: 0, totalEvents: 0, totalMembers: 0, activeChats: 0 })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    fetchStats()
    fetchRecentActivity()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/organizer/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/organizer/activity')
      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    }
  }

  const sendBroadcast = async () => {
    // Implementation for sending broadcast messages
    console.log('Sending broadcast message')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Organizer Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={sendBroadcast}>
            <Bell className="h-4 w-4 mr-2" />
            Broadcast
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold">{stats.totalGroups}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Events Created</p>
              <p className="text-2xl font-bold">{stats.totalEvents}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Chats</p>
              <p className="text-2xl font-bold">{stats.activeChats}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <Badge variant="secondary">{activity.type}</Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
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
            <span className="text-sm">Manage Groups</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Calendar className="h-6 w-6 mb-2" />
            <span className="text-sm">Schedule Event</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <MessageSquare className="h-6 w-6 mb-2" />
            <span className="text-sm">Send Message</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <BarChart3 className="h-6 w-6 mb-2" />
            <span className="text-sm">View Analytics</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
