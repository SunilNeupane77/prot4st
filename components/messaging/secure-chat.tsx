'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MoreVertical, Send, Shield } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Message {
  _id: string
  content: string
  timestamp: string
  sender: {
    username: string
    firstName: string
  }
  type: string
}

export default function SecureChat({ groupId }: { groupId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !session?.user) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          content: newMessage,
          type: 'text'
        })
      })
      
      if (response.ok) {
        setNewMessage('')
        fetchMessages()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
    setLoading(false)
  }

  const fetchMessages = useCallback(async () => {
    if (!session?.user) return
    
    try {
      const response = await fetch(`/api/messages?groupId=${groupId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }, [session, groupId])

  useEffect(() => {
    if (session?.user && groupId) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [groupId, session, fetchMessages])

  if (!session?.user) {
    return (
      <Card className="p-4 h-96 flex items-center justify-center">
        <p className="text-gray-500">Please log in to access chat</p>
      </Card>
    )
  }

  return (
    <Card className="p-4 h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Encrypted Chat</span>
        </div>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((message) => {
          const isOwn = message.sender?.username === session.user?.username || 
                       message.sender?.username === session.user?.name
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
                {!isOwn && (
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {message.sender?.firstName || message.sender?.username || 'Unknown'}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 block mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type encrypted message..."
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
        />
        <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
