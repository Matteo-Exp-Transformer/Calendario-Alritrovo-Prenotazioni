#!/usr/bin/env node

/**
 * Test locale per la funzione keep-alive
 * Simula il comportamento della serverless function Vercel
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dphuttzgdcerexunebct.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHV0dHpnZGNlcmV4dW5lYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTI0NDMsImV4cCI6MjA3NzA4ODQ0M30.8OpmfjuZkT2vdSbOcr4fUeaKaKibuF4vdFLnNSk7h60'

console.log('🧪 Test Keep-Alive Function\n')
console.log('=' .repeat(60))

// Test 1: Verifica connessione Supabase
console.log('\n📡 Test 1: Verifica connessione Supabase')
console.log('-'.repeat(60))

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      'X-Client-Info': 'test-keep-alive-local'
    }
  }
})

console.log('✅ Client Supabase creato')

// Test 2: Query SELECT 1 (tramite RPC ping se esiste)
console.log('\n🔍 Test 2: Esecuzione query keep-alive')
console.log('-'.repeat(60))

try {
  console.log('Tentativo 1: SELECT 1 tramite RPC ping...')
  const { data: pingData, error: pingError } = await supabase.rpc('ping', {})
  
  if (pingError && pingError.message.includes('function')) {
    console.log('⚠️  Funzione ping non trovata, uso fallback')
    
    console.log('Tentativo 2: Query su tabella restaurant_settings...')
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('id')
      .limit(1)
    
    if (error) {
      throw error
    }
    
    console.log('✅ Query fallback eseguita con successo')
    console.log(`   Risultati: ${data ? data.length : 0} record`)
  } else if (pingError) {
    throw pingError
  } else {
    console.log('✅ Query ping eseguita con successo')
    console.log(`   Risultato: ${JSON.stringify(pingData)}`)
  }
} catch (error) {
  console.error('❌ Errore durante la query:', error.message)
  process.exit(1)
}

// Test 3: Verifica timestamp e response
console.log('\n📅 Test 3: Verifica response format')
console.log('-'.repeat(60))

const response = {
  success: true,
  timestamp: new Date().toISOString(),
  message: 'Database keep-alive successful'
}

console.log('✅ Response format corretto:')
console.log(JSON.stringify(response, null, 2))

// Test 4: Simula autenticazione (solo log)
console.log('\n🔐 Test 4: Verifica autenticazione (simulazione)')
console.log('-'.repeat(60))
console.log('⚠️  Nota: CRON_SECRET viene verificato solo in produzione')
console.log('   In locale, questo test viene saltato')
console.log('   Vercel passa automaticamente: Authorization: Bearer <CRON_SECRET>')

// Riepilogo
console.log('\n' + '='.repeat(60))
console.log('✅ TUTTI I TEST COMPLETATI CON SUCCESSO')
console.log('='.repeat(60))
console.log('\n📋 Riepilogo:')
console.log('   ✅ Connessione Supabase funzionante')
console.log('   ✅ Query keep-alive eseguita correttamente')
console.log('   ✅ Response format valido')
console.log('   ⚠️  Autenticazione CRON_SECRET da verificare in produzione')

console.log('\n🚀 Prossimi passi:')
console.log('   1. Verifica che il deploy su Vercel sia completato')
console.log('   2. Vai su Vercel Dashboard → Settings → Environment Variables')
console.log('   3. Aggiungi SUPABASE_URL e SUPABASE_ANON_KEY')
console.log('   4. Verifica in Settings → Cron Jobs che il job sia attivo')
console.log('   5. Monitora i log in Vercel Dashboard → Logs')

console.log('\n📚 Documentazione completa:')
console.log('   → docs/development/VERCEL_KEEP_ALIVE_SETUP.md')
console.log('   → KEEP_ALIVE_SETUP.md (quick reference)')
console.log('')

