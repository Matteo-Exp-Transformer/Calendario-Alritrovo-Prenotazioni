# 🔧 Configurazione Variabili d'Ambiente su Vercel

## ⚠️ Problema
L'errore `Missing Supabase environment variables` su Vercel è causato da variabili d'ambiente mancanti nel deploy.

## ✅ Soluzione

### 1. Aggiungi Variabili d'Ambiente su Vercel

1. **Vai su**: https://vercel.com/dashboard
2. **Seleziona** il tuo progetto (`Calendario-Alritrovo-Prenotazioni`)
3. **Vai in**: Settings → Environment Variables
4. **Aggiungi** queste variabili:

```bash
# Supabase
VITE_SUPABASE_URL = https://dphuttzgdcerexunebct.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHV0dHpnZGNlcmV4dW5lYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTI0NDMsImV4cCI6MjA3NzA4ODQ0M30.8OpmfjuZkT2vdSbOcr4fUeaKaKibuF4vdFLnNSk7h60

# Resend Email
RESEND_API_KEY = re_XoehnRJ5_CkiBSxtww3G9TSPXyASi7u5H
SENDER_EMAIL = noreply@resend.dev
SENDER_NAME = Al Ritrovo

# App Config (opzionali)
VITE_APP_ENV = production
VITE_RESTAURANT_NAME = Al Ritrovo
VITE_RESTAURANT_ADDRESS = Bologna, Italia
```

### 2. Seleziona Ambienti di Applicazione

Per ogni variabile, assicurati di selezionare:
- ✅ **Production**
- ✅ **Preview** (opzionale, per branch)
- ❌ **Development** (usa .env.local locale)

### 3. Redeploy

Dopo aver aggiunto le variabili:

1. **Vai in**: Deployments
2. **Trova** l'ultimo deployment fallito
3. **Click** sui tre puntini (...)
4. **Seleziona**: "Redeploy"

Oppure, automaticamente:
- Fai un commit vuoto per triggerare un nuovo deploy

```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

### 4. Verifica

Dopo il redeploy, controlla:
- ✅ Console browser senza errori Supabase
- ✅ App carica correttamente
- ✅ Form prenotazioni funziona
- ✅ Admin login funziona

---

## 📋 Quick Copy & Paste per Vercel

**Procedura rapida**:
1. Copia tutte le variabili sopra
2. Incolla nel campo "Environment Variables" di Vercel
3. Verifica che tutte siano selezionate per "Production"
4. Salva
5. Fai redeploy

---

## 🔍 Verifica File .env.local Locale

Se il file `.env.local` è stato creato correttamente, riavvia il dev server:

```bash
npm run dev
```

L'app locale dovrebbe funzionare correttamente.

---

## 📝 Note Importanti

- Le variabili d'ambiente in Vercel sono **NECESSARIE** per il deploy produzione
- Il file `.env.local` serve **SOLO** per lo sviluppo locale
- Vercel non legge file `.env.local` nel deploy (sono ignorati da .gitignore)
- Le chiavi `VITE_*` vengono esposte pubblicamente nel bundle, quindi usa solo chiavi pubbliche (anon key)
- Never commit `.env.local` nel repository (già in .gitignore)

---

**Dopo queste configurazioni, Vercel dovrebbe deployare senza errori!** ✅

