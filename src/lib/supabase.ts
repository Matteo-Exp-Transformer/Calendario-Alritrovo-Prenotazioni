import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message
  }
  return 'Si è verificato un errore. Riprova più tardi.'
}

// Helper function to check if user is authenticated
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

// Helper function to check if user is admin
export async function isAdmin() {
  const user = await getCurrentUser()
  if (!user || !user.email) return false

  const { data, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('email', user.email)
    .single()

  if (error || !data) return false

  // Type assertion since we know the structure from our database schema
  const adminData = data as { role: string }
  return adminData.role === 'admin' || adminData.role === 'staff'
}
