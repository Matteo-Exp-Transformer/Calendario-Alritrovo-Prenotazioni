# Setup Keep-Alive per Database Supabase

## Panoramica

Questo documento descrive la configurazione del sistema Keep-Alive implementato per prevenire la pausa automatica del database Supabase dopo 7 giorni di inattività sul piano gratuito.

## Architettura

Il sistema utilizza **Vercel Cron Jobs** per eseguire automaticamente una query leggera al database ogni 3 giorni, mantenendolo attivo.

```
Vercel Cron Job (ogni 3 giorni)
    ↓
/api/keep-alive (Serverless Function)
    ↓
SELECT 1 → Supabase Database
    ↓
Database rimane attivo (non va in standby)
```

## File Implementati

### 1. `/api/keep-alive.ts`

Serverless Function Vercel che:
- Verifica l'autenticazione tramite `CRON_SECRET`
- Crea un client Supabase per ambiente Node.js (senza `window` o `import.meta.env`)
- Esegue una query `SELECT 1` ultra-leggera
- Restituisce un JSON con status e timestamp

### 2. `/vercel.json`

Configurazione aggiornata con sezione `crons`:
```json
{
  "crons": [
    {
      "path": "/api/keep-alive",
      "schedule": "0 8 */3 * *"
    }
  ]
}
```

**Schedule**: `0 8 */3 * *`
- Esegue ogni 3 giorni
- Alle 08:00 UTC (10:00 ora italiana in inverno, 10:00 in estate)
- Ben prima del limite di 7 giorni per la pausa automatica

## Variabili d'Ambiente Richieste

Configurare in **Vercel Dashboard** → **Settings** → **Environment Variables**:

### 1. `CRON_SECRET` ⚠️ OBBLIGATORIO

- **Descrizione**: Token segreto per autenticare le chiamate cron
- **Generazione**: Automatica da Vercel quando si crea il cron job
- **Valore**: Generato automaticamente (non modificare manualmente)
- **Scope**: Production, Preview, Development

### 2. `SUPABASE_URL` ⚠️ OBBLIGATORIO

- **Descrizione**: URL del progetto Supabase
- **Dove trovarlo**: Supabase Dashboard → Project Settings → API → Project URL
- **Formato**: `https://[PROJECT_REF].supabase.co`
- **Esempio**: `https://xyzabc123.supabase.co`
- **Scope**: Production, Preview, Development

### 3. `SUPABASE_ANON_KEY` ⚠️ OBBLIGATORIO

- **Descrizione**: Chiave pubblica anonima di Supabase
- **Dove trovarla**: Supabase Dashboard → Project Settings → API → `anon` `public`
- **Formato**: JWT lungo (inizia con `eyJ...`)
- **Scope**: Production, Preview, Development
- **Nota**: È sicuro usarla lato client e server

## Differenza con Variabili Frontend

⚠️ **IMPORTANTE**: Le serverless functions NON usano le variabili con prefisso `VITE_*`.

| Frontend (Vite) | Serverless (Node.js) |
|-----------------|----------------------|
| `VITE_SUPABASE_URL` | `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY` |

**Motivo**: Le serverless functions girano in ambiente Node.js, non in Vite, quindi usano `process.env` invece di `import.meta.env`.

## Procedura di Deploy

### Passo 1: Verificare i File

✅ Assicurarsi che esistano:
- `api/keep-alive.ts`
- `vercel.json` con sezione `crons`

### Passo 2: Configurare Variabili Ambiente

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il progetto
3. Vai in **Settings** → **Environment Variables**
4. Aggiungi le seguenti variabili:

**SUPABASE_URL**
```
Name: SUPABASE_URL
Value: https://[TUO_PROJECT_REF].supabase.co
Environment: Production, Preview, Development
```

**SUPABASE_ANON_KEY**
```
Name: SUPABASE_ANON_KEY
Value: eyJ... (copia dalla Dashboard Supabase)
Environment: Production, Preview, Development
```

**CRON_SECRET** (si genera automaticamente)
```
Nota: Questa variabile viene generata automaticamente da Vercel
quando si crea il cron job. Non è necessario inserirla manualmente.
```

### Passo 3: Deploy su Vercel

```bash
# Commit delle modifiche
git add api/keep-alive.ts vercel.json
git commit -m "feat: Implementa keep-alive per Supabase con Vercel Cron"
git push origin main

# Vercel farà il deploy automaticamente (se connesso con GitHub)
```

### Passo 4: Verificare il Deploy

1. Vai su **Vercel Dashboard** → **Deployments**
2. Clicca sull'ultimo deployment
3. Verifica che sia **Ready**
4. Vai in **Settings** → **Cron Jobs**
5. Dovresti vedere:
   - Path: `/api/keep-alive`
   - Schedule: `0 8 */3 * *`
   - Status: **Active**

### Passo 5: Test Manuale (Opzionale)

Puoi testare l'endpoint manualmente:

```bash
# Recupera CRON_SECRET da Vercel Dashboard
curl -X GET https://[TUO_DOMINIO].vercel.app/api/keep-alive \
  -H "Authorization: Bearer [CRON_SECRET]"
```

**Risposta attesa (200)**:
```json
{
  "success": true,
  "timestamp": "2025-01-06T12:00:00.000Z",
  "message": "Database keep-alive successful"
}
```

**Risposta errore autenticazione (401)**:
```json
{
  "success": false,
  "error": "Unauthorized",
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

## Monitoraggio

### Vercel Dashboard

1. **Cron Jobs**: Vercel Dashboard → Settings → Cron Jobs
   - Mostra lo stato del cron job
   - Ultimi trigger
   - Prossimo trigger

2. **Functions**: Vercel Dashboard → Logs
   - Log delle esecuzioni della funzione `/api/keep-alive`
   - Timestamp di ogni chiamata
   - Eventuali errori

### Supabase Dashboard

1. **Database Activity**: Supabase Dashboard → Database → Logs
   - Mostra le query eseguite
   - Verifica che `SELECT 1` venga eseguito regolarmente

## Troubleshooting

### ❌ Error: "Missing Supabase configuration"

**Causa**: Variabili ambiente non configurate in Vercel

**Soluzione**:
1. Vai su Vercel Dashboard → Settings → Environment Variables
2. Aggiungi `SUPABASE_URL` e `SUPABASE_ANON_KEY`
3. Redeploy il progetto

### ❌ Error: "Unauthorized"

**Causa**: `CRON_SECRET` mancante o non corretto

**Soluzione**:
1. Verifica che Vercel abbia generato automaticamente `CRON_SECRET`
2. Vai su Vercel Dashboard → Settings → Environment Variables
3. Se mancante, elimina e ricrea il cron job in `vercel.json`

### ❌ Cron Job non si attiva

**Causa**: Configurazione errata in `vercel.json`

**Soluzione**:
1. Verifica la sintassi in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/keep-alive",
      "schedule": "0 8 */3 * *"
    }
  ]
}
```
2. Redeploy il progetto
3. Verifica in Vercel Dashboard → Settings → Cron Jobs

### ❌ Database va comunque in pausa

**Causa**: Frequenza insufficiente o funzione fallisce

**Soluzione**:
1. Controlla i log in Vercel Dashboard → Logs
2. Verifica che la funzione venga eseguita ogni 3 giorni
3. Se necessario, aumenta la frequenza a `0 8 */2 * *` (ogni 2 giorni)

## Costi

✅ **Completamente GRATUITO** su Vercel Hobby Plan:
- Cron Jobs inclusi (nessun costo)
- Serverless Functions incluse (nessun costo per chiamate così leggere)
- Esecuzione ogni 3 giorni = ~10 esecuzioni/mese (ben sotto i limiti gratuiti)

## Alternative (Non Implementate)

Se Vercel Cron non dovesse funzionare, alternative possibili:

1. **GitHub Actions**: Workflow schedulato
2. **Supabase Edge Functions**: Con trigger esterno
3. **Servizi esterni**: UptimeRobot, cron-job.org (non consigliati)

**Motivo della scelta**: Vercel Cron è la soluzione più integrata e zero-config per progetti già deployati su Vercel.

## Riferimenti

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Supabase Free Tier Limits](https://supabase.com/docs/guides/platform/going-into-prod)
- [Supabase Serverless Drivers](https://supabase.com/docs/guides/database/connecting-to-postgres/serverless-drivers)

---

**Data implementazione**: Gennaio 2025  
**Ultima verifica**: 06/01/2025

