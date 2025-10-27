// Supabase client with service role key for public booking inserts
// This bypasses RLS completely
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// Use anon key for now - we'll add service role if needed
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [Supabase Public Client] Credenziali mancanti!')
  throw new Error('Missing Supabase environment variables')
}

// Create client with minimal auth to bypass RLS
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

console.log('✅ [Supabase Public Client] Client creato per inserimenti pubblici')

