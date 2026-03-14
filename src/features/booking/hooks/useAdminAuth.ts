import { useState, useEffect } from 'react'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

interface AdminAuthUser {
  id: string
  email: string
  name?: string
}

interface UseAdminAuthReturn {
  user: AdminAuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [user, setUser] = useState<AdminAuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      // Check if user is authenticated with Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session check error:', sessionError)
        setUser(null)
        setIsLoading(false)
        return
      }

      if (!session || !session.user || !session.user.email) {
        setUser(null)
        setIsLoading(false)
        return
      }

      // Verify user exists in admin_users table
      const { data: adminUser, error: adminError } = await (supabase
        .from('admin_users') as any)
        .select('name')
        .eq('email', session.user.email)
        .single()

      if (adminError || !adminUser) {
        setUser(null)
        setIsLoading(false)
        return
      }

      setUser({
        id: session.user.id,
        email: session.user.email,
        name: (adminUser as any).name || undefined
      })

    } catch (error) {
      console.error('Error checking session:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)

      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        return {
          success: false,
          error: handleSupabaseError(authError)
        }
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Errore durante il login. Riprova più tardi.'
        }
      }

      // Verify user exists in admin_users table
      const { data: adminUser, error: adminError } = await (supabase
        .from('admin_users') as any)
        .select('name')
        .eq('email', authData.user.email || '')
        .single()

      if (adminError || !adminUser) {
        await supabase.auth.signOut()
        return {
          success: false,
          error: 'Utente non autorizzato'
        }
      }

      setUser({
        id: authData.user.id,
        email: authData.user.email || '',
        name: (adminUser as any).name || undefined
      })

      return { success: true }
    } catch (error) {
      console.error('Login exception:', error)
      return {
        success: false,
        error: handleSupabaseError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear user state
      setUser(null)

      // Navigate to login
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still navigate to login even if there's an error
      navigate('/login')
    }
  }

  return { user, isLoading, login, logout }
}
