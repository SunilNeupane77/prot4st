'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Search, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'

interface FactCheck {
  _id: string
  claim: string
  result: {
    status: 'verified' | 'false' | 'unverified' | 'disputed'
    score: number
    confidence: number
    sources: string[]
    reasoning: string[]
  }
  timestamp: string
  communityVotes: Array<{
    userId: string
    username: string
    vote: 'true' | 'false' | 'disputed'
    evidence?: string
    timestamp: string
  }>
}

export default function RumorChecker() {
  const [query, setQuery] = useState('')
  const [newClaim, setNewClaim] = useState('')
  const [sources, setSources] = useState('')
  const [results, setResults] = useState<FactCheck[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedFactCheck, setSelectedFactCheck] = useState<FactCheck | null>(null)
  const [voteEvidence, setVoteEvidence] = useState('')

  useEffect(() => {
    fetchRecentFactChecks()
  }, [])

  const fetchRecentFactChecks = async () => {
    try {
      const response = await fetch('/api/fact-check')
      if (response.ok) {
        const data = await response.json()
        setResults(data.factChecks || [])
      }
    } catch (error) {
      console.error('Failed to fetch fact checks:', error)
    }
  }

  const searchFacts = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/fact-check?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.factChecks || [])
      }
    } catch (error) {
      console.error('Failed to search fact checks:', error)
    }
    setLoading(false)
  }

  const submitClaim = async () => {
    if (!newClaim.trim()) return
    
    setSubmitting(true)
    try {
      const response = await fetch('/api/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: newClaim,
          sources: sources.split('\n').filter(s => s.trim())
        })
      })
      
      if (response.ok) {
        setNewClaim('')
        setSources('')
        fetchRecentFactChecks()
      }
    } catch (error) {
      console.error('Failed to submit claim:', error)
    }
    setSubmitting(false)
  }

  const submitVote = async (factCheckId: string, vote: 'true' | 'false' | 'disputed') => {
    try {
      const response = await fetch('/api/fact-check/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factCheckId,
          vote,
          evidence: voteEvidence
        })
      })
      
      if (response.ok) {
        setVoteEvidence('')
        setSelectedFactCheck(null)
        fetchRecentFactChecks()
      }
    } catch (error) {
      console.error('Failed to submit vote:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'false':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'disputed':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'false':
        return 'bg-red-100 text-red-800'
      case 'disputed':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Submit New Claim */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Submit Claim for Verification</h3>
        <div className="space-y-3">
          <textarea
            value={newClaim}
            onChange={(e) => setNewClaim(e.target.value)}
            placeholder="Enter the claim you want to fact-check..."
            className="w-full p-3 border rounded min-h-[80px]"
          />
          <textarea
            value={sources}
            onChange={(e) => setSources(e.target.value)}
            placeholder="Enter sources (one per line)..."
            className="w-full p-3 border rounded min-h-[60px]"
          />
          <Button onClick={submitClaim} disabled={submitting || !newClaim.trim()}>
            {submitting ? 'Analyzing...' : 'Submit for Fact Check'}
          </Button>
        </div>
      </Card>

      {/* Search */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Fact Checks
        </h3>
        
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for claims or keywords..."
            onKeyPress={(e) => e.key === 'Enter' && searchFacts()}
          />
          <Button onClick={searchFacts} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result._id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(result.result.status)}
                    <Badge className={getStatusColor(result.result.status)}>
                      {result.result.status.toUpperCase()}
                    </Badge>
                    <span className={`text-sm font-medium ${getConfidenceColor(result.result.confidence)}`}>
                      {Math.round(result.result.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <h4 className="font-medium mb-2">{result.claim}</h4>
                  
                  {result.result.reasoning.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Analysis:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {result.result.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.result.sources.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Sources:</p>
                      <div className="text-sm text-gray-600">
                        {result.result.sources.join(', ')}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Score: {Math.round(result.result.score * 100)}/100</span>
                    <span>Community votes: {result.communityVotes?.length || 0}</span>
                    <span>{new Date(result.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Community Voting */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Community Verification:</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedFactCheck(result)}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => submitVote(result._id, 'false')}
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      Dispute
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedFactCheck(result)}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Comment
                    </Button>
                  </div>
                </div>

                {result.communityVotes && result.communityVotes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.communityVotes.slice(0, 3).map((vote, index) => (
                      <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">{vote.username}</span> voted{' '}
                        <span className={vote.vote === 'true' ? 'text-green-600' : 'text-red-600'}>
                          {vote.vote}
                        </span>
                        {vote.evidence && <span className="ml-2">- {vote.evidence}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Vote Modal */}
      {selectedFactCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Add Your Verification</h3>
            <textarea
              value={voteEvidence}
              onChange={(e) => setVoteEvidence(e.target.value)}
              placeholder="Provide evidence or reasoning for your vote..."
              className="w-full p-3 border rounded min-h-[80px] mb-4"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => submitVote(selectedFactCheck._id, 'true')}
                className="flex-1"
              >
                Verify as True
              </Button>
              <Button
                onClick={() => submitVote(selectedFactCheck._id, 'false')}
                variant="outline"
                className="flex-1"
              >
                Mark as False
              </Button>
              <Button
                onClick={() => setSelectedFactCheck(null)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {results.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No fact checks found. Submit a claim to get started!</p>
        </Card>
      )}
    </div>
  )
}
