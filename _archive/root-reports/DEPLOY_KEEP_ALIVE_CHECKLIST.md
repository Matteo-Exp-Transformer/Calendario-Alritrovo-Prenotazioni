# ✅ Checklist Deploy Keep-Alive Supabase

## Status Deploy

**Data**: 06 Gennaio 2025  
**Commit**: `fd97b9b` - feat: Implementa keep-alive Supabase con Vercel Cron Jobs  
**Branch**: `main`  
**Push**: ✅ Completato

---

## 🧪 Test Locale

- ✅ Dipendenze installate (`npm install`)
- ✅ Test locale eseguito con successo
- ✅ Connessione Supabase verificata
- ✅ Query keep-alive funzionante (fallback su `restaurant_settings`)
- ✅ Response format valido

---

## 📦 File Deployati

- ✅ `api/keep-alive.ts` - Serverless function
- ✅ `api/README.md` - Documentazione API
- ✅ `vercel.json` - Configurazione cron job
- ✅ `package.json` - Dipendenze aggiornate
- ✅ `KEEP_ALIVE_SETUP.md` - Quick reference
- ✅ `docs/development/VERCEL_KEEP_ALIVE_SETUP.md` - Documentazione completa

---

## 🚀 Vercel Dashboard - Azioni Richieste

### 1. Verifica Deploy ⏳ IN ATTESA

- [ ] Vai su [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Seleziona il progetto "Calendario Al Ritrovo"
- [ ] Vai in **Deployments**
- [ ] Verifica che l'ultimo deployment sia **Ready** (verde)
- [ ] Clicca sul deployment e verifica che non ci siano errori

### 2. Configura Variabili Ambiente ⚠️ OBBLIGATORIO

- [ ] Vai su **Settings** → **Environment Variables**
- [ ] Aggiungi `SUPABASE_URL`:
  ```
  Name: SUPABASE_URL
  Value: https://dphuttzgdcerexunebct.supabase.co
  Environment: Production, Preview, Development
  ```
- [ ] Aggiungi `SUPABASE_ANON_KEY`:
  ```
  Name: SUPABASE_ANON_KEY
  Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHV0dHpnZGNlcmV4dW5lYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTI0NDMsImV4cCI6MjA3NzA4ODQ0M30.8OpmfjuZkT2vdSbOcr4fUeaKaKibuF4vdFLnNSk7h60
  Environment: Production, Preview, Development
  ```
- [ ] Clicca **Save**

**Nota**: `CRON_SECRET` viene generato automaticamente da Vercel

### 3. Verifica Cron Job ⏳ IN ATTESA

- [ ] Vai su **Settings** → **Cron Jobs**
- [ ] Verifica che sia presente:
  - **Path**: `/api/keep-alive`
  - **Schedule**: `0 8 */3 * *`
  - **Status**: Active (verde)
- [ ] Annota il prossimo trigger previsto

### 4. Redeploy (dopo aver aggiunto variabili) ⚠️ OBBLIGATORIO

Dopo aver aggiunto le variabili ambiente, è necessario un redeploy:

- [ ] Vai su **Deployments**
- [ ] Clicca sui tre puntini dell'ultimo deployment
- [ ] Seleziona **Redeploy**
- [ ] Attendi che il nuovo deployment sia **Ready**

---

## 🧪 Test in Produzione

### Test Manuale Endpoint (Opzionale)

⚠️ **Nota**: Serve il `CRON_SECRET` da Vercel Dashboard

```bash
# Recupera CRON_SECRET da Vercel Dashboard → Settings → Environment Variables
curl -X GET https://[TUO-DOMINIO].vercel.app/api/keep-alive \
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

**Risposta senza autenticazione (401)**:
```json
{
  "success": false,
  "error": "Unauthorized",
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

### Verifica Automatica Cron

- [ ] Attendi la prima esecuzione automatica (controlla "Next run" in Cron Jobs)
- [ ] Vai su **Logs** (o **Functions**)
- [ ] Filtra per `/api/keep-alive`
- [ ] Verifica che la chiamata sia andata a buon fine (status 200)

---

## 📊 Monitoraggio

### Vercel Dashboard

**Logs**: Vercel Dashboard → Logs
- Filtra per `/api/keep-alive`
- Verifica timestamp delle esecuzioni
- Controlla eventuali errori

**Cron Jobs**: Vercel Dashboard → Settings → Cron Jobs
- Mostra stato del cron
- Ultimi trigger
- Prossimo trigger

### Supabase Dashboard

**Database Activity**: Supabase Dashboard → Database → Logs
- Verifica query `SELECT` periodiche
- Conferma che il database rimanga attivo

---

## 🎯 Risultati Attesi

### Immediati (dopo deploy)
- ✅ Endpoint `/api/keep-alive` accessibile
- ✅ Cron job configurato e attivo
- ✅ Variabili ambiente configurate

### A medio termine (dopo 3 giorni)
- ✅ Prima esecuzione automatica del cron
- ✅ Log positivo in Vercel Dashboard
- ✅ Query registrata in Supabase

### A lungo termine (dopo 7+ giorni)
- ✅ Database Supabase NON va in pausa
- ✅ Applicazione sempre disponibile
- ✅ Nessun downtime per inattività

---

## 🆘 Troubleshooting

### ❌ "Missing Supabase configuration"
**Causa**: Variabili ambiente non configurate  
**Soluzione**: Aggiungi `SUPABASE_URL` e `SUPABASE_ANON_KEY` in Vercel → Redeploy

### ❌ "Unauthorized"
**Causa**: `CRON_SECRET` mancante o errato  
**Soluzione**: Verifica che Vercel abbia generato `CRON_SECRET` automaticamente

### ❌ Cron non si attiva
**Causa**: Configurazione errata in `vercel.json`  
**Soluzione**: Verifica sintassi JSON e redeploy

### ❌ Database va in pausa comunque
**Causa**: Funzione fallisce silenziosamente  
**Soluzione**: Controlla log in Vercel Dashboard → Aumenta frequenza a ogni 2 giorni

---

## 📚 Documentazione

- **Quick Reference**: [`KEEP_ALIVE_SETUP.md`](KEEP_ALIVE_SETUP.md)
- **Guida Completa**: [`docs/development/VERCEL_KEEP_ALIVE_SETUP.md`](docs/development/VERCEL_KEEP_ALIVE_SETUP.md)
- **API Documentation**: [`api/README.md`](api/README.md)

---

## ✅ Conferma Finale

Una volta completati tutti i passaggi:

- [ ] Deploy Vercel completato e verde
- [ ] Variabili ambiente configurate
- [ ] Cron job attivo
- [ ] Test manuale eseguito (opzionale)
- [ ] Monitoraggio configurato
- [ ] Documentazione letta

**Status**: 🟡 IN ATTESA DI CONFIGURAZIONE VERCEL

**Prossima azione**: Configurare variabili ambiente in Vercel Dashboard

---

**Ultima modifica**: 06/01/2025  
**Autore**: AI Agent (Cursor)

