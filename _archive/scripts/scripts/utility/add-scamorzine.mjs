// Script per aggiungere "Scamorzine" alla categoria Fritti
// Usage: node scripts/utility/add-scamorzine.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
let supabaseUrl, supabaseAnonKey

try {
  const envPath = join(__dirname, '..', '..', '.env.local')
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

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function addScamorzine() {
  console.log('\n🔍 Verifico se "Scamorzine" esiste già...')

  // Prima verifica se esiste già
  const { data: existing, error: selectError } = await supabase
    .from('menu_items')
    .select('id, name, category, price')
    .eq('name', 'Scamorzine')
    .eq('category', 'fritti')

  if (selectError) {
    console.error('❌ Errore nel cercare Scamorzine:', selectError.message)
    process.exit(1)
  }

  if (existing && existing.length > 0) {
    console.log('✅ "Scamorzine" esiste già nel database!')
    existing.forEach(item => {
      console.log(`   - ID: ${item.id}, Nome: ${item.name}, Categoria: ${item.category}, Prezzo: €${item.price}`)
    })
    return
  }

  // Inserisci nuovo ingrediente
  console.log('\n➕ Inserimento di "Scamorzine"...')
  const { data, error: insertError } = await supabase
    .from('menu_items')
    .insert({
      name: 'Scamorzine',
      category: 'fritti',
      price: 2.00,
      description: null,
      sort_order: 12
    })
    .select()

  if (insertError) {
    console.log('⚠️  INSERT fallito.')
    console.log('   Errore:', insertError.message)
    console.log('\n📋 OPZIONI:')
    console.log('   1. Esegui manualmente dalla Supabase Dashboard:')
    console.log('      SQL Editor → INSERT INTO menu_items (name, category, price, description, sort_order)')
    console.log('                   VALUES (\'Scamorzine\', \'fritti\', 2.00, NULL, 12);')
    console.log('   2. Oppure verifica le RLS policies sulla tabella menu_items')
    process.exit(1)
  }

  console.log('✅ "Scamorzine" aggiunto con successo al database!')
  if (data && data.length > 0) {
    console.log('   Dettagli:', {
      id: data[0].id,
      name: data[0].name,
      category: data[0].category,
      price: `€${data[0].price}`,
      sort_order: data[0].sort_order
    })
  }
  console.log('\n💡 Ricarica la pagina nell\'app per vedere "Scamorzine" nella categoria Fritti.')
}

addScamorzine().catch(error => {
  console.error('❌ Errore:', error)
  process.exit(1)
})
