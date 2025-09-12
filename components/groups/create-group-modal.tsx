'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onGroupCreated: () => void
}

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public',
    maxMembers: '100'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxMembers: parseInt(formData.maxMembers) || 100
        })
      })

      if (response.ok) {
        onGroupCreated()
        setFormData({ name: '', description: '', type: 'public', maxMembers: '100' })
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create group')
      }
    } catch (error) {
      setError('Failed to create group')
    }
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Create New Group</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Group Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <textarea
            name="description"
            placeholder="Group Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded min-h-[80px]"
            required
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="public">Public - Anyone can join</option>
            <option value="private">Private - Invite only</option>
            <option value="secret">Secret - Hidden from search</option>
          </select>

          <Input
            name="maxMembers"
            type="number"
            placeholder="Max Members"
            value={formData.maxMembers}
            onChange={handleChange}
            min="1"
            max="50000"
          />

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
