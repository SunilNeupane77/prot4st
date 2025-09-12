'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Shield, Facebook } from 'lucide-react'
import { signIn } from 'next-auth/react'

export default function LoginForm({ onToggle }: { onToggle: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (result?.error) {
      setError('Invalid credentials')
    } else if (result?.ok) {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleFacebookLogin = async () => {
    setLoading(true)
    await signIn('facebook', { callbackUrl: '/dashboard' })
    setLoading(false)
  }

  return (
    <Card className="p-6 w-full max-w-md">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Sign In</h2>
        <p className="text-gray-600">Access your secure account</p>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={handleFacebookLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Facebook className="h-4 w-4 mr-2" />
          Continue with Facebook
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </div>

      <p className="text-center mt-4 text-sm">
        Don't have an account?{' '}
        <button onClick={onToggle} className="text-blue-600 hover:underline">
          Sign up
        </button>
      </p>
    </Card>
  )
}
