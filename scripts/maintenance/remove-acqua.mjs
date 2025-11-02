// Script per rimuovere "Acqua" dal database
// Usage: node scripts/remove-acqua.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
let supabaseUrl, supabaseAnonKey

try {
  const envPath = join(__dirname, '..', '.env.local')
  const envContent = readFileSync(envPath, 'utf-8')
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].trim()
    }
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = trimmed.split('=')[1].trim()
    }
  })
} catch (error) {
  console.error('❌ Errore nel leggere .env.local:', error.message)
  process.exit(1)
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRORE: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY non trovati in .env.local')
  process.exit(1)
}

console.log('🔧 Connessione a Supabase...')
console.log('   URL:', supabaseUrl)
console.log('   Key:', supabaseAnonKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function removeAcqua() {
  console.log('\n🔍 Cerco "Acqua" nel database...')
  
  // Prima verifica se esiste
  const { data: items, error: selectError } = await supabase
    .from('menu_items')
    .select('id, name, category, price')
    .eq('name', 'Acqua')
    .eq('category', 'bevande')

  if (selectError) {
    console.error('❌ Errore nel cercare Acqua:', selectError.message)
    process.exit(1)
  }

  if (!items || items.length === 0) {
    console.log('✅ "Acqua" non trovato nel database - già rimosso!')
    return
  }

  console.log(`📋 Trovati ${items.length} elementi "Acqua":`)
  items.forEach(item => {
    console.log(`   - ID: ${item.id}, Nome: ${item.name}, Categoria: ${item.category}, Prezzo: €${item.price}`)
  })

  // Prova a rimuovere direttamente
  console.log('\n🗑️  Rimozione di "Acqua"...')
  let { error: deleteError } = await supabase
    .from('menu_items')
    .delete()
    .eq('name', 'Acqua')
    .eq('category', 'bevande')

  if (deleteError) {
    console.log('⚠️  DELETE diretto fallito (RLS policy).')
    console.log('   Errore:', deleteError.message)
    console.log('\n📋 OPZIONI:')
    console.log('   1. Esegui manualmente dalla Supabase Dashboard:')
    console.log('      SQL Editor → DELETE FROM menu_items WHERE name = \'Acqua\' AND category = \'bevande\';')
    console.log('   2. Oppure usa la migration 020_remove_acqua_with_policy.sql')
    console.log('\n💡 La migration 020 crea una policy temporanea che permette la DELETE anonima.')
    process.exit(1)
  }

  console.log('✅ "Acqua" rimosso con successo dal database!')
  console.log('\n💡 Ricarica la pagina nell\'app per vedere le modifiche.')
}

removeAcqua().catch(error => {
  console.error('❌ Errore:', error)
  process.exit(1)
})

