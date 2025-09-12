'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Shield, Heart, Scale, Home, Plus } from 'lucide-react'
import AddResourceModal from './add-resource-modal'

interface Resource {
  _id: string
  name: string
  type: 'hospital' | 'legal' | 'emergency' | 'safe-house'
  address: string
  phone: string
  verified: boolean
  notes?: string
}

const typeIcons = {
  hospital: Heart,
  legal: Scale,
  emergency: Shield,
  'safe-house': Home
}

const typeColors = {
  hospital: 'bg-red-100 text-red-800',
  legal: 'bg-blue-100 text-blue-800',
  emergency: 'bg-yellow-100 text-yellow-800',
  'safe-house': 'bg-green-100 text-green-800'
}

export default function ResourceMap() {
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchResources = async () => {
    try {
      const url = selectedType === 'all' 
        ? '/api/resources' 
        : `/api/resources?type=${selectedType}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setResources(data.resources || [])
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchResources()
  }, [selectedType])

  const handleResourceAdded = () => {
    fetchResources()
    setShowAddModal(false)
  }

  const types = ['all', 'hospital', 'legal', 'emergency', 'safe-house']

  if (loading) return <div>Loading resources...</div>

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Emergency Resources
          </h2>
          
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {types.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
            </Button>
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((resource) => {
            const Icon = typeIcons[resource.type]
            return (
              <Card key={resource._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-1 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{resource.name}</h3>
                        {resource.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <Badge className={`mt-1 ${typeColors[resource.type]}`}>
                        {resource.type.replace('-', ' ')}
                      </Badge>
                      
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {resource.address}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {resource.phone}
                        </div>
                      </div>
                      
                      {resource.notes && (
                        <p className="mt-2 text-sm text-gray-500">{resource.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
        
        {resources.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">No resources found for this category</p>
            <Button onClick={() => setShowAddModal(true)}>
              Add First Resource
            </Button>
          </Card>
        )}
      </div>

      <AddResourceModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onResourceAdded={handleResourceAdded}
      />
    </>
  )
}
