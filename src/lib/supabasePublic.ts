// Supabase client for public booking inserts
// Uses ANON_KEY with proper RLS policies
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY


if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [Supabase Public Client] Credenziali mancanti!')
  throw new Error('Missing Supabase environment variables')
}

// Client per operazioni pubbliche (solo INSERT dal form)
export const supabasePublic = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        'X-Client-Info': 'booking-public'
      }
    },
    db: {
      schema: 'public'
    }
  }
)


