'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Shield, MessageSquare, Calendar, Map, Users, Lock, CheckCircle, Star, ArrowRight } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Encrypted Messaging',
      description: 'End-to-end encrypted group chats to coordinate safely without surveillance',
      color: 'text-blue-600'
    },
    {
      icon: Calendar,
      title: 'Event Planning',
      description: 'Organize protests, meetings, and community events with secure coordination',
      color: 'text-green-600'
    },
    {
      icon: Map,
      title: 'Resource Mapping',
      description: 'Find hospitals, legal aid, emergency contacts, and safe houses nearby',
      color: 'text-red-600'
    },
    {
      icon: Users,
      title: 'Community Building',
      description: 'Connect with like-minded activists and build stronger movements',
      color: 'text-purple-600'
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Built with privacy and security as core principles, not afterthoughts',
      color: 'text-orange-600'
    },
    {
      icon: Shield,
      title: 'Fact Verification',
      description: 'Combat misinformation with community-driven fact checking tools',
      color: 'text-teal-600'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Community Organizer',
      content: 'SafeProtest has revolutionized how we coordinate our peaceful demonstrations. The security features give us peace of mind.',
      avatar: '👩‍💼'
    },
    {
      name: 'Marcus Johnson',
      role: 'Civil Rights Activist',
      content: 'The fact-checking feature helps us combat misinformation in real-time. Essential tool for modern activism.',
      avatar: '👨‍⚖️'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Legal Aid Coordinator',
      content: 'Having emergency resources and legal contacts integrated into one platform saves lives and protects rights.',
      avatar: '⚖️'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              Secure • Private • Community-Driven
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Safe Communication for
              <span className="text-blue-600 block">Civil Rights Movements</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Community-built platform for organizing peaceful protests, coordinating community events, 
              and building stronger civil rights movements with privacy and safety at the core.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8 py-3">
                  Join the Community
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Safe Organizing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for civil rights organizations and peaceful protesters
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <Icon className={`h-12 w-12 ${feature.color} mb-4`} />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Your Safety is Our Priority
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Built with security experts and civil rights lawyers to ensure your communications 
                remain private and your activities stay protected.
              </p>
              <div className="space-y-4">
                {[
                  'End-to-end encryption for all communications',
                  'No data retention or surveillance',
                  'Legal rights information and emergency contacts',
                  'Fact-checking to combat misinformation',
                  'Anonymous participation options'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl p-8">
              <Shield className="h-24 w-24 text-blue-600 mx-auto mb-6" />
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">256-bit Encryption</h3>
                <p className="text-gray-600">
                  Military-grade security ensures your communications remain private and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Activists Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what organizers and activists are saying about SafeProtest
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Organize Safely?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of activists using SafeProtest to coordinate peaceful demonstrations 
            and build stronger movements together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Start Organizing Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
