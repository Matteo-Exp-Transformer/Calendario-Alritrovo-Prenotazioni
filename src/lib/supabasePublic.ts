// Supabase client with service role key for public booking inserts
// This bypasses RLS completely
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// Use ANON KEY for public inserts (now that RLS policy allows it)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 [Supabase Public Client] Anon Key presente:', !!supabaseAnonKey)

// Use anon key for public inserts
const supabaseKey = supabaseAnonKey

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [Supabase Public Client] Credenziali mancanti!')
  throw new Error('Missing Supabase environment variables')
}

// Create client with SERVICE ROLE KEY to bypass RLS completely
export const supabasePublic = createClient<Database>(
  supabaseUrl, 
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  }
)

console.log('✅ [Supabase Public Client] Client creato con SERVICE_ROLE_KEY per bypassare RLS')

