# Fix Time Slot Booking Display Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Le prenotazioni devono apparire solo nella card della fascia oraria di INIZIO, ma i posti occupati devono essere conteggiati in TUTTE le fasce orarie che la prenotazione copre.

**Architecture:** Creiamo una nuova funzione `getStartSlotForBooking()` che determina la fascia di inizio basandosi solo sull'orario di inizio. La funzione esistente `getSlotsOccupiedByBooking()` rimane invariata e continua ad essere usata per i calcoli di capacità e le validazioni.

**Tech Stack:** TypeScript, React, Playwright (E2E testing)

---

## Task 1: Creare la funzione getStartSlotForBooking

**Files:**
- Modify: `src/features/booking/utils/capacityCalculator.ts` (dopo la funzione `getSlotsOccupiedByBooking`)

**Step 1: Aggiungere la nuova funzione dopo getSlotsOccupiedByBooking**

Trova la riga 65 (dopo la chiusura di `getSlotsOccupiedByBooking`) e aggiungi:

```typescript
// Get the time slot where a booking STARTS (for display purposes only)
// Unlike getSlotsOccupiedByBooking, this returns only ONE slot based on start time
// Capacity calculations should continue using getSlotsOccupiedByBooking
export function getStartSlotForBooking(start: string): TimeSlot {
  const startTime = extractTimeFromISO(start)
  const startMinutes = parseTime(startTime)

  const morningStart = parseTime(CAPACITY_CONFIG.MORNING_START) // 10:00
  const morningEnd = parseTime(CAPACITY_CONFIG.MORNING_END) // 14:30
  const afternoonStart = parseTime(CAPACITY_CONFIG.AFTERNOON_START) // 14:31
  const afternoonEnd = parseTime(CAPACITY_CONFIG.AFTERNOON_END) // 18:30
  const eveningStart = parseTime(CAPACITY_CONFIG.EVENING_START) // 18:31

  // Check which slot the booking starts in
  // Morning: 10:00 - 14:30
  if (startMinutes >= morningStart && startMinutes <= morningEnd) {
    return 'morning'
  }

  // Afternoon: 14:31 - 18:30
  if (startMinutes >= afternoonStart && startMinutes <= afternoonEnd) {
    return 'afternoon'
  }

  // Evening: 18:31 - 23:30
  // Default to evening for any time >= 18:31
  return 'evening'
}
```

**Step 2: Verificare che il codice compili**

Run: `npm run build`
Expected: Build completa senza errori TypeScript

**Step 3: Commit**

```bash
git add src/features/booking/utils/capacityCalculator.ts
git commit -m "feat: add getStartSlotForBooking function for display logic

- New function determines booking display slot based on start time only
- Returns single TimeSlot instead of array
- getSlotsOccupiedByBooking remains unchanged for capacity calculations"
```

---

## Task 2: Aggiornare BookingCalendar.tsx per usare la nuova funzione

**Files:**
- Modify: `src/features/booking/components/BookingCalendar.tsx:129-135`

**Step 1: Aggiornare l'import per includere la nuova funzione**

Trova la riga 13:
```typescript
import { calculateDailyCapacity, getSlotsOccupiedByBooking } from '../utils/capacityCalculator'
```

Sostituisci con:
```typescript
import { calculateDailyCapacity, getSlotsOccupiedByBooking, getStartSlotForBooking } from '../utils/capacityCalculator'
```

**Step 2: Modificare la logica di raggruppamento delle prenotazioni**

Trova le righe 129-135:
```typescript
    for (const booking of dayBookings) {
      if (!booking.confirmed_start || !booking.confirmed_end) continue
      const slots = getSlotsOccupiedByBooking(booking.confirmed_start, booking.confirmed_end)
      if (slots.includes('morning')) morningBookings.push(booking)
      if (slots.includes('afternoon')) afternoonBookings.push(booking)
      if (slots.includes('evening')) eveningBookings.push(booking)
    }
```

Sostituisci con:
```typescript
    for (const booking of dayBookings) {
      if (!booking.confirmed_start || !booking.confirmed_end) continue
      // Display booking only in the slot where it STARTS
      const startSlot = getStartSlotForBooking(booking.confirmed_start)
      if (startSlot === 'morning') morningBookings.push(booking)
      else if (startSlot === 'afternoon') afternoonBookings.push(booking)
      else if (startSlot === 'evening') eveningBookings.push(booking)
    }
```

**Step 3: Verificare che il codice compili**

Run: `npm run build`
Expected: Build completa senza errori TypeScript

**Step 4: Commit**

```bash
git add src/features/booking/components/BookingCalendar.tsx
git commit -m "fix: display bookings only in start time slot card

- Bookings now appear only in the card of their START time slot
- Capacity calculations remain unchanged (still use overlap logic)
- Example: booking at 19:00 appears only in 'Sera', not 'Pomeriggio'"
```

---

## Task 3: Creare test E2E per verificare il comportamento

**Files:**
- Create: `e2e/time-slots/test-booking-time-slot-display.spec.ts`

**Step 1: Creare la directory per i test**

Run: `mkdir -p e2e/time-slots`

**Step 2: Creare il file di test**

Create file `e2e/time-slots/test-booking-time-slot-display.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

/**
 * Test: Le prenotazioni devono apparire SOLO nella card della fascia oraria di INIZIO
 *
 * Fasce orarie:
 * - Mattina: 10:00 - 14:30
 * - Pomeriggio: 14:31 - 18:30
 * - Sera: 18:31 - 23:30
 */

test.describe('Visualizzazione prenotazioni nelle fasce orarie', () => {
  test.beforeEach(async ({ page }) => {
    // Login come admin
    await page.goto('http://localhost:5175')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin')
  })

  test('Prenotazione alle 19:00 appare SOLO in Sera', async ({ page }) => {
    // Crea una prenotazione di test alle 19:00
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 7) // +7 giorni nel futuro
    const dateStr = testDate.toISOString().split('T')[0]

    // Vai al calendario e seleziona la data
    await page.goto('http://localhost:5175/admin')
    await page.click(`[data-date="${dateStr}"]`)

    // Cerca la prenotazione di test (se esiste già) o creane una
    const bookingExists = await page.locator('text=Test Booking 19:00').isVisible()

    if (!bookingExists) {
      // Crea prenotazione
      await page.fill('[name="client_name"]', 'Test Booking 19:00')
      await page.fill('[name="client_email"]', 'test19@example.com')
      await page.fill('[name="num_guests"]', '4')
      await page.fill('[name="desired_time"]', '19:00')
      await page.click('button:has-text("Conferma")')
      await page.waitForTimeout(1000)
    }

    // Verifica che la prenotazione appaia SOLO nella card Sera
    const seraCard = page.locator('[data-testid="evening-card"]')
    const pomeriggioCard = page.locator('[data-testid="afternoon-card"]')

    await expect(seraCard.locator('text=Test Booking 19:00')).toBeVisible()
    await expect(pomeriggioCard.locator('text=Test Booking 19:00')).not.toBeVisible()
  })

  test('Prenotazione alle 17:30 (che finisce in Sera) appare SOLO in Pomeriggio', async ({ page }) => {
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 7)
    const dateStr = testDate.toISOString().split('T')[0]

    await page.goto('http://localhost:5175/admin')
    await page.click(`[data-date="${dateStr}"]`)

    const bookingExists = await page.locator('text=Test Booking 17:30').isVisible()

    if (!bookingExists) {
      await page.fill('[name="client_name"]', 'Test Booking 17:30')
      await page.fill('[name="client_email"]', 'test1730@example.com')
      await page.fill('[name="num_guests"]', '5')
      await page.fill('[name="desired_time"]', '17:30')
      await page.click('button:has-text("Conferma")')
      await page.waitForTimeout(1000)
    }

    // Verifica che appaia SOLO in Pomeriggio (anche se finisce in Sera)
    const pomeriggioCard = page.locator('[data-testid="afternoon-card"]')
    const seraCard = page.locator('[data-testid="evening-card"]')

    await expect(pomeriggioCard.locator('text=Test Booking 17:30')).toBeVisible()
    await expect(seraCard.locator('text=Test Booking 17:30')).not.toBeVisible()
  })

  test('Prenotazione al confine 14:31 appare in Pomeriggio', async ({ page }) => {
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 7)
    const dateStr = testDate.toISOString().split('T')[0]

    await page.goto('http://localhost:5175/admin')
    await page.click(`[data-date="${dateStr}"]`)

    const bookingExists = await page.locator('text=Test Booking 14:31').isVisible()

    if (!bookingExists) {
      await page.fill('[name="client_name"]', 'Test Booking 14:31')
      await page.fill('[name="client_email"]', 'test1431@example.com')
      await page.fill('[name="num_guests"]', '3')
      await page.fill('[name="desired_time"]', '14:31')
      await page.click('button:has-text("Conferma")')
      await page.waitForTimeout(1000)
    }

    const pomeriggioCard = page.locator('[data-testid="afternoon-card"]')
    const mattinaCard = page.locator('[data-testid="morning-card"]')

    await expect(pomeriggioCard.locator('text=Test Booking 14:31')).toBeVisible()
    await expect(mattinaCard.locator('text=Test Booking 14:31')).not.toBeVisible()
  })

  test('Prenotazione al confine 18:31 appare in Sera', async ({ page }) => {
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 7)
    const dateStr = testDate.toISOString().split('T')[0]

    await page.goto('http://localhost:5175/admin')
    await page.click(`[data-date="${dateStr}"]`)

    const bookingExists = await page.locator('text=Test Booking 18:31').isVisible()

    if (!bookingExists) {
      await page.fill('[name="client_name"]', 'Test Booking 18:31')
      await page.fill('[name="client_email"]', 'test1831@example.com')
      await page.fill('[name="num_guests"]', '6')
      await page.fill('[name="desired_time"]', '18:31')
      await page.click('button:has-text("Conferma")')
      await page.waitForTimeout(1000)
    }

    const seraCard = page.locator('[data-testid="evening-card"]')
    const pomeriggioCard = page.locator('[data-testid="afternoon-card"]')

    await expect(seraCard.locator('text=Test Booking 18:31')).toBeVisible()
    await expect(pomeriggioCard.locator('text=Test Booking 18:31')).not.toBeVisible()
  })
})

test.describe('Calcolo capacità con prenotazioni che coprono più fasce', () => {
  test('Prenotazione 17:00-19:30 toglie posti da Pomeriggio E Sera, ma appare solo in Pomeriggio', async ({ page }) => {
    await page.goto('http://localhost:5175')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin')

    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 7)
    const dateStr = testDate.toISOString().split('T')[0]

    await page.goto('http://localhost:5175/admin')
    await page.click(`[data-date="${dateStr}"]`)

    // Crea prenotazione con 20 ospiti
    const bookingExists = await page.locator('text=Large Booking 17:00').isVisible()

    if (!bookingExists) {
      await page.fill('[name="client_name"]', 'Large Booking 17:00')
      await page.fill('[name="client_email"]', 'large1700@example.com')
      await page.fill('[name="num_guests"]', '20')
      await page.fill('[name="desired_time"]', '17:00')
      await page.click('button:has-text("Conferma")')
      await page.waitForTimeout(1000)
    }

    // Verifica che la prenotazione appaia SOLO in Pomeriggio
    const pomeriggioCard = page.locator('[data-testid="afternoon-card"]')
    const seraCard = page.locator('[data-testid="evening-card"]')

    await expect(pomeriggioCard.locator('text=Large Booking 17:00')).toBeVisible()
    await expect(seraCard.locator('text=Large Booking 17:00')).not.toBeVisible()

    // Verifica che i posti disponibili siano stati sottratti da ENTRAMBE le fasce
    // Capacità: Pomeriggio = 75, Sera = 75
    // Dopo prenotazione di 20 ospiti che copre entrambe: 55 disponibili in entrambe

    const pomeriggioCapacity = await pomeriggioCard.locator('[data-testid="capacity-info"]').textContent()
    const seraCapacity = await seraCard.locator('[data-testid="capacity-info"]').textContent()

    // Verifica che entrambe le fasce abbiano sottratto 20 posti
    expect(pomeriggioCapacity).toContain('55') // 75 - 20 = 55
    expect(seraCapacity).toContain('55') // 75 - 20 = 55
  })
})
```

**Step 3: Aggiungere data-testid alle card nel componente BookingCalendar**

Questo step richiede di modificare il componente per aggiungere gli attributi di test.

In `src/features/booking/components/BookingCalendar.tsx`, trova le card delle fasce orarie e aggiungi `data-testid`:

- Card Mattina: `data-testid="morning-card"`
- Card Pomeriggio: `data-testid="afternoon-card"`
- Card Sera: `data-testid="evening-card"`
- Info capacità: `data-testid="capacity-info"`

**Step 4: Commit**

```bash
git add e2e/time-slots/test-booking-time-slot-display.spec.ts
git add src/features/booking/components/BookingCalendar.tsx
git commit -m "test: add E2E tests for time slot display logic

- Verify bookings appear only in start time slot card
- Verify boundary cases (14:31, 18:31)
- Verify capacity calculation still uses overlap logic
- Add data-testid attributes for testing"
```

---

## Task 4: Eseguire i test

**Step 1: Eseguire i test E2E**

Run: `npx playwright test e2e/time-slots/test-booking-time-slot-display.spec.ts`

Expected: Tutti i test devono passare

**Step 2: Se i test falliscono, analizzare gli errori**

- Controllare i selettori (data-testid)
- Verificare che le card abbiano i data-testid corretti
- Verificare la logica di getStartSlotForBooking

**Step 3: Eseguire tutti i test per verificare che non ci siano regressioni**

Run: `npx playwright test`

Expected: Tutti i test devono passare (inclusi quelli esistenti)

---

## Task 5: Verifica manuale

**Step 1: Avviare l'app**

Run: `npm run dev`

**Step 2: Login come admin**

- Email: admin@example.com
- Password: admin123

**Step 3: Verificare visualmente**

1. Seleziona una data nel calendario
2. Crea una prenotazione alle 19:00 con 5 ospiti
3. Verifica che appaia SOLO nella card "Sera"
4. Crea una prenotazione alle 17:30 con 10 ospiti
5. Verifica che appaia SOLO nella card "Pomeriggio"
6. Verifica che i posti disponibili in "Sera" siano diminuiti (anche se la prenotazione 17:30 non appare lì)

**Step 4: Screenshot finale**

Take screenshot: `e2e/screenshots/time-slot-display-fixed.png`

---

## Verifica finale

✅ Le prenotazioni appaiono solo nella fascia oraria di inizio
✅ I calcoli di capacità continuano a funzionare correttamente
✅ I controlli di validazione (accettazione/modifica) continuano a funzionare
✅ Tutti i test passano
✅ Verifica manuale completata

## Note importanti

- `getSlotsOccupiedByBooking` NON viene modificata
- `calculateDailyCapacity` NON viene modificata
- Le validazioni in `PendingRequestsTab.tsx` e `BookingDetailsModal.tsx` NON vengono modificate
- Solo la VISUALIZZAZIONE nelle card cambia
