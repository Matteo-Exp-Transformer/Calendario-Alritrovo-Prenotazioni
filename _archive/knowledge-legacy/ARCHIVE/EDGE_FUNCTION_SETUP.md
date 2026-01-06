# 🚀 Setup Edge Function per Invio Email

## ✅ Status

- ✅ Edge Function `send-email` deployata su Supabase
- ✅ Client configurato per chiamare Edge Function
- ⚠️ **Manca configurazione variabili ambiente**

## 📋 Prossimi Passi

### 1. Configurare Variabili Ambiente in Supabase

Vai su: https://supabase.com/dashboard/project/tucqgcfrlzmwyfadiodo/settings/functions

Oppure usa Supabase CLI:
```bash
supabase secrets set RESEND_API_KEY=re_XoehnRJ5_CkiBSxtww3G9TSPXyASi7u5H
supabase secrets set SENDER_EMAIL=noreply@resend.dev
supabase secrets set SENDER_NAME=Al Ritrovo
```

### 2. Variabili da Configurare

- `RESEND_API_KEY`: `re_XoehnRJ5_CkiBSxtww3G9TSPXyASi7u5H`
- `SENDER_EMAIL`: `noreply@resend.dev`
- `SENDER_NAME`: `Al Ritrovo`

### 3. Test

Dopo aver configurato le variabili:
1. Accetta una prenotazione
2. Controlla i log email
3. Verifica invio email reale

---

## 📍 URL Edge Function

**Prod:** `https://tucqgcfrlzmwyfadiodo.supabase.co/functions/v1/send-email`

---

## 🔧 Comandi Utili

```bash
# Deploy Edge Function
supabase functions deploy send-email

# View logs
supabase functions logs send-email

# Set secrets
supabase secrets set KEY=value
```

