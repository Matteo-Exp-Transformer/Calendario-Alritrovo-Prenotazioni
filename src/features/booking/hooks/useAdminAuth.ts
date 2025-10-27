import { useState, useEffect } from 'react'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import type { AdminRole } from '@/types/booking'
import { useNavigate } from 'react-router-dom'

interface AdminAuthUser {
  id: string
  email: string
  name?: string
  role: AdminRole
}

interface AdminUserData {
  id: string
  email: string
  name: string | null
  role: string
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

      // Check if user exists in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, name, role')
        .eq('email', session.user.email!)
        .single()

      if (adminError || !adminData) {
        console.error('User not found in admin_users:', adminError)
        setUser(null)
        setIsLoading(false)
        return
      }

      // Type assertion for adminData
      const data = adminData as AdminUserData

      // Set user state
      setUser({
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        role: data.role as AdminRole
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

      // 2. Verify user exists in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, name, role')
        .eq('email', email)
        .single()

      if (adminError || !adminData) {
        // Logout from Supabase if not in admin_users
        await supabase.auth.signOut()
        return {
          success: false,
          error: 'Credenziali non valide.'
        }
      }

      // Type assertion for adminData
      const data = adminData as AdminUserData

      // 3. Set user state
      setUser({
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        role: data.role as AdminRole
      })

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
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
