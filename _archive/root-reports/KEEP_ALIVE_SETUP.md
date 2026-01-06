# 🔄 Keep-Alive Supabase - Quick Reference

Sistema implementato per prevenire la pausa automatica del database Supabase dopo 7 giorni di inattività.

## ⚡ Quick Start

### 1. Installare le dipendenze

```bash
npm install
```

### 2. Configurare le variabili ambiente in Vercel

Vai su **Vercel Dashboard** → **Settings** → **Environment Variables** e aggiungi:

| Variabile | Valore | Dove trovarlo |
|-----------|--------|---------------|
| `SUPABASE_URL` | `https://[ref].supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | `eyJ...` | Supabase Dashboard → Settings → API |

> **Nota**: `CRON_SECRET` viene generato automaticamente da Vercel

### 3. Deploy su Vercel

```bash
git add .
git commit -m "feat: Add Supabase keep-alive with Vercel Cron"
git push origin main
```

### 4. Verificare il setup

1. Vai su **Vercel Dashboard** → **Settings** → **Cron Jobs**
2. Verifica che sia attivo:
   - Path: `/api/keep-alive`
   - Schedule: `0 8 */3 * *` (ogni 3 giorni alle 08:00 UTC)

## 📁 File Implementati

| File | Descrizione |
|------|-------------|
| [`api/keep-alive.ts`](api/keep-alive.ts) | Serverless function per keep-alive |
| [`vercel.json`](vercel.json) | Configurazione cron job |
| [`docs/development/VERCEL_KEEP_ALIVE_SETUP.md`](docs/development/VERCEL_KEEP_ALIVE_SETUP.md) | Documentazione completa |

## 🔍 Come Funziona

```
Vercel Cron (ogni 3 giorni) → /api/keep-alive → SELECT 1 → Supabase DB → Rimane attivo
```

## ✅ Vantaggi

- ✅ Zero costi (incluso in Vercel Hobby)
- ✅ Automatico (nessun intervento manuale)
- ✅ Sicuro (autenticazione con CRON_SECRET)
- ✅ Monitorato (log in Vercel Dashboard)

## 📚 Documentazione Completa

Per setup dettagliato, troubleshooting e monitoraggio:
👉 [`docs/development/VERCEL_KEEP_ALIVE_SETUP.md`](docs/development/VERCEL_KEEP_ALIVE_SETUP.md)

## 🧪 Test Manuale

```bash
# Recupera CRON_SECRET da Vercel Dashboard
curl -X GET https://[tuo-dominio].vercel.app/api/keep-alive \
  -H "Authorization: Bearer [CRON_SECRET]"
```

**Risposta attesa**:
```json
{
  "success": true,
  "timestamp": "2025-01-06T12:00:00.000Z",
  "message": "Database keep-alive successful"
}
```

## 🆘 Problemi?

| Errore | Soluzione |
|--------|-----------|
| "Missing Supabase configuration" | Aggiungi `SUPABASE_URL` e `SUPABASE_ANON_KEY` in Vercel |
| "Unauthorized" | Verifica che `CRON_SECRET` sia configurato |
| Cron non si attiva | Controlla `vercel.json` e redeploy |

---

**Implementato**: Gennaio 2025  
**Ultima verifica**: 06/01/2025

