# 🔐 Setup Secrets per Edge Function

## ⚠️ AZIONE RICHIESTA

Devi configurare manualmente i secrets in Supabase Dashboard.

## 📋 Procedura

1. **Vai su:** https://supabase.com/dashboard/project/tucqgcfrlzmwyfadiodo/settings/functions

2. **Cerca "Edge Function Secrets"** o "Secrets Management"

3. **Aggiungi queste 3 variabili:**

   ```
   RESEND_API_KEY = re_XoehnRJ5_CkiBSxtww3G9TSPXyASi7u5H
   SENDER_EMAIL = noreply@resend.dev
   SENDER_NAME = Al Ritrovo
   ```

4. **Clicca "Save"**

## 📍 URL Dashboard

**Direct Link:** https://supabase.com/dashboard/project/tucqgcfrlzmwyfadiodo/settings/functions

## ✅ Dopo aver configurato

1. Ricarica la pagina dell'app (http://localhost:5177)
2. Accetta una prenotazione
3. Verifica che l'email venga inviata
4. Controlla i log in "View Email Logs"

## 🔍 Nota su SENDER_EMAIL

- `noreply@resend.dev` è un indirizzo di **test** fornito da Resend
- Per produzione, dovresti verificare il tuo dominio in Resend
- Per ora funziona per test!

## 🎯 Alternative per Production

Se vuoi usare il tuo dominio:
1. Vai su Resend Dashboard
2. Verifica il tuo dominio
3. Usa: `noreply@tudominio.com`

---

**Una volta configurato, il sistema invierà email automaticamente!** 🚀

