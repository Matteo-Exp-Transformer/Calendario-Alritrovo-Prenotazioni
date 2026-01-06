# Handoff: Completare implementazione campo "Posizionamento"

## Context

Sto continuando l'implementazione del campo "Posizionamento" per le prenotazioni del sistema Al Ritrovo.

**Valori possibili:** "Sala A", "Sala B", "Deorr" (opzionale)

---

## ✅ Già Completato (NON toccare)

### Backend (100% COMPLETO)
- ✅ Migration database eseguita: `supabase/migrations/033_add_placement_field.sql`
- ✅ Types aggiornati: `src/types/booking.ts` contiene `placement?: string | null`
- ✅ Service layer aggiornato: `useAdminBookingRequests.ts`, `useBookingMutations.ts`
- ✅ Test backend: `e2e/backend/test-placement-field.spec.ts` (PASSA ✅)

---

## ⚠️ IMPORTANTE: Placement SOLO per Admin

**Il campo "Posizionamento" deve apparire SOLO nella sezione Admin, NON nella pagina pubblica /prenota**

**NON TOCCARE:**
- ❌ BookingRequestForm.tsx (pagina pubblica /prenota) - Se è stato modificato, RIMUOVI il campo placement

**DA MODIFICARE:**
- ✅ AdminBookingForm.tsx (form admin per creare prenotazioni)
- ✅ DetailsTab.tsx + BookingDetailsModal.tsx (modal admin per modificare prenotazioni)
- ✅ BookingCalendar.tsx (visualizzazione nelle fasce orarie)

---

## 🚧 DA COMPLETARE (TUO COMPITO)

### STEP 0: Rimuovi placement da BookingRequestForm.tsx (SE PRESENTE)

**IMPORTANTE:** Un agente precedente ha erroneamente aggiunto placement a BookingRequestForm.tsx. Devi rimuoverlo.

**File**: `src/features/booking/components/BookingRequestForm.tsx`

**Modifiche da fare:**

1. **Rimuovi** `placement: '',` dallo stato iniziale (linea ~64)
2. **Rimuovi** `placement: '',` dal reset form (linea ~610)
3. **Rimuovi** tutto il blocco UI del campo Posizionamento (linee ~926-960):
```tsx
{/* Posizionamento */}
<div className="form-group">
  {/* ... RIMUOVI TUTTO QUESTO BLOCCO ... */}
</div>
```
4. **Rimuovi** import di `MapPin` se non usato altrove
5. **Verifica** che il componente non abbia più riferimenti a `placement`

**Verifica:** Dopo la rimozione, esegui:
```bash
grep -n "placement" src/features/booking/components/BookingRequestForm.tsx
```
Deve restituire **0 risultati**.

---

### STEP 1-4: Aggiungi placement SOLO nei componenti Admin

Ora aggiungi il campo "Posizionamento" nei seguenti 3 componenti (SOLO ADMIN).

---

## 1. AdminBookingForm.tsx

**File**: `src/features/booking/components/AdminBookingForm.tsx`

### Modifiche richieste:

**a) Imports** (aggiungi `MapPin` e componenti Select):
```typescript
import { Send, Loader2, MapPin } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
```

**b) Initial state** (cerca `const [formData, setFormData] = useState({`, aggiungi dopo `special_requests`):
```typescript
placement: '',
```

**c) Reset dopo submit** (cerca `onSuccess:` nella mutation, aggiungi nel reset):
```typescript
placement: '',
```

**d) UI Field** (aggiungi DOPO il campo "Numero Ospiti", prima della chiusura del div):
```tsx
{/* Posizionamento */}
<div className="space-y-3" style={{ paddingTop: '0.5rem' }}>
  <label
    htmlFor="placement"
    className="block text-base md:text-lg text-warm-wood mb-2 flex items-center gap-2"
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(1px)',
      padding: '8px 16px',
      borderRadius: '12px',
      display: 'inline-flex',
      fontWeight: '700',
      marginBottom: '0.5rem'
    }}
  >
    <MapPin className="w-4 h-4" />
    Posizionamento (opzionale)
  </label>
  <Select
    value={formData.placement || 'none'}
    onValueChange={(value) => setFormData({ ...formData, placement: value === 'none' ? '' : value })}
  >
    <SelectTrigger id="placement">
      <SelectValue placeholder="Seleziona sala (opzionale)" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">Nessuna preferenza</SelectItem>
      <SelectItem value="Sala A">Sala A</SelectItem>
      <SelectItem value="Sala B">Sala B</SelectItem>
      <SelectItem value="Deorr">Deorr</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**e) Include nel payload** (cerca `createAdminBooking.mutate({`, verifica che includa `placement: formData.placement || null`)

---

## 2. DetailsTab.tsx

**File**: `src/features/booking/components/DetailsTab.tsx`

### Modifiche richieste:

**a) Import MapPin**:
```typescript
import { MapPin } from 'lucide-react'
```

**b) Import Select components**:
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
```

**c) Aggiungi `placement` all'interfaccia Props** (cerca `interface Props {`):
```typescript
formData: {
  // ... campi esistenti
  placement?: string | null
}
```

**d) Modalità VIEW** (aggiungi nella sezione "Dettagli Evento", dopo altri InfoRow):
```tsx
<InfoRow
  icon={MapPin}
  label="Posizionamento"
  value={booking.placement || 'Non specificato'}
/>
```

**e) Modalità EDIT** (aggiungi nella sezione di edit, dopo altri campi):
```tsx
<div>
  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
    <MapPin className="w-4 h-4" />
    Posizionamento
  </label>
  <Select
    value={formData.placement || 'none'}
    onValueChange={(value) => onChange({ placement: value === 'none' ? null : value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Seleziona sala" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">Nessuna preferenza</SelectItem>
      <SelectItem value="Sala A">Sala A</SelectItem>
      <SelectItem value="Sala B">Sala B</SelectItem>
      <SelectItem value="Deorr">Deorr</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## 3. BookingDetailsModal.tsx

**File**: `src/features/booking/components/BookingDetailsModal.tsx`

### Modifiche richieste:

**a) Inizializza placement in formData** (cerca `const [formData, setFormData] = useState({`):
```typescript
placement: booking.placement || '',
```

**b) Include nel payload di update** (cerca `updateBooking.mutate({`, aggiungi):
```typescript
placement: formData.placement || null,
```

**c) Passa a DetailsTab** (dovrebbe già propagarsi automaticamente tramite `formData`)

---

## 4. BookingCalendar.tsx

**File**: `src/features/booking/components/BookingCalendar.tsx`

### Modifiche richieste:

**a) Import MapPin** (aggiungi alla riga con gli altri import da lucide-react):
```typescript
import { Calendar, Users, Sunrise, Sun, Moon, Mail, Phone, Clock, UtensilsCrossed, Tag, ScrollText, StickyNote, MapPin } from 'lucide-react'
```

**b) Aggiungi placement display in TUTTE E 3 LE FASCE ORARIE**

**POSIZIONE:** In ogni fascia (mattina, pomeriggio, sera), aggiungi DOPO il div con `UtensilsCrossed` (Evento) e PRIMA di `{booking.client_phone &&`

**MATTINA (linea ~475)** - Cerca la sezione "Mattina" con `text-green-600`:
```tsx
{booking.placement && (
  <div className="flex items-start gap-4 md:gap-6">
    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1 flex items-start gap-2">
      <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[80px] shrink-0">Posizionamento:</span>
      <span className="text-sm md:text-base text-gray-700 font-medium">{booking.placement}</span>
    </div>
  </div>
)}
```

**POMERIGGIO (linea ~685)** - Cerca la sezione "Pomeriggio" con `text-yellow-600`:
```tsx
{booking.placement && (
  <div className="flex items-start gap-4 md:gap-6">
    <MapPin className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1 flex items-start gap-2">
      <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[80px] shrink-0">Posizionamento:</span>
      <span className="text-sm md:text-base text-gray-700 font-medium">{booking.placement}</span>
    </div>
  </div>
)}
```

**SERA (linea ~893)** - Cerca la sezione "Sera" con `text-blue-600`:
```tsx
{booking.placement && (
  <div className="flex items-start gap-4 md:gap-6">
    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1 flex items-start gap-2">
      <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[80px] shrink-0">Posizionamento:</span>
      <span className="text-sm md:text-base text-gray-700 font-medium">{booking.placement}</span>
    </div>
  </div>
)}
```

---

## Testing

Dopo aver completato TUTTI i componenti:

### 1. Lint
```bash
npm run lint
```

### 2. Test E2E esistente
```bash
npx playwright test e2e/placement-field-ui.spec.ts
```

### 3. Crea test aggiuntivo per i nuovi componenti

**File**: `e2e/placement-complete.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

test.describe('Placement Field - Complete Integration', () => {
  let testBookingId: string

  test.afterEach(async () => {
    if (testBookingId) {
      await supabase.from('booking_requests').delete().eq('id', testBookingId)
    }
  })

  test('Public users CANNOT see placement field in BookingRequestForm', async ({ page }) => {
    await page.goto('http://localhost:5175/prenota')

    // Verify placement field is NOT present
    await expect(page.locator('text=Posizionamento')).not.toBeVisible()
    await expect(page.locator('#placement')).not.toBeVisible()
  })

  test('Admin can create booking with placement in AdminBookingForm', async ({ page }) => {
    // Login
    await page.goto('http://localhost:5175/admin')
    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin/dashboard')

    // Fill admin booking form
    await page.fill('input[name="client_name"]', 'Test Placement Admin')
    await page.fill('input[name="client_email"]', 'placement@test.com')
    await page.fill('input[name="num_guests"]', '10')

    // Select placement
    await page.click('#placement')
    await page.click('text=Sala A')

    // Submit
    await page.click('button[type="submit"]')
    await page.waitForSelector('text=Prenotazione creata con successo')

    // Verify in database
    const { data } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('client_email', 'placement@test.com')
      .single()

    expect(data?.placement).toBe('Sala A')
    testBookingId = data?.id
  })

  test('Admin can modify placement in BookingDetailsModal', async ({ page }) => {
    // Create test booking
    const { data } = await supabase
      .from('booking_requests')
      .insert({
        client_name: 'Test Modify Placement',
        client_email: 'modify-placement@test.com',
        num_guests: 15,
        placement: 'Sala A',
        status: 'accepted',
        confirmed_start: '2025-12-01T19:00:00',
        confirmed_end: '2025-12-01T22:00:00'
      })
      .select()
      .single()

    testBookingId = data!.id

    // Login
    await page.goto('http://localhost:5175/admin')
    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin/dashboard')

    // Open booking
    await page.click(`text=${data!.client_name}`)

    // Click edit
    await page.click('button:has-text("Modifica")')

    // Change placement
    await page.click('#placement') // or appropriate selector for DetailsTab placement
    await page.click('text=Sala B')

    // Save
    await page.click('button:has-text("Salva")')
    await page.waitForSelector('text=Prenotazione aggiornata con successo')

    // Verify in database
    const { data: updated } = await supabase
      .from('booking_requests')
      .select('placement')
      .eq('id', testBookingId)
      .single()

    expect(updated?.placement).toBe('Sala B')
  })

  test('Placement shows in BookingCalendar time slots', async ({ page }) => {
    // Create test booking with placement
    const { data } = await supabase
      .from('booking_requests')
      .insert({
        client_name: 'Test Calendar Placement',
        client_email: 'calendar-placement@test.com',
        num_guests: 20,
        placement: 'Deorr',
        status: 'accepted',
        confirmed_start: '2025-12-15T20:00:00',
        confirmed_end: '2025-12-15T23:00:00',
        desired_time: '20:00'
      })
      .select()
      .single()

    testBookingId = data!.id

    // Login and view calendar
    await page.goto('http://localhost:5175/admin')
    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin/dashboard')

    // Navigate to date
    await page.click('text=2025-12-15') // Click on calendar date

    // Verify placement is shown in evening slot
    const eveningSection = page.locator('text=Sera').locator('..')
    await expect(eveningSection.locator('text=Posizionamento:')).toBeVisible()
    await expect(eveningSection.locator('text=Deorr')).toBeVisible()
  })
})
```

---

## Deliverables

Al termine, fornisci:

1. ✅ Lista file modificati
2. ✅ Screenshot di:
   - AdminBookingForm con campo placement
   - BookingDetailsModal in modalità edit con placement
   - BookingCalendar con placement visibile nelle fasce orarie
3. ✅ Output di `npm run lint` (deve essere pulito)
4. ✅ Output di `npx playwright test e2e/placement-complete.spec.ts` (tutti test PASS)

---

## Note Importanti

- **NON modificare** `BookingRequestForm.tsx` (già fatto)
- **NON modificare** backend/database (già fatto)
- Usa **ESATTAMENTE** gli stessi valori: `"none"`, `"Sala A"`, `"Sala B"`, `"Deorr"`
- Il campo è sempre **opzionale**
- Icona: `MapPin` da `lucide-react`
- Select component: `@/components/ui/Select`

---

## In caso di problemi

Se incontri errori:
1. Verifica che i types in `src/types/booking.ts` contengano `placement?: string | null`
2. Verifica che la migration database sia stata eseguita
3. Esegui `npm run lint` per vedere errori TypeScript
4. Controlla che i Select usino `value="none"` per valore vuoto (NOT empty string)

Buon lavoro! 🚀
