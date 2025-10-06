'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Globe, Lock, Plus, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import CreateGroupModal from './create-group-modal'

interface Group {
  _id: string
  name: string
  description: string
  type: 'public' | 'private' | 'secret'
  members: string[]
  updatedAt: string
}

export default function GroupSelector({ 
  selectedGroupId, 
  onGroupSelect 
}: { 
  selectedGroupId: string
  onGroupSelect: (groupId: string) => void 
}) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: session } = useSession()

  const fetchGroups = useCallback(async () => {
    if (!session?.user) return
    
    try {
      const response = await fetch('/api/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
        
        if (data.groups.length > 0 && !selectedGroupId) {
          onGroupSelect(data.groups[0]._id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    }
    setLoading(false)
  }, [session, selectedGroupId, onGroupSelect])

  useEffect(() => {
    fetchGroups()
  }, [session, fetchGroups])

  const handleGroupCreated = () => {
    fetchGroups()
    setShowCreateModal(false)
  }

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'private':
        return <Lock className="h-4 w-4" />
      case 'secret':
        return <Lock className="h-4 w-4 text-red-500" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  if (!session?.user) return null

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Groups
          </h3>
          <Button size="sm" variant="outline" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {loading ? (
          <p className="text-sm text-gray-500">Loading groups...</p>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group._id}
                onClick={() => onGroupSelect(group._id)}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedGroupId === group._id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getGroupIcon(group.type)}
                      <span className="font-medium text-sm">{group.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {group.members.length} members
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(group.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {groups.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">No groups yet</p>
                <Button size="sm" onClick={() => setShowCreateModal(true)}>
                  Create First Group
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <CreateGroupModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={handleGroupCreated}
      />
    </>
  )
}
