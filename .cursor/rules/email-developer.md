# Email System Developer Agent

**Specializzazione**: Fase 7 del PLANNING_TASKS.md
**Responsabilità**: Sistema email automatico con Resend + Supabase Edge Functions

## Compiti Principali

### 1. Setup Resend Account (15 min)
- Account già creato (riceverai API key)
- Configurazione variabili ambiente

### 2. Email Templates HTML (1h 15min)
- Template "Richiesta Ricevuta"
- Template "Prenotazione Confermata"
- Template "Prenotazione Rifiutata"
- Design responsive con colori Al Ritrovo

### 3. Supabase Edge Function (1h)
- Function `send-booking-email`
- Integrazione Resend API
- Logging in database (email_logs)
- Gestione errori

### 4. Database Triggers (30 min)
- Trigger INSERT → email "richiesta ricevuta"
- Trigger UPDATE status='accepted' → email "confermata"
- Trigger UPDATE status='rejected' → email "rifiutata"

## Files da Creare

```
src/
├── emails/
│   └── templates/
│       ├── requestReceived.ts
│       ├── bookingConfirmed.ts
│       └── bookingRejected.ts
│
supabase/
├── functions/
│   └── send-booking-email/
│       ├── index.ts
│       └── deno.json
└── migrations/
    └── 003_email_triggers.sql (già dovrebbe esistere da Fase 1)
```

## Variabili Ambiente

**Riceverai**:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDER_EMAIL=noreply@resend.dev  # Fase A (temporaneo)
```

**Dove aggiungerle**:
1. `.env.local` (sviluppo locale)
2. Vercel Environment Variables (produzione frontend)
3. Supabase Secrets (per Edge Functions):
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxxxx
   supabase secrets set SENDER_EMAIL=noreply@resend.dev
   ```

## Email Templates

### 1. requestReceived.ts
```typescript
export const requestReceivedTemplate = (booking: BookingRequest): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #8B0000;
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: #f9f9f9;
      padding: 30px 20px;
    }
    .details {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      border-left: 4px solid #DAA520;
    }
    .details p {
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
      background: #f0f0f0;
      border-radius: 0 0 8px 8px;
    }
    .emoji {
      font-size: 20px;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Al Ritrovo</h1>
      <p>Ristorante - Bologna</p>
    </div>

    <div class="content">
      <h2>Ciao ${booking.client_name},</h2>

      <p>Grazie per aver scelto <strong>Al Ritrovo</strong>!</p>

      <p>Abbiamo ricevuto la tua richiesta di prenotazione:</p>

      <div class="details">
        <p><span class="emoji">📅</span><strong>Data:</strong> ${formatDate(booking.desired_date)}</p>
        <p><span class="emoji">⏰</span><strong>Orario:</strong> ${booking.desired_time || 'Non specificato'}</p>
        <p><span class="emoji">👥</span><strong>Numero ospiti:</strong> ${booking.num_guests}</p>
        <p><span class="emoji">🎉</span><strong>Tipo:</strong> ${formatEventType(booking.event_type)}</p>
        ${booking.special_requests ? `<p><span class="emoji">📝</span><strong>Note:</strong> ${booking.special_requests}</p>` : ''}
      </div>

      <p>La tua richiesta è <strong style="color: #DAA520;">in attesa di conferma</strong>.</p>
      <p>Ti contatteremo presto per confermare la disponibilità.</p>

      <p style="margin-top: 30px;">
        A presto,<br>
        <strong>Il Team di Al Ritrovo</strong>
      </p>
    </div>

    <div class="footer">
      <p>Al Ritrovo - Bologna, Italia</p>
      <p style="font-size: 10px; color: #999;">
        Questa email è stata inviata automaticamente. Per favore non rispondere.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

// Helper functions
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatEventType(type: string): string {
  const types = {
    'cena': 'Cena',
    'aperitivo': 'Aperitivo',
    'evento': 'Evento Speciale',
    'laurea': 'Festa di Laurea'
  }
  return types[type] || type
}
```

### 2. bookingConfirmed.ts
**Aggiungi**:
- Badge "✅ CONFERMATA" verde
- Orario confermato (confirmed_start/confirmed_end)
- Pulsante "Come Raggiungerci" con link Google Maps
- Numero telefono ristorante per modifiche

### 3. bookingRejected.ts
**Aggiungi**:
- Messaggio scuse
- Motivo rifiuto se presente (rejection_reason)
- Pulsante "Richiedi Nuova Prenotazione" → link a /prenota

## Supabase Edge Function

**File**: `supabase/functions/send-booking-email/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import templates (copia il contenuto inline per Edge Functions)
import { requestReceivedTemplate } from './templates.ts'
import { bookingConfirmedTemplate } from './templates.ts'
import { bookingRejectedTemplate } from './templates.ts'

interface EmailRequest {
  type: 'request_received' | 'booking_confirmed' | 'booking_rejected'
  booking: any
}

serve(async (req) => {
  try {
    const { type, booking }: EmailRequest = await req.json()

    // Get API key from environment
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'noreply@resend.dev'

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Select template and subject
    const { subject, html } = getEmailContent(type, booking)

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Al Ritrovo <${SENDER_EMAIL}>`,
        to: booking.client_email,
        subject: subject,
        html: html
      })
    })

    const result = await response.json()

    // Log email in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabase.from('email_logs').insert({
      booking_id: booking.id,
      email_type: type,
      recipient_email: booking.client_email,
      status: response.ok ? 'sent' : 'failed',
      provider_response: result,
      error_message: response.ok ? null : result.message || 'Unknown error'
    })

    if (!response.ok) {
      console.error('Resend API error:', result)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: result }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function getEmailContent(type: string, booking: any) {
  switch (type) {
    case 'request_received':
      return {
        subject: 'Richiesta Prenotazione Ricevuta - Al Ritrovo',
        html: requestReceivedTemplate(booking)
      }
    case 'booking_confirmed':
      return {
        subject: '🎉 Prenotazione Confermata - Al Ritrovo',
        html: bookingConfirmedTemplate(booking)
      }
    case 'booking_rejected':
      return {
        subject: 'Richiesta Prenotazione - Al Ritrovo',
        html: bookingRejectedTemplate(booking)
      }
    default:
      throw new Error(`Unknown email type: ${type}`)
  }
}
```

**File**: `supabase/functions/send-booking-email/templates.ts`
```typescript
// Copia qui il contenuto dei 3 templates
export { requestReceivedTemplate } from '../../../src/emails/templates/requestReceived'
// etc...
```

## Database Triggers

**File**: `supabase/migrations/003_email_triggers.sql`

```sql
-- Enable HTTP extension per chiamate API
CREATE EXTENSION IF NOT EXISTS http;

-- Function: Notifica cambio status
CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
BEGIN
  function_url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-booking-email';

  -- Email conferma se accettato
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'booking_confirmed',
        'booking', row_to_json(NEW)
      )
    );
  END IF;

  -- Email rifiuto se rifiutato
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'booking_rejected',
        'booking', row_to_json(NEW)
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_status_change();

-- Function: Notifica nuova richiesta
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
BEGIN
  function_url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-booking-email';

  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'request_received',
      'booking', row_to_json(NEW)
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_booking_request
  AFTER INSERT ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_booking();
```

**IMPORTANTE**: Sostituisci `YOUR_PROJECT_ID` con ID reale Supabase!

## Deploy Edge Function

```bash
# Login Supabase
supabase login

# Link al progetto
supabase link --project-ref YOUR_PROJECT_ID

# Deploy function
supabase functions deploy send-booking-email

# Set secrets
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set SENDER_EMAIL=noreply@resend.dev

# Test function
supabase functions invoke send-booking-email --data '{
  "type": "request_received",
  "booking": {
    "id": "test-123",
    "client_name": "Mario Rossi",
    "client_email": "test@example.com",
    "desired_date": "2025-02-15",
    "desired_time": "20:00",
    "num_guests": 4,
    "event_type": "cena"
  }
}'
```

## Checklist Completamento

- [ ] Account Resend configurato (API key ricevuta)
- [ ] Template requestReceived.ts completo e testato
- [ ] Template bookingConfirmed.ts completo e testato
- [ ] Template bookingRejected.ts completo e testato
- [ ] Email responsive su mobile
- [ ] Edge Function `send-booking-email` creata
- [ ] Edge Function deployed su Supabase
- [ ] Secrets RESEND_API_KEY e SENDER_EMAIL configurati
- [ ] Migration 003_email_triggers.sql eseguita
- [ ] Trigger INSERT testato (nuova richiesta → email)
- [ ] Trigger UPDATE accepted testato (conferma → email)
- [ ] Trigger UPDATE rejected testato (rifiuto → email)
- [ ] Email loggata correttamente in `email_logs` table
- [ ] Email arrivano in inbox (non spam)

## Test Cases

### Test 1: Email Richiesta Ricevuta
1. Crea nuova richiesta dal form pubblico
2. Verifica email ricevuta entro 10 secondi
3. Controlla tutti i dati corretti
4. Verifica mittente: `Al Ritrovo <noreply@resend.dev>`
5. Verifica log in email_logs (status='sent')

### Test 2: Email Conferma
1. Accetta richiesta pending da dashboard admin
2. Verifica email ricevuta
3. Controlla orari confermati corretti
4. Verifica pulsante Google Maps funzionante

### Test 3: Email Rifiuto
1. Rifiuta richiesta pending con motivo
2. Verifica email ricevuta
3. Controlla motivo presente nel corpo
4. Verifica link "Nuova prenotazione" funzionante

### Test 4: Gestione Errori
1. Testa con email invalida → log status='failed'
2. Verifica error_message popolato in email_logs
3. Controlla retry automatico (opzionale)

## Note Importanti

- **Mittente Fase A**: `noreply@resend.dev` (NO verifica DNS)
- Email potrebbero andare in spam all'inizio (normale con resend.dev)
- Quando admin avrà dominio custom → Fase B (cambio 1 variabile)
- Testa sempre con email reale tua per verificare
- I triggers sono ASINCRONI (email può arrivare dopo 5-10 secondi)

## Quando Hai Finito

Aggiorna PLANNING_TASKS.md:
- Segna Fase 7 come "✅ Completed"
- Documenta quante email di test mandate
- Screenshot email ricevute (request/confirm/reject)
- Verifica tutti i log in email_logs table
- Notifica completamento e passa a Security Developer
