'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Plus, Edit, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import CreateEventModal from './create-event-modal'

interface Event {
  _id: string
  title: string
  description: string
  location: string
  date: string
  organizerId: string
  attendees: string[]
  isPublic: boolean
}

export default function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: session } = useSession()

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const joinEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error('Failed to join event:', error)
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const handleEventCreated = () => {
    fetchEvents()
    setShowCreateModal(false)
  }

  if (loading) return <div>Loading events...</div>

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Events
          </h2>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
        
        {events.map((event) => (
          <Card key={event._id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-gray-600 mt-1">{event.description}</p>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {event.attendees.length} attending
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {session?.user?.id === event.organizerId ? (
                  <>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteEvent(event._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => joinEvent(event._id)} size="sm">
                    Join Event
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {events.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">No events scheduled</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create First Event
            </Button>
          </Card>
        )}
      </div>

      <CreateEventModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
      />
    </>
  )
}
