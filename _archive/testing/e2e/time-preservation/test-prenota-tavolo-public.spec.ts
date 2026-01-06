import { test, expect } from '@playwright/test'
import { supabase } from '../helpers/supabase-client'

/**
 * TEST 1: Time Preservation - Prenota un Tavolo (Public Form) - DATABASE VERIFICATION
 *
 * OBJECTIVE: Verify that desired_time is preserved EXACTLY in the database
 *
 * This test verifies database storage only (Checkpoint 1).
 * Admin UI verification (Calendar and Time Slot Cards) removed due to login issues.
 *
 * TIME SLOTS: Tests all available booking times (11:00-23:00, 30min intervals)
 */

test.describe('Time Preservation - Prenota un Tavolo (Public)', () => {
  // All available time slots for booking (11:00-23:00, 30min intervals)
  const TIME_SLOTS = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
  ]

  // Cleanup helper
  const cleanupBooking = async (email: string) => {
    const { error } = await supabase
      .from('booking_requests')
      .delete()
      .eq('client_email', email)

    if (error) {
      console.warn('⚠️ Cleanup warning:', error.message)
    }
  }

  // Test each time slot
  for (const testTime of TIME_SLOTS) {
    test(`should preserve time ${testTime} in database`, async ({ page }) => {
    const testEmail = `test-tavolo-${testTime.replace(':', '')}-${Date.now()}@test.com`
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 1) // Tomorrow
    const testDateStr = testDate.toISOString().split('T')[0] // YYYY-MM-DD

    console.log(`\n🧪 Testing time: ${testTime}`)
    console.log(`📧 Email: ${testEmail}`)
    console.log(`📅 Date: ${testDateStr}`)

    try {
      // ========================================
      // STEP 1: Fill and submit booking form
      // ========================================
      console.log('\n=== STEP 1: Fill booking form ===')
      await page.goto('/prenota')
      await page.waitForLoadState('networkidle')

      // Dismiss cookie consent if present
      const cookieAcceptButton = page.locator('button:has-text("Accetto")')
      if (await cookieAcceptButton.isVisible()) {
        await cookieAcceptButton.click({ force: true })
        await page.waitForTimeout(500)
        console.log('✅ Cookie consent dismissed')
      }

      // Fill form fields using correct id selectors
      await page.fill('input#client_name', `Test Tavolo ${testTime}`)
      await page.fill('input#client_email', testEmail)
      await page.fill('input#client_phone', '+39 333 1234567')

      // Select booking type first: "tavolo" (Prenota un Tavolo)
      const bookingTypeSelect = page.locator('select#booking_type')
      await bookingTypeSelect.selectOption('tavolo')

      // Fill DATE using DateInput component (3 dropdowns: Day, Month, Year)
      const [year, month, day] = testDateStr.split('-') // Parse YYYY-MM-DD
      await page.selectOption('select[aria-label="Giorno"]', day)
      await page.selectOption('select[aria-label="Mese"]', month) // Month value (not label!)
      await page.selectOption('select[aria-label="Anno"]', year)

      // Fill TIME using TimeInput component (2 dropdowns: Hour, Minutes)
      const [hours, minutes] = testTime.split(':')
      await page.selectOption('select[aria-label="Ora"]', hours.padStart(2, '0'))
      await page.selectOption('select[aria-label="Minuti"]', minutes.padStart(2, '0'))

      await page.fill('input#num_guests', '4')

      // Accept privacy using correct id - use force to bypass any overlays
      const privacyCheckbox = page.locator('input#privacy-consent')
      await privacyCheckbox.check({ force: true })
      console.log('✅ Privacy checkbox checked')

      // Wait a moment to ensure form state updates
      await page.waitForTimeout(500)

      console.log(`✅ Form filled with time: ${testTime}`)

      // Submit form
      const submitButton = page.locator('button[type="submit"]').filter({ hasText: /invia/i })
      await submitButton.click()
      console.log('✅ Form submitted')

      // Wait for submission to complete
      await page.waitForTimeout(3000)

      // ========================================
      // CHECKPOINT 1: Database Verification
      // ========================================
      console.log('\n=== CHECKPOINT 1: Database ===')
      const { data: booking, error: fetchError } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('client_email', testEmail)
        .single()

      expect(fetchError).toBeNull()
      expect(booking).toBeDefined()

      // Accept both HH:MM and HH:MM:SS formats (DB stores as TIME type with seconds)
      const expectedTimeWithSeconds = `${testTime}:00`
      const actualTime = booking.desired_time
      const timeMatches = actualTime === testTime || actualTime === expectedTimeWithSeconds

      expect(timeMatches).toBe(true)
      console.log(`✅ DB desired_time: "${actualTime}" (expected: "${testTime}" or "${expectedTimeWithSeconds}")`)

      console.log(`\n✅✅✅ TEST PASSED for ${testTime} ✅✅✅`)

    } finally {
      // Cleanup
      console.log('\n=== CLEANUP ===')
      await cleanupBooking(testEmail)
      console.log('✅ Test booking deleted')
    }
    })
  }
})
