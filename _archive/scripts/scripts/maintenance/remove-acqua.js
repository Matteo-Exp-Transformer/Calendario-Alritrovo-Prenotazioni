// Script per rimuovere "Acqua" dal database
// Usage: node scripts/remove-acqua.js

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRORE: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY non trovati in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function removeAcqua() {
  console.log('🔍 Cerco "Acqua" nel database...')
  
  // Prima verifica se esiste
  const { data: items, error: selectError } = await supabase
    .from('menu_items')
    .select('id, name, category, price')
    .eq('name', 'Acqua')
    .eq('category', 'bevande')

  if (selectError) {
    console.error('❌ Errore nel cercare Acqua:', selectError)
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

  // Rimuovi tutti gli elementi "Acqua"
  const { error: deleteError } = await supabase
    .from('menu_items')
    .delete()
    .eq('name', 'Acqua')
    .eq('category', 'bevande')

  if (deleteError) {
    console.error('❌ Errore nel rimuovere Acqua:', deleteError)
    process.exit(1)
  }

  console.log('✅ "Acqua" rimosso con successo dal database!')
}

removeAcqua().catch(console.error)



