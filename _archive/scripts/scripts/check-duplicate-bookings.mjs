/**
 * Script per verificare la presenza di prenotazioni duplicate nel database
 *
 * Questo script esegue query per identificare:
 * 1. Prenotazioni pending duplicate basate su email + data
 * 2. Prenotazioni pending duplicate basate su ID duplicato
 * 3. Statistiche generali sulle prenotazioni pending
 *
 * Usage: node scripts/check-duplicate-bookings.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load env variables from .env.local
function loadEnv() {
  try {
    const envContent = readFileSync('.env.local', 'utf-8')
    const lines = envContent.split('\n')
    const env = {}

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=')
        env[key.trim()] = value.trim()
      }
    }

    return env
  } catch (error) {
    console.error('⚠️ Could not load .env.local')
    return {}
  }
}

const env = loadEnv()
const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://dphuttzgdcerexunebct.supabase.co'
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHV0dHpnZGNlcmV4dW5lYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTI0NDMsImV4cCI6MjA3NzA4ODQ0M30.8OpmfjuZkT2vdSbOcr4fUeaKaKibuF4vdFLnNSk7h60'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate pending bookings...\n')

  try {
    // 1. Get all pending bookings
    console.log('📋 Step 1: Fetching all pending bookings...')
    const { data: allPending, error: fetchError } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching bookings:', fetchError.message)
      return
    }

    console.log(`✅ Found ${allPending.length} pending bookings\n`)

    // 2. Check for duplicate IDs (should never happen with UUID primary key)
    console.log('🔍 Step 2: Checking for duplicate IDs...')
    const idCounts = {}
    allPending.forEach(booking => {
      idCounts[booking.id] = (idCounts[booking.id] || 0) + 1
    })

    const duplicateIds = Object.entries(idCounts)
      .filter(([id, count]) => count > 1)
      .map(([id, count]) => ({ id, count }))

    if (duplicateIds.length > 0) {
      console.log('❌ Found duplicate IDs (DATABASE INTEGRITY ISSUE):')
      duplicateIds.forEach(({ id, count }) => {
        console.log(`  - ID: ${id} appears ${count} times`)
      })
    } else {
      console.log('✅ No duplicate IDs found (good!)\n')
    }

    // 3. Check for duplicate bookings (same email + same date)
    console.log('🔍 Step 3: Checking for duplicate bookings (same email + date)...')
    const emailDateMap = {}

    allPending.forEach(booking => {
      const key = `${booking.client_email}|${booking.desired_date}`
      if (!emailDateMap[key]) {
        emailDateMap[key] = []
      }
      emailDateMap[key].push(booking)
    })

    const duplicateBookings = Object.entries(emailDateMap)
      .filter(([key, bookings]) => bookings.length > 1)
      .map(([key, bookings]) => ({ key, bookings }))

    if (duplicateBookings.length > 0) {
      console.log('⚠️ Found duplicate bookings (same email + date):')
      duplicateBookings.forEach(({ key, bookings }) => {
        const [email, date] = key.split('|')
        console.log(`\n  📧 Email: ${email}`)
        console.log(`  📅 Date: ${date}`)
        console.log(`  🔢 Count: ${bookings.length} bookings`)
        bookings.forEach((booking, idx) => {
          console.log(`    ${idx + 1}. ID: ${booking.id}`)
          console.log(`       Time: ${booking.desired_time || 'N/A'}`)
          console.log(`       Created: ${new Date(booking.created_at).toLocaleString()}`)
          console.log(`       Guests: ${booking.num_guests}`)
        })
      })
      console.log(`\n⚠️ Total duplicate groups: ${duplicateBookings.length}`)
    } else {
      console.log('✅ No duplicate bookings found (same email + date)\n')
    }

    // 4. Statistics
    console.log('\n📊 Statistics:')
    console.log(`  - Total pending bookings: ${allPending.length}`)
    console.log(`  - Unique IDs: ${Object.keys(idCounts).length}`)
    console.log(`  - Unique email+date combinations: ${Object.keys(emailDateMap).length}`)

    // 5. Recent bookings sample
    console.log('\n📝 Recent pending bookings (last 5):')
    allPending.slice(0, 5).forEach((booking, idx) => {
      console.log(`  ${idx + 1}. ${booking.client_email} - ${booking.desired_date} ${booking.desired_time || 'N/A'}`)
      console.log(`     ID: ${booking.id}`)
      console.log(`     Created: ${new Date(booking.created_at).toLocaleString()}`)
    })

  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
  }
}

checkDuplicates()
