interface FactCheckResult {
  score: number
  status: 'verified' | 'false' | 'unverified' | 'disputed'
  confidence: number
  sources: string[]
  reasoning: string[]
}

interface ClaimData {
  text: string
  keywords: string[]
  sources: string[]
  timestamp: Date
  reportCount: number
  verificationVotes: { userId: string; vote: 'true' | 'false'; timestamp: Date }[]
}

export class FactCheckAlgorithm {
  private knownFacts: Map<string, FactCheckResult> = new Map()
  private suspiciousKeywords = [
    'breaking', 'urgent', 'confirmed', 'exclusive', 'leaked', 'secret',
    'government cover-up', 'they don\'t want you to know', 'shocking truth'
  ]

  async checkClaim(claim: string, sources: string[] = []): Promise<FactCheckResult> {
    const keywords = this.extractKeywords(claim)
    const suspiciousScore = this.calculateSuspiciousScore(claim, keywords)
    const sourceReliability = this.assessSourceReliability(sources)
    const communityScore = await this.getCommunityVerificationScore(claim)
    
    const overallScore = this.calculateOverallScore(
      suspiciousScore,
      sourceReliability,
      communityScore
    )

    return {
      score: overallScore,
      status: this.determineStatus(overallScore),
      confidence: this.calculateConfidence(overallScore, sources.length),
      sources: sources,
      reasoning: this.generateReasoning(suspiciousScore, sourceReliability, communityScore)
    }
  }

  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .slice(0, 10)
  }

  private calculateSuspiciousScore(claim: string, keywords: string[]): number {
    let suspiciousCount = 0
    const lowerClaim = claim.toLowerCase()
    
    this.suspiciousKeywords.forEach(keyword => {
      if (lowerClaim.includes(keyword)) {
        suspiciousCount++
      }
    })

    // Check for excessive punctuation or caps
    const capsRatio = (claim.match(/[A-Z]/g) || []).length / claim.length
    const exclamationCount = (claim.match(/!/g) || []).length
    
    if (capsRatio > 0.3) suspiciousCount++
    if (exclamationCount > 2) suspiciousCount++

    return Math.min(suspiciousCount / 5, 1) // Normalize to 0-1
  }

  private assessSourceReliability(sources: string[]): number {
    if (sources.length === 0) return 0

    const reliableSources = [
      'reuters', 'ap', 'bbc', 'npr', 'pbs', 'associated press',
      'government', 'official', 'verified'
    ]

    let reliableCount = 0
    sources.forEach(source => {
      const lowerSource = source.toLowerCase()
      if (reliableSources.some(reliable => lowerSource.includes(reliable))) {
        reliableCount++
      }
    })

    return reliableCount / sources.length
  }

  private async getCommunityVerificationScore(claim: string): Promise<number> {
    // Simulate community verification score
    // In real implementation, this would query the database
    const hash = this.simpleHash(claim)
    return (hash % 100) / 100 // Returns 0-1
  }

  private calculateOverallScore(
    suspiciousScore: number,
    sourceReliability: number,
    communityScore: number
  ): number {
    // Weighted scoring: suspicious (negative), sources (positive), community (positive)
    const score = (sourceReliability * 0.4) + (communityScore * 0.4) - (suspiciousScore * 0.2)
    return Math.max(0, Math.min(1, score))
  }

  private determineStatus(score: number): 'verified' | 'false' | 'unverified' | 'disputed' {
    if (score >= 0.8) return 'verified'
    if (score <= 0.3) return 'false'
    if (score >= 0.5) return 'unverified'
    return 'disputed'
  }

  private calculateConfidence(score: number, sourceCount: number): number {
    const baseConfidence = Math.abs(score - 0.5) * 2 // Distance from neutral
    const sourceBonus = Math.min(sourceCount * 0.1, 0.3)
    return Math.min(baseConfidence + sourceBonus, 1)
  }

  private generateReasoning(
    suspiciousScore: number,
    sourceReliability: number,
    communityScore: number
  ): string[] {
    const reasoning: string[] = []

    if (suspiciousScore > 0.5) {
      reasoning.push('Contains suspicious language patterns commonly found in misinformation')
    }
    if (sourceReliability > 0.7) {
      reasoning.push('Backed by reliable and credible sources')
    } else if (sourceReliability < 0.3) {
      reasoning.push('Lacks credible source verification')
    }
    if (communityScore > 0.7) {
      reasoning.push('High community verification score')
    } else if (communityScore < 0.3) {
      reasoning.push('Low community trust rating')
    }

    return reasoning
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  async submitCommunityVerification(
    claim: string,
    userId: string,
    vote: 'true' | 'false',
    evidence?: string
  ): Promise<void> {
    // Implementation would store community verification in database
    console.log(`User ${userId} voted ${vote} for claim: ${claim}`)
  }
}
