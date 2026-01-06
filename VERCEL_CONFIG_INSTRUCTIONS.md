# 🔧 Istruzioni Configurazione Vercel - Keep-Alive

**Tempo stimato**: 5 minuti  
**Difficoltà**: ⭐ Facile

---

## 📍 Passo 1: Accedi a Vercel Dashboard

1. Vai su [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Effettua il login se necessario
3. Seleziona il progetto **"Calendario Al Ritrovo"** (o nome simile)

---

## 📍 Passo 2: Verifica Deploy Completato

1. Clicca su **"Deployments"** nella barra laterale
2. Verifica che l'ultimo deployment sia **"Ready"** (verde ✅)
3. Se vedi errori, clicca sul deployment per vedere i dettagli

**Commit atteso**: `fd97b9b - feat: Implementa keep-alive Supabase con Vercel Cron Jobs`

---

## 📍 Passo 3: Configura Variabili Ambiente

### 3.1 Naviga alle Impostazioni
1. Clicca su **"Settings"** nella barra superiore
2. Clicca su **"Environment Variables"** nel menu laterale

### 3.2 Aggiungi SUPABASE_URL

1. Clicca sul pulsante **"Add New"** (o "Add Variable")
2. Compila i campi:

```
┌─────────────────────────────────────────────┐
│ Name:                                       │
│ SUPABASE_URL                                │
├─────────────────────────────────────────────┤
│ Value:                                      │
│ https://dphuttzgdcerexunebct.supabase.co   │
├─────────────────────────────────────────────┤
│ Environment:                                │
│ ☑ Production                                │
│ ☑ Preview                                   │
│ ☑ Development                               │
└─────────────────────────────────────────────┘
```

3. Clicca **"Save"**

### 3.3 Aggiungi SUPABASE_ANON_KEY

1. Clicca di nuovo su **"Add New"**
2. Compila i campi:

```
┌─────────────────────────────────────────────┐
│ Name:                                       │
│ SUPABASE_ANON_KEY                           │
├─────────────────────────────────────────────┤
│ Value:                                      │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...    │
│ (token completo - vedi sotto)               │
├─────────────────────────────────────────────┤
│ Environment:                                │
│ ☑ Production                                │
│ ☑ Preview                                   │
│ ☑ Development                               │
└─────────────────────────────────────────────┘
```

**Token completo**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHV0dHpnZGNlcmV4dW5lYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTI0NDMsImV4cCI6MjA3NzA4ODQ0M30.8OpmfjuZkT2vdSbOcr4fUeaKaKibuF4vdFLnNSk7h60
```

3. Clicca **"Save"**

### 3.4 Verifica CRON_SECRET (Automatico)

⚠️ **NON aggiungere manualmente** - Vercel lo genera automaticamente

1. Scorri la lista delle variabili
2. Dovresti vedere **"CRON_SECRET"** già presente
3. Se NON è presente, verrà generato automaticamente al primo trigger del cron

---

## 📍 Passo 4: Redeploy (OBBLIGATORIO)

Le variabili ambiente vengono applicate solo dopo un redeploy.

### 4.1 Vai ai Deployments
1. Clicca su **"Deployments"** nella barra superiore
2. Trova l'ultimo deployment (quello con commit `fd97b9b`)

### 4.2 Esegui Redeploy
1. Clicca sui **tre puntini verticali** (⋮) a destra del deployment
2. Seleziona **"Redeploy"**
3. Conferma cliccando **"Redeploy"** nel popup

### 4.3 Attendi Completamento
1. Il nuovo deployment apparirà in cima alla lista
2. Attendi che lo status diventi **"Ready"** (verde ✅)
3. Tempo stimato: 1-3 minuti

---

## 📍 Passo 5: Verifica Cron Job

### 5.1 Naviga a Cron Jobs
1. Clicca su **"Settings"** nella barra superiore
2. Scorri fino a trovare **"Cron Jobs"** nel menu laterale
3. Clicca su **"Cron Jobs"**

### 5.2 Verifica Configurazione

Dovresti vedere:

```
┌─────────────────────────────────────────────┐
│ /api/keep-alive                             │
│                                             │
│ Schedule: 0 8 */3 * *                       │
│ Status: ● Active                            │
│                                             │
│ Next run: [data tra 3 giorni]              │
│ Last run: Not yet executed                  │
└─────────────────────────────────────────────┘
```

**Cosa significa lo schedule**:
- `0` = minuto 0
- `8` = ore 08:00 UTC (10:00 ora italiana)
- `*/3` = ogni 3 giorni
- `* *` = ogni mese, ogni giorno della settimana

---

## 📍 Passo 6: Test Manuale (Opzionale)

### 6.1 Recupera CRON_SECRET

1. Vai su **Settings** → **Environment Variables**
2. Trova **"CRON_SECRET"**
3. Clicca sull'icona **"👁️ Show"** per visualizzare il valore
4. Copia il token (inizia con caratteri casuali)

### 6.2 Recupera URL Progetto

1. Vai su **"Deployments"**
2. Clicca sull'ultimo deployment (Ready)
3. Copia l'URL del progetto (es: `https://calendario-alritrovo.vercel.app`)

### 6.3 Esegui Test con curl

Apri un terminale e esegui:

```bash
curl -X GET https://[TUO-URL].vercel.app/api/keep-alive \
  -H "Authorization: Bearer [CRON_SECRET]"
```

**Esempio**:
```bash
curl -X GET https://calendario-alritrovo.vercel.app/api/keep-alive \
  -H "Authorization: Bearer abc123xyz789"
```

**Risposta attesa** (200 OK):
```json
{
  "success": true,
  "timestamp": "2025-01-06T12:00:00.000Z",
  "message": "Database keep-alive successful"
}
```

**Se ricevi 401 Unauthorized**: Token errato o mancante

---

## 📍 Passo 7: Monitora i Log

### 7.1 Accedi ai Log

1. Clicca su **"Logs"** nella barra superiore (o **"Functions"** → **"Logs"**)
2. Filtra per `/api/keep-alive` nella barra di ricerca

### 7.2 Cosa Cercare

Dopo il test manuale (o dopo la prima esecuzione automatica), dovresti vedere:

```
[Keep-Alive] Executing database ping...
[Keep-Alive] Ping function not found, using fallback query
[Keep-Alive] Database ping successful
```

**Status**: 200 OK

---

## ✅ Checklist Finale

Verifica di aver completato tutti i passaggi:

- [ ] ✅ Deploy Vercel completato (Ready)
- [ ] ✅ `SUPABASE_URL` configurato
- [ ] ✅ `SUPABASE_ANON_KEY` configurato
- [ ] ✅ Redeploy eseguito
- [ ] ✅ Cron job visibile e attivo
- [ ] ✅ Test manuale eseguito (opzionale)
- [ ] ✅ Log verificati (opzionale)

---

## 🎉 Completato!

Il sistema Keep-Alive è ora completamente configurato e operativo!

### Cosa Succede Ora?

1. **Ogni 3 giorni** alle 08:00 UTC, Vercel chiamerà automaticamente `/api/keep-alive`
2. La funzione eseguirà una query leggera al database Supabase
3. Il database rimarrà attivo e NON andrà in pausa
4. Puoi monitorare le esecuzioni in **Vercel Dashboard → Logs**

### Prossimi Trigger

Il cron job si attiverà automaticamente:
- **Prima esecuzione**: Tra 3 giorni dalla configurazione
- **Frequenza**: Ogni 3 giorni
- **Orario**: 08:00 UTC (10:00 ora italiana)

---

## 🆘 Problemi?

### Errore: "Missing Supabase configuration"
- Verifica di aver aggiunto entrambe le variabili (`SUPABASE_URL` e `SUPABASE_ANON_KEY`)
- Verifica di aver fatto il redeploy
- Controlla che i valori siano corretti (nessuno spazio extra)

### Errore: "Unauthorized"
- Verifica che `CRON_SECRET` esista in Environment Variables
- Se fai test manuale, usa il token corretto
- Il cron automatico di Vercel passa sempre il token corretto

### Cron Job non visibile
- Verifica che `vercel.json` contenga la sezione `crons`
- Redeploy il progetto
- Attendi qualche minuto dopo il deploy

### Database va in pausa comunque
- Controlla i log in Vercel per vedere se la funzione viene eseguita
- Verifica che non ci siano errori nelle esecuzioni
- Considera di aumentare la frequenza a ogni 2 giorni

---

## 📚 Documentazione Completa

Per maggiori dettagli:
- **Quick Reference**: [`KEEP_ALIVE_SETUP.md`](KEEP_ALIVE_SETUP.md)
- **Guida Completa**: [`docs/development/VERCEL_KEEP_ALIVE_SETUP.md`](docs/development/VERCEL_KEEP_ALIVE_SETUP.md)
- **Test Report**: [`docs/development/KEEP_ALIVE_TEST_REPORT.md`](docs/development/KEEP_ALIVE_TEST_REPORT.md)

---

**Ultima modifica**: 06/01/2025  
**Tempo stimato**: 5 minuti  
**Difficoltà**: ⭐ Facile

