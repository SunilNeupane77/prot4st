'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

interface AddResourceModalProps {
  isOpen: boolean
  onClose: () => void
  onResourceAdded: () => void
}

export default function AddResourceModal({ isOpen, onClose, onResourceAdded }: AddResourceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'hospital',
    address: '',
    phone: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          coordinates: { lat: 0, lng: 0 } // Default coordinates
        })
      })

      if (response.ok) {
        onResourceAdded()
        setFormData({ name: '', type: 'hospital', address: '', phone: '', notes: '' })
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to add resource')
      }
    } catch {
      setError('Failed to add resource')
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
          <h2 className="text-xl font-bold">Add Resource</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Resource Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="hospital">Hospital</option>
            <option value="legal">Legal Aid</option>
            <option value="emergency">Emergency Service</option>
            <option value="safe-house">Safe House</option>
          </select>

          <Input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <Input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <textarea
            name="notes"
            placeholder="Additional Notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded min-h-[60px]"
          />

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Resource'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
