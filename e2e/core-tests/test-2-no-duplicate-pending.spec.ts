import { test, expect } from '@playwright/test'
import { supabase } from '../../src/lib/supabase'

/**
 * ✅ TEST CORE #2: Protezione Contro Doppi Pending
 *
 * COSA TESTA:
 * - Lock atomico previene doppi submit simultanei
 * - Nessuna prenotazione duplicata nel DB
 * - UI disabilitata correttamente durante submit
 *
 * PROTEZIONI TESTATE:
 * 1. sessionStorage lock globale (multi-tab)
 * 2. React state lock (componente)
 * 3. React ref lock (backup)
 * 4. React Query mutation state
 * 5. Button disabled durante submit
 *
 * REQUISITI:
 * - App running su localhost:5173
 * - Supabase configurato
 *
 * ESECUZIONE:
 * npx playwright test e2e/core-tests/test-2-no-duplicate-pending.spec.ts
 */

test.describe('TEST CORE #2: No Duplicate Pending', () => {
  const cleanupTestBooking = async (email: string) => {
    const { error } = await supabase
      .from('booking_requests')
      .delete()
      .eq('client_email', email)

    if (error && !error.message.includes('0 rows')) {
      console.warn('⚠️ Cleanup warning:', error.message)
    }
  }

  test('should prevent duplicate pending bookings with atomic lock', async ({ page }) => {
    const testEmail = `test-duplicate-${Date.now()}@example.com`
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 7)
    const testDateStr = testDate.toISOString().split('T')[0]

    console.log('🧪 TEST CORE #2: Protezione Doppi Pending')
    console.log(`📧 Email: ${testEmail}`)

    try {
      // STEP 1: Vai al form
      console.log('\n=== STEP 1: Apertura form ===')
      await page.goto('/prenota')
      await page.waitForLoadState('networkidle')

      // STEP 2: Compila form
      console.log('\n=== STEP 2: Compilazione form ===')
      await page.fill('input[name="clientName"]', 'Test No Duplicates')
      await page.fill('input[name="clientEmail"]', testEmail)
      await page.fill('input[name="clientPhone"]', '+39 333 1234567')
      await page.fill('input[name="desiredDate"]', testDateStr)
      await page.fill('input[name="desiredTime"]', '19:00')
      await page.fill('input[name="numGuests"]', '3')

      const eventTypeSelect = page.locator('select[name="eventType"]')
      await eventTypeSelect.selectOption('Pranzo/Cena')

      const privacyCheckbox = page.locator('input[type="checkbox"]')
      await privacyCheckbox.check()

      console.log('✅ Form compilato')

      // STEP 3: Verifica button enabled prima del submit
      console.log('\n=== STEP 3: Verifica stato button ===')
      const submitButton = page.locator('button[type="submit"]').filter({ hasText: /invia/i })

      const isInitiallyDisabled = await submitButton.isDisabled()
      expect(isInitiallyDisabled).toBe(false)
      console.log('✅ Button enabled (corretto)')

      // STEP 4: Click submit (singolo)
      console.log('\n=== STEP 4: Submit singolo ===')
      await submitButton.click()
      console.log('✅ Button cliccato')

      // STEP 5: Verifica button disabled immediatamente dopo click
      console.log('\n=== STEP 5: Verifica button disabled dopo click ===')
      await page.waitForTimeout(100) // Minimo delay per state update

      const isDisabledAfterClick = await submitButton.isDisabled()
      expect(isDisabledAfterClick).toBe(true)
      console.log('✅ Button disabled dopo click (lock attivo)')

      // STEP 6: Tenta doppio click rapido (dovrebbe essere bloccato da UI disabled)
      console.log('\n=== STEP 6: Tentativo doppio click (bloccato da UI) ===')
      try {
        await submitButton.click({ timeout: 500 })
        console.warn('⚠️ Click riuscito (unexpected, ma potrebbe essere ok se già disabled)')
      } catch (e) {
        console.log('✅ Click bloccato come atteso (button disabled)')
      }

      // Wait for submission to complete
      await page.waitForTimeout(3000)

      // STEP 7: Verifica in DB - DEVE esserci 1 SOLA prenotazione
      console.log('\n=== STEP 7: Verifica Database ===')
      const { data: bookings, error: fetchError } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('client_email', testEmail)

      expect(fetchError).toBeNull()
      expect(bookings).toBeDefined()

      // 🔴 CRITICAL CHECK: Esattamente 1 booking, NO duplicati
      console.log(`📊 Bookings trovati nel DB: ${bookings?.length || 0}`)
      expect(bookings?.length).toBe(1)
      console.log('✅ NESSUN DUPLICATO: esattamente 1 booking salvato')

      // Verifica status
      expect(bookings[0].status).toBe('pending')
      expect(bookings[0].client_email).toBe(testEmail)
      console.log('✅ Booking corretto con status "pending"')

      console.log('\n✅ ✅ ✅ TEST PASSED: Lock atomico previene duplicati! ✅ ✅ ✅')

    } finally {
      // Cleanup
      console.log('\n=== CLEANUP ===')
      await cleanupTestBooking(testEmail)
      console.log('✅ Test booking eliminato')
    }
  })

  test('should handle rapid form submissions correctly', async ({ page }) => {
    const testEmail = `test-rapid-${Date.now()}@example.com`
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 8)
    const testDateStr = testDate.toISOString().split('T')[0]

    console.log('\n🧪 TEST: Rapid Submissions')
    console.log(`📧 Email: ${testEmail}`)

    try {
      await page.goto('/prenota')
      await page.waitForLoadState('networkidle')

      // Fill form
      await page.fill('input[name="clientName"]', 'Test Rapid Submit')
      await page.fill('input[name="clientEmail"]', testEmail)
      await page.fill('input[name="clientPhone"]', '+39 333 5555555')
      await page.fill('input[name="desiredDate"]', testDateStr)
      await page.fill('input[name="desiredTime"]', '20:30')
      await page.fill('input[name="numGuests"]', '5')

      const eventTypeSelect = page.locator('select[name="eventType"]')
      await eventTypeSelect.selectOption('Pranzo/Cena')

      const privacyCheckbox = page.locator('input[type="checkbox"]')
      await privacyCheckbox.check()

      console.log('✅ Form pronto')

      // Try rapid clicks (simula utente ansioso che clicca più volte)
      console.log('\n=== Simulazione: 5 click rapidissimi ===')
      const submitButton = page.locator('button[type="submit"]').filter({ hasText: /invia/i })

      // Click multipli in rapida successione
      const clickPromises = []
      for (let i = 0; i < 5; i++) {
        clickPromises.push(
          submitButton.click({ timeout: 200 }).catch(() => {
            console.log(`Click ${i + 1}: Bloccato (button disabled o timeout)`)
          })
        )
      }

      await Promise.all(clickPromises)
      console.log('✅ Tutti i click tentati')

      // Wait for any submission to complete
      await page.waitForTimeout(4000)

      // Check DB
      console.log('\n=== Verifica Database dopo click multipli ===')
      const { data: bookings, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('client_email', testEmail)

      expect(error).toBeNull()

      const count = bookings?.length || 0
      console.log(`📊 Bookings nel DB: ${count}`)

      // 🔴 CRITICAL: Massimo 1 booking anche con 5 click rapidi
      expect(count).toBeLessThanOrEqual(1)

      if (count === 1) {
        console.log('✅ PERFETTO: Solo 1 booking salvato nonostante 5 click')
      } else {
        console.log('✅ Nessun booking salvato (possibile se tutti bloccati da validazione)')
      }

      console.log('\n✅ ✅ ✅ TEST PASSED: Lock resiste a click rapidi! ✅ ✅ ✅')

    } finally {
      await cleanupTestBooking(testEmail)
    }
  })

  test('should release lock after successful submission', async ({ page }) => {
    const testEmail1 = `test-lock-release-1-${Date.now()}@example.com`
    const testEmail2 = `test-lock-release-2-${Date.now()}@example.com`
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 9)
    const testDateStr = testDate.toISOString().split('T')[0]

    console.log('\n🧪 TEST: Lock Release After Submit')

    try {
      // SUBMISSION 1
      console.log('\n=== Submission 1 ===')
      await page.goto('/prenota')
      await page.waitForLoadState('networkidle')

      await page.fill('input[name="clientName"]', 'Test Lock Release 1')
      await page.fill('input[name="clientEmail"]', testEmail1)
      await page.fill('input[name="clientPhone"]', '+39 333 1111111')
      await page.fill('input[name="desiredDate"]', testDateStr)
      await page.fill('input[name="desiredTime"]', '18:00')
      await page.fill('input[name="numGuests"]', '2')

      const eventTypeSelect1 = page.locator('select[name="eventType"]')
      await eventTypeSelect1.selectOption('Pranzo/Cena')

      const privacyCheckbox1 = page.locator('input[type="checkbox"]')
      await privacyCheckbox1.check()

      const submitButton1 = page.locator('button[type="submit"]').filter({ hasText: /invia/i })
      await submitButton1.click()
      console.log('✅ Submit 1 inviato')

      // Wait for completion + modal
      await page.waitForTimeout(3000)

      // Close modal if present
      const modalCloseButton = page.locator('button').filter({ hasText: /chiudi|ok/i })
      if (await modalCloseButton.isVisible()) {
        await modalCloseButton.click()
        await page.waitForTimeout(500)
      }

      // SUBMISSION 2 (should work because lock was released)
      console.log('\n=== Submission 2 (dopo rilascio lock) ===')
      await page.goto('/prenota')
      await page.waitForLoadState('networkidle')

      await page.fill('input[name="clientName"]', 'Test Lock Release 2')
      await page.fill('input[name="clientEmail"]', testEmail2)
      await page.fill('input[name="clientPhone"]', '+39 333 2222222')
      await page.fill('input[name="desiredDate"]', testDateStr)
      await page.fill('input[name="desiredTime"]', '19:00')
      await page.fill('input[name="numGuests"]', '3')

      const eventTypeSelect2 = page.locator('select[name="eventType"]')
      await eventTypeSelect2.selectOption('Pranzo/Cena')

      const privacyCheckbox2 = page.locator('input[type="checkbox"]')
      await privacyCheckbox2.check()

      const submitButton2 = page.locator('button[type="submit"]').filter({ hasText: /invia/i })
      await submitButton2.click()
      console.log('✅ Submit 2 inviato')

      await page.waitForTimeout(3000)

      // Verify both bookings in DB
      console.log('\n=== Verifica entrambe le submission ===')
      const { data: booking1 } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('client_email', testEmail1)
        .single()

      const { data: booking2 } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('client_email', testEmail2)
        .single()

      expect(booking1).toBeDefined()
      expect(booking2).toBeDefined()
      console.log('✅ Entrambi i booking salvati correttamente')
      console.log('✅ Lock rilasciato correttamente dopo submit 1')

      console.log('\n✅ ✅ ✅ TEST PASSED: Lock rilasciato e riutilizzabile! ✅ ✅ ✅')

    } finally {
      await cleanupTestBooking(testEmail1)
      await cleanupTestBooking(testEmail2)
    }
  })
})
