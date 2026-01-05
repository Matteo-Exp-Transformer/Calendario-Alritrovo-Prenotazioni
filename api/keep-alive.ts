import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel Serverless Function per Keep-Alive Database Supabase
 * 
 * Questa funzione viene chiamata automaticamente da Vercel Cron Jobs
 * per prevenire la pausa automatica del database Supabase dopo 7 giorni di inattività.
 * 
 * Sicurezza: Verifica il token CRON_SECRET inviato da Vercel nel header Authorization
 * Query: Esegue una SELECT 1 ultra-leggera che non accede a tabelle reali
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verifica metodo HTTP
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    })
  }

  // Verifica autorizzazione (Vercel Cron invia automaticamente CRON_SECRET)
  const authHeader = req.headers.authorization
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`
  
  if (!authHeader || authHeader !== expectedToken) {
    console.error('[Keep-Alive] Unauthorized access attempt')
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized',
      timestamp: new Date().toISOString()
    })
  }

  // Recupera credenziali Supabase da variabili ambiente
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('[Keep-Alive] Missing Supabase environment variables')
    return res.status(500).json({ 
      success: false,
      error: 'Missing Supabase configuration',
      timestamp: new Date().toISOString()
    })
  }

  // Crea client Supabase per ambiente serverless
  // NON usa window.localStorage o import.meta.env (specifici di Vite)
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        'X-Client-Info': 'vercel-cron-keep-alive'
      }
    }
  })

  try {
    console.log('[Keep-Alive] Executing database ping...')
    
    // Esegue query ultra-leggera: SELECT 1
    // Questa query non accede a tabelle reali, è la più efficiente possibile
    const { data, error } = await supabase.rpc('ping', {})
    
    // Se la funzione ping non esiste, usa fallback su una tabella esistente
    if (error && error.message.includes('function')) {
      console.log('[Keep-Alive] Ping function not found, using fallback query')
      const { error: fallbackError } = await supabase
        .from('restaurant_settings')
        .select('id')
        .limit(1)
      
      if (fallbackError) throw fallbackError
    } else if (error) {
      throw error
    }

    console.log('[Keep-Alive] Database ping successful')
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Database keep-alive successful'
    })
  } catch (error) {
    console.error('[Keep-Alive] Error:', error)
    
    return res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

