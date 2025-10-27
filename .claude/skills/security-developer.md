# Security & GDPR Developer Agent

**Specializzazione**: Fase 8 del PLANNING_TASKS.md
**Responsabilità**: Rate limiting, Privacy Policy, GDPR compliance

## Compiti Principali

### 1. Rate Limiting Form Pubblico (30 min)
- Supabase Edge Function con limite **3 richieste/ora per IP**
- Messaggio errore 429 dopo 3 richieste
- Retry-After header

### 2. Privacy Policy Page (45 min)
- Pagina `/privacy` GDPR compliant
- Contenuto minimo legale obbligatorio
- Link dalla checkbox nel form

### 3. Checkbox Consenso Privacy (15 min)
- Checkbox obbligatorio nel form prenotazioni
- Form non submit-tabile senza consenso
- Link a privacy policy

## Files da Creare

```
src/
├── pages/
│   └── PrivacyPolicyPage.tsx
│
supabase/
└── functions/
    └── submit-booking/
        └── index.ts
```

## Rate Limiting Implementation

### Supabase Edge Function: submit-booking

**File**: `supabase/functions/submit-booking/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// In-memory rate limiter
// Per produzione, considera Redis/Upstash
const rateLimitMap = new Map<string, number[]>()

const RATE_LIMIT = 3 // richieste
const RATE_WINDOW = 3600000 // 1 ora in ms

serve(async (req) => {
  try {
    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('x-real-ip') ||
                     'unknown'

    const now = Date.now()
    const windowStart = now - RATE_WINDOW

    // Clean old timestamps
    if (rateLimitMap.has(clientIP)) {
      const timestamps = rateLimitMap.get(clientIP)!.filter(t => t > windowStart)
      rateLimitMap.set(clientIP, timestamps)
    }

    // Check rate limit
    const requestTimestamps = rateLimitMap.get(clientIP) || []

    if (requestTimestamps.length >= RATE_LIMIT) {
      const oldestRequest = Math.min(...requestTimestamps)
      const retryAfter = Math.ceil((oldestRequest + RATE_WINDOW - now) / 1000)

      return new Response(
        JSON.stringify({
          error: 'Troppe richieste. Hai raggiunto il limite di 3 prenotazioni all\'ora.',
          retryAfter: retryAfter,
          message: `Riprova tra ${Math.ceil(retryAfter / 60)} minuti.`
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(oldestRequest + RATE_WINDOW).toISOString()
          }
        }
      )
    }

    // Parse booking data
    const bookingData = await req.json()

    // Validate required fields
    if (!bookingData.client_name || !bookingData.client_email || !bookingData.desired_date) {
      return new Response(
        JSON.stringify({ error: 'Campi obbligatori mancanti' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(bookingData.client_email)) {
      return new Response(
        JSON.stringify({ error: 'Email non valida' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate date (not in the past)
    const requestedDate = new Date(bookingData.desired_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (requestedDate < today) {
      return new Response(
        JSON.stringify({ error: 'La data non può essere nel passato' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Insert into database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data, error } = await supabase
      .from('booking_requests')
      .insert({
        client_name: bookingData.client_name,
        client_email: bookingData.client_email,
        client_phone: bookingData.client_phone,
        event_type: bookingData.event_type,
        desired_date: bookingData.desired_date,
        desired_time: bookingData.desired_time,
        num_guests: bookingData.num_guests,
        special_requests: bookingData.special_requests,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Errore durante il salvataggio della richiesta' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Add timestamp to rate limiter
    requestTimestamps.push(now)
    rateLimitMap.set(clientIP, requestTimestamps)

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        message: 'Richiesta inviata con successo!'
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': (RATE_LIMIT - requestTimestamps.length).toString(),
          'X-RateLimit-Reset': new Date(now + RATE_WINDOW).toISOString()
        }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### Frontend Integration

**File**: `src/features/booking/hooks/useBookingRequests.ts`

Modifica per usare Edge Function invece di chiamata diretta:

```typescript
export const useBookingRequests = () => {
  const createRequest = async (bookingData: BookingRequestInput) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-booking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify(bookingData)
        }
      )

      const result = await response.json()

      if (response.status === 429) {
        // Rate limit exceeded
        throw new Error(result.message || 'Troppe richieste. Riprova più tardi.')
      }

      if (!response.ok) {
        throw new Error(result.error || 'Errore durante l\'invio della richiesta')
      }

      return result.data
    } catch (error) {
      throw error
    }
  }

  return { createRequest }
}
```

**Display Error in Form**:
```tsx
// In BookingRequestForm.tsx
try {
  await createRequest(formData)
  toast.success('Richiesta inviata con successo!')
} catch (error) {
  if (error.message.includes('Troppe richieste')) {
    toast.error(error.message, { duration: 5000 })
  } else {
    toast.error('Errore durante l\'invio. Riprova.')
  }
}
```

## Privacy Policy Page

**File**: `src/pages/PrivacyPolicyPage.tsx`

```tsx
import React from 'react'
import { Link } from 'react-router-dom'

export const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* Header */}
        <div className="border-b pb-6 mb-8">
          <Link to="/prenota" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            ← Torna al form
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-2">
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            1. Titolare del Trattamento
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Il titolare del trattamento dei dati personali è:
          </p>
          <div className="bg-gray-100 p-4 rounded mt-3">
            <p className="font-semibold">Al Ritrovo</p>
            <p>Bologna, Italia</p>
            <p>Email: <a href="mailto:privacy@alritrovo.com" className="text-blue-600 hover:underline">
              privacy@alritrovo.com
            </a></p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            2. Dati Raccolti
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Raccogliamo i seguenti dati personali quando richiedi una prenotazione:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Nome e cognome</li>
            <li>Indirizzo email</li>
            <li>Numero di telefono (facoltativo)</li>
            <li>Data e orario prenotazione desiderati</li>
            <li>Numero di ospiti</li>
            <li>Tipo di evento (cena, aperitivo, evento speciale, laurea)</li>
            <li>Note o richieste speciali (facoltativo)</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            3. Finalità del Trattamento
          </h2>
          <p className="text-gray-700 leading-relaxed">
            I tuoi dati personali sono utilizzati esclusivamente per:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
            <li>Gestire la tua richiesta di prenotazione</li>
            <li>Inviarti email di conferma o rifiuto della prenotazione</li>
            <li>Contattarti in caso di necessità di modifiche</li>
            <li>Inviarti reminder prima della data prenotata (se attivato)</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            <strong>Non utilizziamo</strong> i tuoi dati per:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
            <li>Marketing o pubblicità (salvo tuo consenso esplicito separato)</li>
            <li>Condivisione con terze parti per scopi commerciali</li>
            <li>Profilazione automatizzata</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            4. Base Giuridica del Trattamento
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Il trattamento dei tuoi dati è basato su:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
            <li><strong>Consenso</strong> (Art. 6.1.a GDPR): Accettando questa privacy policy fornisci consenso esplicito</li>
            <li><strong>Esecuzione di un contratto</strong> (Art. 6.1.b GDPR): La prenotazione costituisce un accordo tra te e il ristorante</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            5. Conservazione dei Dati
          </h2>
          <p className="text-gray-700 leading-relaxed">
            I tuoi dati personali saranno conservati per:
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-3">
            <p className="font-semibold text-gray-900">Massimo 2 anni dalla data di creazione della richiesta</p>
            <p className="text-sm text-gray-700 mt-2">
              Dopo 2 anni, i tuoi dati saranno <strong>automaticamente cancellati</strong> dal nostro sistema.
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed mt-4">
            Puoi richiedere la cancellazione anticipata in qualsiasi momento (vedi sezione "I Tuoi Diritti").
          </p>
        </section>

        {/* Section 6 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            6. Condivisione dei Dati
          </h2>
          <p className="text-gray-700 leading-relaxed">
            I tuoi dati sono condivisi solo con i seguenti soggetti, strettamente necessari per fornire il servizio:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
            <li><strong>Supabase</strong> (database hosting) - USA, GDPR compliant</li>
            <li><strong>Resend</strong> (servizio invio email) - USA, GDPR compliant</li>
            <li><strong>Vercel</strong> (hosting sito web) - USA, GDPR compliant</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Tutti i fornitori sono conformi al GDPR e utilizzano misure di sicurezza adeguate.
          </p>
        </section>

        {/* Section 7 - MOST IMPORTANT */}
        <section className="mb-8 border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            7. I Tuoi Diritti (GDPR Art. 15-21)
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            In conformità con il Regolamento GDPR, hai i seguenti diritti:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">📖 Diritto di Accesso (Art. 15)</h3>
              <p className="text-sm text-gray-700">
                Puoi richiedere copia di tutti i dati personali che conserviamo su di te.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">✏️ Diritto di Rettifica (Art. 16)</h3>
              <p className="text-sm text-gray-700">
                Puoi richiedere la correzione di dati inesatti o incompleti.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">🗑️ Diritto alla Cancellazione (Art. 17)</h3>
              <p className="text-sm text-gray-700">
                Puoi richiedere la cancellazione immediata di tutti i tuoi dati ("diritto all'oblio").
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">⛔ Diritto di Limitazione (Art. 18)</h3>
              <p className="text-sm text-gray-700">
                Puoi richiedere di limitare il trattamento dei tuoi dati.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">📦 Diritto alla Portabilità (Art. 20)</h3>
              <p className="text-sm text-gray-700">
                Puoi richiedere i tuoi dati in formato elettronico (JSON/CSV).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">❌ Diritto di Opposizione (Art. 21)</h3>
              <p className="text-sm text-gray-700">
                Puoi opporti al trattamento dei tuoi dati in qualsiasi momento.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-white p-4 rounded">
            <p className="font-semibold text-gray-900 mb-2">Come Esercitare i Tuoi Diritti:</p>
            <p className="text-gray-700">
              Invia una email a:{' '}
              <a href="mailto:privacy@alritrovo.com" className="text-blue-600 font-semibold hover:underline">
                privacy@alritrovo.com
              </a>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Risponderemo entro <strong>30 giorni</strong> dalla tua richiesta (Art. 12.3 GDPR).
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            8. Sicurezza dei Dati
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Adottiamo misure di sicurezza tecniche e organizzative adeguate per proteggere i tuoi dati:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
            <li>Connessione HTTPS cifrata (TLS 1.3)</li>
            <li>Database con Row Level Security (RLS) attivo</li>
            <li>Backup automatici giornalieri</li>
            <li>Rate limiting anti-spam (max 3 richieste/ora)</li>
            <li>Accesso admin protetto da password (hash bcrypt)</li>
          </ul>
        </section>

        {/* Section 9 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            9. Cookie
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Questo sito <strong>non utilizza cookie di tracciamento</strong> o cookie di terze parti per marketing.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Utilizziamo solo cookie tecnici strettamente necessari per:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
            <li>Mantenere la sessione admin autenticata (solo area riservata)</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            10. Modifiche a Questa Privacy Policy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Ci riserviamo il diritto di modificare questa privacy policy in qualsiasi momento.
            Le modifiche saranno pubblicate in questa pagina con data di aggiornamento.
          </p>
        </section>

        {/* Section 11 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            11. Reclami
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Se ritieni che il trattamento dei tuoi dati violi il GDPR, hai il diritto di presentare reclamo all'autorità di controllo:
          </p>
          <div className="bg-gray-100 p-4 rounded mt-3">
            <p className="font-semibold">Garante per la Protezione dei Dati Personali (Italia)</p>
            <p>Sito: <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              www.garanteprivacy.it
            </a></p>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t pt-6 mt-8">
          <Link
            to="/prenota"
            className="inline-block bg-al-ritrovo-primary text-white px-6 py-3 rounded-lg hover:bg-al-ritrovo-primary-dark transition"
          >
            ← Torna al Form Prenotazione
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### Router Update

**File**: `src/router.tsx`

```typescript
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'

export const router = createBrowserRouter([
  // ... existing routes
  {
    path: '/privacy',
    element: <PrivacyPolicyPage />
  }
])
```

## Checkbox Privacy (già implementato in Fase 4)

Verifica che sia presente in `BookingRequestForm.tsx`:

```tsx
const [privacyAccepted, setPrivacyAccepted] = useState(false)

// Nel render, prima del bottone submit:
<div className="flex items-start gap-2 mt-6">
  <input
    type="checkbox"
    id="privacy-consent"
    required
    checked={privacyAccepted}
    onChange={(e) => setPrivacyAccepted(e.target.checked)}
    className="mt-1 h-4 w-4 text-al-ritrovo-primary focus:ring-al-ritrovo-primary"
  />
  <label htmlFor="privacy-consent" className="text-sm text-gray-700">
    Accetto la{' '}
    <Link
      to="/privacy"
      target="_blank"
      className="underline text-blue-600 hover:text-blue-800"
    >
      Privacy Policy
    </Link>{' '}
    e autorizzo il trattamento dei miei dati personali *
  </label>
</div>

<button
  type="submit"
  disabled={!privacyAccepted || isSubmitting}
  className="w-full bg-al-ritrovo-primary text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting ? 'Invio in corso...' : 'Invia Richiesta'}
</button>
```

## Deploy & Testing

### Deploy Edge Function
```bash
# Deploy submit-booking function
supabase functions deploy submit-booking

# Test rate limiting
for i in {1..5}; do
  curl -X POST \
    https://YOUR_PROJECT.supabase.co/functions/v1/submit-booking \
    -H "Authorization: Bearer YOUR_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"client_name":"Test","client_email":"test@example.com","desired_date":"2025-03-01","num_guests":2,"event_type":"cena"}'
done

# 1-3: Success (201)
# 4+: Rate limit exceeded (429)
```

## Checklist Completamento

### Rate Limiting
- [ ] Edge Function `submit-booking` creata
- [ ] Limite 3 richieste/ora implementato
- [ ] Messaggio errore 429 user-friendly
- [ ] Headers X-RateLimit-* presenti
- [ ] Frontend usa Edge Function (non chiamata diretta DB)
- [ ] Toast mostra errore rate limit
- [ ] Testato con 5 submit consecutivi

### Privacy Policy
- [ ] Pagina `/privacy` creata e accessibile
- [ ] Contenuto GDPR compliant completo
- [ ] Tutte le 11 sezioni presenti
- [ ] Sezione "I Tuoi Diritti" dettagliata
- [ ] Email privacy@alritrovo.com presente
- [ ] Link "Torna al form" funzionante
- [ ] Responsive mobile/tablet

### Checkbox Consenso
- [ ] Checkbox privacy nel form prenotazioni
- [ ] Link a /privacy funzionante (target="_blank")
- [ ] Form submit disabilitato senza checkbox
- [ ] Validazione client-side funzionante
- [ ] Label chiaro e leggibile

## Test Cases

### Test 1: Rate Limiting
1. Invia 3 richieste prenotazione in rapida successione → Success
2. Invia 4a richiesta → Errore 429
3. Verifica messaggio: "Troppe richieste. Riprova tra X minuti"
4. Attendi 1 ora (o reset server) → Nuove 3 richieste ok

### Test 2: Privacy Policy
1. Vai a `/privacy` → Pagina carica
2. Verifica tutte le sezioni presenti
3. Click "Torna al form" → Redirect a `/prenota`
4. Test mobile: layout responsive

### Test 3: Checkbox Privacy
1. Form senza checkbox → Bottone submit disabilitato
2. Check checkbox → Bottone submit abilitato
3. Uncheck → Bottone disabilitato
4. Click link Privacy → Apre in nuova tab

## Note Importanti

- Rate limiting usa in-memory storage (reset a restart server)
- Per produzione, considera Redis/Upstash per persistenza
- Privacy Policy è OBBLIGATORIA per GDPR (multe fino a 20M€ se mancante)
- Checkbox consenso è OBBLIGATORIO (Art. 7 GDPR)
- Email privacy@alritrovo.com deve essere funzionante

## Quando Hai Finito

Aggiorna PLANNING_TASKS.md:
- Segna Fase 8 come "✅ Completed"
- Segna milestone 4 come completato
- Screenshot pagina privacy
- Screenshot errore rate limiting
- Notifica completamento e passa a Testing Developer
