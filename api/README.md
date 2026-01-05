# API Serverless Functions

Questa cartella contiene le Vercel Serverless Functions per il progetto Al Ritrovo.

## Struttura

```
api/
├── README.md              # Questo file
└── keep-alive.ts          # Keep-Alive per database Supabase
```

## Keep-Alive Function

### Scopo

La funzione `keep-alive.ts` viene chiamata automaticamente da Vercel Cron Jobs ogni 3 giorni per mantenere attivo il database Supabase e prevenire la pausa automatica dopo 7 giorni di inattività (limitazione del piano gratuito).

### Caratteristiche

- **Runtime**: Node.js (Vercel Serverless)
- **Method**: GET
- **Autenticazione**: Bearer token tramite `CRON_SECRET`
- **Query**: `SELECT 1` o fallback su `restaurant_settings`
- **Frequenza**: Ogni 3 giorni alle 08:00 UTC

### Configurazione

Vedi [`docs/development/VERCEL_KEEP_ALIVE_SETUP.md`](../docs/development/VERCEL_KEEP_ALIVE_SETUP.md) per:
- Setup variabili ambiente
- Procedura di deploy
- Troubleshooting
- Monitoraggio

### Endpoint

**URL**: `https://[dominio].vercel.app/api/keep-alive`

**Headers richiesti**:
```
Authorization: Bearer [CRON_SECRET]
```

**Response (200 - Success)**:
```json
{
  "success": true,
  "timestamp": "2025-01-06T12:00:00.000Z",
  "message": "Database keep-alive successful"
}
```

**Response (401 - Unauthorized)**:
```json
{
  "success": false,
  "error": "Unauthorized",
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

**Response (500 - Error)**:
```json
{
  "success": false,
  "timestamp": "2025-01-06T12:00:00.000Z",
  "error": "Error message"
}
```

## Aggiungere Nuove Functions

Per aggiungere nuove serverless functions:

1. Creare un nuovo file `.ts` in questa cartella
2. Esportare una funzione `handler(req: VercelRequest, res: VercelResponse)`
3. Configurare eventuali variabili ambiente in Vercel Dashboard
4. Se necessario cron job, aggiornare `vercel.json`

### Esempio

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ message: 'Hello from API!' })
}
```

## Note Tecniche

### Differenze con Frontend

Le serverless functions girano in **ambiente Node.js**, non in Vite:

| Frontend (Vite) | Serverless (Node.js) |
|-----------------|----------------------|
| `import.meta.env.VITE_*` | `process.env.*` |
| `window.localStorage` | ❌ Non disponibile |
| Browser APIs | ❌ Non disponibili |

### TypeScript

I tipi per Vercel sono forniti da `@vercel/node`:

```bash
npm install --save-dev @vercel/node
```

### Variabili Ambiente

Le variabili devono essere configurate in **Vercel Dashboard** → **Settings** → **Environment Variables**, **NON** nel file `.env.local` (che è solo per sviluppo locale).

## Riferimenti

- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

