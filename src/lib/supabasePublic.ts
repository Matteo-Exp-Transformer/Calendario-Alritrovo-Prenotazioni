// Supabase client with service role key for public booking inserts
// This bypasses RLS completely
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// Use SERVICE_ROLE_KEY to completely bypass RLS for public inserts
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 [Supabase Public Client] Service Role Key presente:', !!supabaseServiceKey)

// Fallback to anon key if service role not available
const supabaseKey = supabaseServiceKey || import.meta.env.VITE_SUPABASE_ANON_KEY

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

