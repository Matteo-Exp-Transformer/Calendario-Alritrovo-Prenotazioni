# Configurazione Email - Invio a Qualsiasi Destinatario

## Panoramica

Il sistema supporta l'invio di email a **qualsiasi indirizzo email**, non solo a indirizzi autorizzati. Inoltre, supporta l'invio a **multiple destinatari** (fino a 50) tramite array.

## Requisiti

Per abilitare l'invio a qualsiasi indirizzo email, è necessario configurare una **API Key Resend con i permessi appropriati**.

## Configurazione API Key Resend

### Opzione 1: API Key con Accesso Completo (Full Access)

Questa opzione consente di creare, eliminare, ottenere e aggiornare qualsiasi risorsa Resend.

```bash
# Usando Node.js/Deno
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxx'); // La tua API Key esistente

const { data, error } = await resend.apiKeys.create({
  name: 'Production - Full Access'
});
```

**Nota**: L'API Key creata avrà automaticamente accesso completo se l'account Resend lo consente.

### Opzione 2: API Key con Solo Invio (Sending Access)

Questa opzione consente esclusivamente di inviare email, che è sufficiente per la maggior parte dei casi d'uso.

```bash
# Usando Node.js/Deno
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxx');

const { data, error } = await resend.apiKeys.create({
  name: 'Production - Sending Only'
});
```

## Configurazione in Supabase

Una volta creata l'API Key con i permessi appropriati:

1. **Vai al Dashboard Supabase**
   - URL: https://supabase.com/dashboard
   - Seleziona il tuo progetto

2. **Configura i Secrets per Edge Function**
   - Naviga a: **Settings** → **Edge Functions** → **Secrets**
   - Aggiungi/modifica il secret `RESEND_API_KEY` con la nuova API Key

```bash
# Via Supabase CLI (alternativa)
supabase secrets set RESEND_API_KEY=re_nuova_api_key_con_permessi
```

3. **Rideploya la Edge Function** (se necessario)

```bash
supabase functions deploy send-email
```

## Formato Destinatari

### Singolo Destinatario (String)

```typescript
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: 'cliente@example.com',
  subject: 'Test Email',
  html: '<p>Contenuto email</p>'
})
```

### Multiple Destinatari (Array)

```typescript
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: [
    'cliente1@example.com',
    'cliente2@example.com',
    'cliente3@example.com'
  ],
  subject: 'Test Email Multipla',
  html: '<p>Contenuto email</p>'
})
```

**Limite**: Massimo **50 destinatari** per email (limite di Resend API).

## Validazione

Il sistema valida automaticamente:

1. **Formato email**: Verifica che ogni indirizzo sia valido (regex base)
2. **Numero destinatari**: Rejecta richieste con più di 50 destinatari
3. **Tipo dato**: Accetta solo `string` o `string[]`

### Esempio di Validazione

```typescript
// ✅ Valido - Singolo destinatario
to: 'user@example.com'

// ✅ Valido - Array di destinatari (fino a 50)
to: ['user1@example.com', 'user2@example.com', ...]

// ❌ Non valido - Più di 50 destinatari
to: Array.from({ length: 51 }, (_, i) => `user${i}@test.com`)

// ❌ Non valido - Formato email errato
to: 'not-an-email'
```

## Edge Function

La Edge Function `send-email` gestisce automaticamente:

- Validazione formato email
- Validazione numero destinatari (max 50)
- Supporto per `string | string[]`
- Gestione errori appropriata

### Esempio Risposta Errore

```json
{
  "error": "Too many recipients. Maximum 50 recipients allowed."
}
```

## Logging

Quando si inviano email a multiple destinatari, il log nel database (`email_logs`) contiene tutti i destinatari separati da virgola:

```typescript
recipient_email: "user1@example.com, user2@example.com, user3@example.com"
```

## Test

I test end-to-end verificano:

- Invio a qualsiasi indirizzo email (non solo autorizzati)
- Supporto array di destinatari
- Validazione limite 50 destinatari
- Validazione formato email

```bash
# Eseguire test email
npx playwright test e2e/validation/test-email-any-recipient.spec.ts
```

## Modifiche Implementate

### 1. TypeScript Types (`src/lib/email.ts`)

```typescript
interface SendEmailOptions {
  to: string | string[] // Support both single email and array (max 50 recipients)
  // ...
}
```

### 2. Edge Function (`supabase/functions/send-email/index.ts`)

- Validazione array destinatari
- Validazione formato email
- Limite 50 destinatari
- Supporto `string | string[]`

### 3. Logging

Gestione automatica di destinatari multipli nel log database.

## Troubleshooting

### Errore: "Unauthorized email domain"

**Causa**: API Key non ha i permessi per inviare a qualsiasi dominio.

**Soluzione**: Crea una nuova API Key con accesso completo o solo invio come descritto sopra.

### Errore: "Too many recipients"

**Causa**: Tentativo di inviare a più di 50 destinatari.

**Soluzione**: Dividi l'invio in batch da 50 destinatari ciascuno.

### Errore: "Invalid email format"

**Causa**: Uno o più indirizzi email nel formato errato.

**Soluzione**: Verifica il formato degli indirizzi email prima dell'invio.

## Riferimenti

- [Resend API Documentation](https://resend.com/docs/api-reference)
- [Resend API Keys](https://resend.com/docs/api-reference/api-keys)
- [Resend Email Sending](https://resend.com/docs/api-reference/emails/send-email)








