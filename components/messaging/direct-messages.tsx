'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Users, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface DirectMessage {
  _id: string
  senderId: string
  recipientId: string
  content: string
  timestamp: string
  read: boolean
  sender?: {
    username: string
    firstName: string
  }
}

interface Contact {
  _id: string
  username: string
  firstName: string
  lastName: string
  lastMessage?: string
  unreadCount: number
}

export default function DirectMessages() {
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id)
    }
  }, [selectedContact])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/participant/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    }
  }

  const fetchMessages = async (recipientId: string) => {
    try {
      const response = await fetch(`/api/participant/messages?recipientId=${recipientId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/participant/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedContact._id,
          content: newMessage,
          type: 'text'
        })
      })
      
      if (response.ok) {
        setNewMessage('')
        fetchMessages(selectedContact._id)
        fetchContacts() // Refresh contacts to update last message
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
    setLoading(false)
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) return
    
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        // Add search results to contacts if not already present
        const newContacts = data.users.filter((user: any) => 
          !contacts.find(contact => contact._id === user._id)
        )
        setContacts(prev => [...prev, ...newContacts.map((user: any) => ({
          ...user,
          unreadCount: 0
        }))])
      }
    } catch (error) {
      console.error('Failed to search users:', error)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.firstName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="grid gap-4 md:grid-cols-3 h-96">
      {/* Contacts List */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contacts
          </h3>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="flex-1"
            />
            <Button size="sm" onClick={searchUsers}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact._id}
              onClick={() => setSelectedContact(contact)}
              className={`p-3 rounded cursor-pointer transition-colors ${
                selectedContact?._id === contact._id
                  ? 'bg-blue-100 border border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">
                    {contact.firstName} {contact.lastName}
                  </div>
                  <div className="text-xs text-gray-600">@{contact.username}</div>
                  {contact.lastMessage && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {contact.lastMessage}
                    </div>
                  )}
                </div>
                {contact.unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {contact.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          
          {filteredContacts.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No contacts found</p>
              <p className="text-xs text-gray-400 mt-1">Search for users to start messaging</p>
            </div>
          )}
        </div>
      </Card>

      {/* Messages */}
      <div className="md:col-span-2">
        {selectedContact ? (
          <Card className="p-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="font-medium">
                {selectedContact.firstName} {selectedContact.lastName}
              </span>
              <span className="text-sm text-gray-500">@{selectedContact.username}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map((message) => {
                const isOwn = message.senderId === session?.user?.id
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70 block mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center h-full flex items-center justify-center">
            <div>
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a contact to start messaging</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
