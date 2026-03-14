import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY


if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [Supabase Client] Credenziali mancanti!')
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

// Client per utenti autenticati (admin)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'booking-admin'
    }
  },
  db: {
    schema: 'public'
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

// Helper function to check if user is authorized
export async function isAuthorizedUser() {
  const user = await getCurrentUser()
  if (!user || !user.email) return false

  const { data, error } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email)
    .single()

  return !error && !!data
}
