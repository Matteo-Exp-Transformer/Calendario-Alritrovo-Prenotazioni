import { test, expect } from '@playwright/test'
import { supabase } from '../../src/lib/supabase'

/**
 * ✅ TEST CORE #1: Inserimento Booking + Verifica Orario Esatto
 *
 * COSA TESTA:
 * - Inserimento prenotazione dal form pubblico
 * - Verifica che l'orario inserito (es. 20:00) viene salvato ESATTAMENTE in DB
 * - Nessun shift timezone (NO 21:00 o 19:00)
 *
 * REQUISITI:
 * - App running su localhost:5173
 * - Supabase configurato (vedi .env.local)
 *
 * ESECUZIONE:
 * npx playwright test e2e/core-tests/test-1-insert-booking-verify-time.spec.ts
 */

test.describe('TEST CORE #1: Inserimento Booking + Verifica Orario', () => {
  // Cleanup automatico dopo test
  const cleanupTestBooking = async (email: string) => {
    const { error } = await supabase
      .from('booking_requests')
      .delete()
      .eq('client_email', email)

    if (error) {
      console.warn('⚠️ Cleanup warning:', error.message)
    }
  }

  test('should insert booking and preserve exact time without timezone shift', async ({ page }) => {
    const testEmail = `test-time-${Date.now()}@example.com`
    const testTime = '20:00'
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 7) // 7 giorni nel futuro
    const testDateStr = testDate.toISOString().split('T')[0] // YYYY-MM-DD

    console.log('🧪 TEST CORE #1: Inserimento + Verifica Orario')
    console.log(`📧 Email: ${testEmail}`)
    console.log(`🕐 Orario atteso: ${testTime}`)
    console.log(`📅 Data: ${testDateStr}`)

    try {
      // STEP 1: Vai alla pagina di prenotazione
      console.log('\n=== STEP 1: Apertura form prenotazione ===')
      await page.goto('/prenota')
      await page.waitForLoadState('networkidle')
      console.log('✅ Form caricato')

      // STEP 2: Compila il form
      console.log('\n=== STEP 2: Compilazione form ===')
      await page.fill('input[name="clientName"]', 'Test User Time Verification')
      await page.fill('input[name="clientEmail"]', testEmail)
      await page.fill('input[name="clientPhone"]', '+39 333 1234567')
      await page.fill('input[name="desiredDate"]', testDateStr)
      await page.fill('input[name="desiredTime"]', testTime) // ✅ Orario critico
      await page.fill('input[name="numGuests"]', '4')

      // Select event type
      const eventTypeSelect = page.locator('select[name="eventType"]')
      await eventTypeSelect.selectOption('Pranzo/Cena')

      console.log(`✅ Form compilato con orario: ${testTime}`)

      // STEP 3: Accetta privacy e invia
      console.log('\n=== STEP 3: Invio prenotazione ===')
      const privacyCheckbox = page.locator('input[type="checkbox"]')
      await privacyCheckbox.check()

      const submitButton = page.locator('button[type="submit"]').filter({ hasText: /invia/i })
      await submitButton.click()
      console.log('✅ Form inviato')

      // Wait for success
      await page.waitForTimeout(3000)

      // STEP 4: Verifica in DB - desired_time salvato esattamente
      console.log('\n=== STEP 4: Verifica Database ===')
      const { data: booking, error: fetchError } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('client_email', testEmail)
        .single()

      // ✅ ASSERTIONS CRITICHE
      expect(fetchError).toBeNull()
      expect(booking).toBeDefined()
      expect(booking.status).toBe('pending')

      // 🔴 CRITICAL CHECK: Orario deve essere esattamente quello inserito
      expect(booking.desired_time).toBe(testTime)
      console.log(`✅ DB desired_time: "${booking.desired_time}" (expected: "${testTime}")`)

      // Verifica che confirmed_start sia NULL (booking pending)
      expect(booking.confirmed_start).toBeNull()
      console.log('✅ confirmed_start: NULL (corretto per pending)')

      // STEP 5: Verifica dati completi
      console.log('\n=== STEP 5: Verifica dati completi ===')
      expect(booking.client_name).toBe('Test User Time Verification')
      expect(booking.client_email).toBe(testEmail)
      expect(booking.desired_date).toBe(testDateStr)
      expect(booking.num_guests).toBe(4)
      console.log('✅ Tutti i dati salvati correttamente')

      console.log('\n✅ ✅ ✅ TEST PASSED: Orario preservato senza shift timezone! ✅ ✅ ✅')

    } finally {
      // Cleanup
      console.log('\n=== CLEANUP ===')
      await cleanupTestBooking(testEmail)
      console.log('✅ Test booking eliminato')
    }
  })

  test('should handle multiple time values correctly (edge cases)', async ({ page }) => {
    const testCases = [
      { time: '12:00', label: 'Mezzogiorno' },
      { time: '18:30', label: 'Ora serale' },
      { time: '23:45', label: 'Tarda sera' }
    ]

    for (const testCase of testCases) {
      const testEmail = `test-time-${testCase.time.replace(':', '')}-${Date.now()}@example.com`
      const testDate = new Date()
      testDate.setDate(testDate.getDate() + 8)
      const testDateStr = testDate.toISOString().split('T')[0]

      console.log(`\n🧪 Testing time: ${testCase.time} (${testCase.label})`)

      try {
        await page.goto('/prenota')
        await page.waitForLoadState('networkidle')

        await page.fill('input[name="clientName"]', `Test ${testCase.label}`)
        await page.fill('input[name="clientEmail"]', testEmail)
        await page.fill('input[name="clientPhone"]', '+39 333 9999999')
        await page.fill('input[name="desiredDate"]', testDateStr)
        await page.fill('input[name="desiredTime"]', testCase.time)
        await page.fill('input[name="numGuests"]', '2')

        const eventTypeSelect = page.locator('select[name="eventType"]')
        await eventTypeSelect.selectOption('Pranzo/Cena')

        const privacyCheckbox = page.locator('input[type="checkbox"]')
        await privacyCheckbox.check()

        const submitButton = page.locator('button[type="submit"]').filter({ hasText: /invia/i })
        await submitButton.click()

        await page.waitForTimeout(2000)

        const { data: booking, error } = await supabase
          .from('booking_requests')
          .select('desired_time')
          .eq('client_email', testEmail)
          .single()

        expect(error).toBeNull()
        expect(booking.desired_time).toBe(testCase.time)
        console.log(`✅ ${testCase.label}: "${testCase.time}" preservato correttamente`)

        await cleanupTestBooking(testEmail)

      } catch (error) {
        console.error(`❌ Failed for ${testCase.time}:`, error)
        await cleanupTestBooking(testEmail)
        throw error
      }
    }

    console.log('\n✅ ✅ ✅ All time edge cases passed! ✅ ✅ ✅')
  })
})
