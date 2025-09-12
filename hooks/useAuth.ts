'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      return result?.ok || false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const loginWithFacebook = async (): Promise<void> => {
    await signIn('facebook', { callbackUrl: '/dashboard' })
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        // Auto-login after registration
        return await login(userData.email, userData.password)
      }
      return false
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  const logout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return {
    user: session?.user ? {
      id: session.user.id,
      username: session.user.username || session.user.name,
      email: session.user.email,
      role: session.user.role
    } : null,
    login,
    loginWithFacebook,
    register,
    logout,
    loading: status === 'loading'
  }
}
