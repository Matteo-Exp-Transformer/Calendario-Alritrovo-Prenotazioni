import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/types/database'

/**
 * Supabase client for E2E tests
 * Uses process.env instead of import.meta.env (which only works in Vite)
 */

const supabaseUrl = 'https://dphuttzgdcerexunebct.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHV0dHpnZGNlcmV4dW5lYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTI0NDMsImV4cCI6MjA3NzA4ODQ0M30.8OpmfjuZkT2vdSbOcr4fUeaKaKibuF4vdFLnNSk7h60'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials for E2E tests')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'e2e-tests'
    }
  }
})
