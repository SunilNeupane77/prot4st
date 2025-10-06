'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Edit, Heart, MapPin, Phone, Plus, Scale, Shield, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SafetyTip {
  id: string
  category: 'before' | 'during' | 'after' | 'legal' | 'medical'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

interface EmergencyContact {
  name: string
  phone: string
  type: string
}

interface SafetyData {
  emergencyReminder: string
  safetyTips: SafetyTip[]
  emergencyContacts: EmergencyContact[]
  rights: Array<{ title: string; description: string; category: string }>
  checklistItems: string[]
}

export default function SafetyGuide() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [safetyData, setSafetyData] = useState<SafetyData>({
    emergencyReminder: '',
    safetyTips: [],
    emergencyContacts: [],
    rights: [],
    checklistItems: []
  })
  const [isEditing, setIsEditing] = useState(false)
  const [userRole, setUserRole] = useState('participant')
  // const { data: session } = useSession()

  useEffect(() => {
    fetchSafetyData()
    fetchUserRole()
  }, [])

  const fetchSafetyData = async () => {
    try {
      const response = await fetch('/api/safety')
      if (response.ok) {
        const data = await response.json()
        setSafetyData(data)
      }
    } catch (error) {
      console.error('Failed to fetch safety data:', error)
    }
  }

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

  const saveSafetyData = async () => {
    try {
      const response = await fetch('/api/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safetyData)
      })
      
      if (response.ok) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save safety data:', error)
    }
  }

  const addSafetyTip = () => {
    const newTip: SafetyTip = {
      id: Date.now().toString(),
      category: 'before',
      title: 'New Safety Tip',
      description: 'Enter description...',
      priority: 'medium'
    }
    setSafetyData(prev => ({
      ...prev,
      safetyTips: [...prev.safetyTips, newTip]
    }))
  }

  const updateSafetyTip = (id: string, field: keyof SafetyTip, value: string) => {
    setSafetyData(prev => ({
      ...prev,
      safetyTips: prev.safetyTips.map(tip => 
        tip.id === id ? { ...tip, [field]: value } : tip
      )
    }))
  }

  const deleteSafetyTip = (id: string) => {
    setSafetyData(prev => ({
      ...prev,
      safetyTips: prev.safetyTips.filter(tip => tip.id !== id)
    }))
  }

  const addEmergencyContact = () => {
    const newContact: EmergencyContact = {
      name: 'New Contact',
      phone: '',
      type: 'Emergency'
    }
    setSafetyData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact]
    }))
  }

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setSafetyData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }))
  }

  const deleteEmergencyContact = (index: number) => {
    setSafetyData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }))
  }

  const categories = [
    { id: 'all', name: 'All Tips', icon: Shield },
    { id: 'before', name: 'Before Protest', icon: MapPin },
    { id: 'during', name: 'During Protest', icon: Users },
    { id: 'after', name: 'After Protest', icon: Heart },
    { id: 'legal', name: 'Legal Rights', icon: Scale },
    { id: 'medical', name: 'Medical Safety', icon: Heart }
  ]

  const filteredTips = selectedCategory === 'all' 
    ? safetyData.safetyTips 
    : safetyData.safetyTips.filter(tip => tip.category === selectedCategory)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Safety Guide
        </h2>
        {userRole === 'organizer' && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={saveSafetyData}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          )
        })}
      </div>

      {/* Emergency Alert */}
      <Card className="p-4 bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 mb-2">Emergency Reminder</h3>
            {isEditing ? (
              <textarea
                value={safetyData.emergencyReminder}
                onChange={(e) => setSafetyData(prev => ({ ...prev, emergencyReminder: e.target.value }))}
                className="w-full p-2 border rounded text-red-700 text-sm"
                rows={3}
              />
            ) : (
              <p className="text-red-700 text-sm">
                {safetyData.emergencyReminder || 'No emergency reminder set.'}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Safety Tips */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Safety Tips</h3>
          {isEditing && (
            <Button size="sm" onClick={addSafetyTip}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tip
            </Button>
          )}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTips.map((tip) => (
            <Card key={tip.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={tip.title}
                        onChange={(e) => updateSafetyTip(tip.id, 'title', e.target.value)}
                        className="font-semibold"
                      />
                      <textarea
                        value={tip.description}
                        onChange={(e) => updateSafetyTip(tip.id, 'description', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <select
                          value={tip.category}
                          onChange={(e) => updateSafetyTip(tip.id, 'category', e.target.value)}
                          className="p-1 border rounded text-sm"
                        >
                          <option value="before">Before</option>
                          <option value="during">During</option>
                          <option value="after">After</option>
                          <option value="legal">Legal</option>
                          <option value="medical">Medical</option>
                        </select>
                        <select
                          value={tip.priority}
                          onChange={(e) => updateSafetyTip(tip.id, 'priority', e.target.value)}
                          className="p-1 border rounded text-sm"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <Button size="sm" variant="outline" onClick={() => deleteSafetyTip(tip.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{tip.title}</h4>
                        <Badge className={getPriorityColor(tip.priority)}>
                          {tip.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{tip.description}</p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contacts
          </h3>
          {isEditing && (
            <Button size="sm" onClick={addEmergencyContact}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          )}
        </div>
        
        <div className="grid gap-3 md:grid-cols-2">
          {safetyData.emergencyContacts.map((contact, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={contact.name}
                    onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                    placeholder="Contact Name"
                  />
                  <Input
                    value={contact.phone}
                    onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                    placeholder="Phone Number"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={contact.type}
                      onChange={(e) => updateEmergencyContact(index, 'type', e.target.value)}
                      placeholder="Type"
                      className="flex-1"
                    />
                    <Button size="sm" variant="outline" onClick={() => deleteEmergencyContact(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-gray-600">{contact.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{contact.phone}</div>
                    <Button size="sm" variant="outline" className="mt-1">
                      Call
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
