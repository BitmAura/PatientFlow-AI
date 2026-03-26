import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { user, setUser, clearAuth } = useAuthStore()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          clearAuth()
        }
        setLoading(false)
        
        if (event === 'SIGNED_OUT') {
           router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase, setUser, clearAuth])

  const authErrorMessage = (err: any) => {
    const msg = err?.message || ''
    if (/failed to fetch|network|load failed/i.test(msg)) {
      return 'Connection error. Check your internet and that the app URL is allowed in Supabase (Authentication → URL Configuration).'
    }
    return msg || 'Something went wrong. Please try again.'
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      toast.success('Signed in successfully')
      // Full-page redirect so session cookie is sent and middleware sees the user
      window.location.href = '/dashboard'
      return
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(authErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string, metadata?: Record<string, any>) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            ...metadata,
          },
        },
      })
      if (error) throw error
      toast.success('Account created! Please check your email to verify your account.')
      router.push('/verify-email')
    } catch (error: any) {
      console.error('Sign up error:', error)
      toast.error(authErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      console.error('Google sign in error:', error)
      toast.error(authErrorMessage(error))
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      clearAuth()
      toast.success('Signed out successfully')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast.success('Password reset email sent')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated successfully')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
  }
}
