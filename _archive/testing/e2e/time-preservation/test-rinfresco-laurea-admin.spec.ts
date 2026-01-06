import { test, expect } from '@playwright/test'
import { supabase } from '../helpers/supabase-client'

/**
 * TEST 4: Time Preservation - Rinfresco di Laurea (Admin Form) - DATABASE VERIFICATION
 *
 * OBJECTIVE: Verify that desired_time is preserved EXACTLY in the database for admin-inserted rinfresco bookings
 *
 * This test verifies database storage only.
 * Admin bookings go directly to status='accepted' (not pending).
 * Includes preset menu selection for rinfresco di laurea.
 *
 * TIME SLOTS: Tests all available booking times (11:00-23:00, 30min intervals)
 */

test.describe('Time Preservation - Rinfresco di Laurea (Admin)', () => {
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
    const testEmail = `test-admin-rinfresco-${testTime.replace(':', '')}-${Date.now()}@test.com`
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 1) // Tomorrow
    const testDateStr = testDate.toISOString().split('T')[0] // YYYY-MM-DD

    console.log(`\n🧪 Testing time: ${testTime}`)
    console.log(`📧 Email: ${testEmail}`)
    console.log(`📅 Date: ${testDateStr}`)

    try {
      // ========================================
      // STEP 1: Login as admin
      // ========================================
      console.log('\n=== STEP 1: Admin Login ===')
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Fill login form - use working admin credentials from Test 11
      await page.fill('#email', '0cavuz0@gmail.com')
      await page.fill('#password', 'Cavallaro')
      console.log('✅ Login credentials filled')

      // Submit login
      const loginButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i })
      await loginButton.click()
      console.log('✅ Login submitted')

      // Wait for redirect to admin
      await page.waitForTimeout(2000)

      // Verify we're on admin page
      const currentUrl = page.url()
      expect(currentUrl).toContain('/admin')
      console.log('✅ Logged in and redirected to /admin')

      // ========================================
      // STEP 2: Fill admin booking form
      // ========================================
      console.log('\n=== STEP 2: Fill admin booking form ===')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Find and click the collapse card to expand "Inserisci nuova prenotazione" form
      // Look for the heading or container and click it
      const collapseSection = page.locator('text=Inserisci nuova prenotazione').first()
      await collapseSection.click()
      await page.waitForTimeout(1500)
      console.log('✅ Clicked "Inserisci nuova prenotazione" section')

      // Wait for form fields to be visible
      await page.waitForSelector('input#client_name', { timeout: 5000 })
      console.log('✅ Booking form is now visible')

      // Fill form fields - admin form is identical to public form (same selectors)
      await page.fill('input#client_name', `Admin Test Rinfresco ${testTime}`)
      await page.fill('input#client_email', testEmail)
      await page.fill('input#client_phone', '+39 333 9999999')

      // Select booking type: "rinfresco_laurea"
      const bookingTypeSelect = page.locator('select#booking_type')
      await bookingTypeSelect.selectOption('rinfresco_laurea')
      console.log('✅ Booking type selected: rinfresco_laurea')

      // Wait for form to update after booking type selection
      await page.waitForTimeout(1500)

      // Scroll down to see the menu section (appears below the two-column layout)
      await page.evaluate(() => window.scrollBy(0, 600))
      await page.waitForTimeout(500)
      console.log('✅ Scrolled down to see menu section')

      // Wait for preset menu dropdown to appear
      await page.waitForSelector('select#preset_menu', { timeout: 10000 })
      console.log('✅ Preset menu dropdown visible')

      // Select Menu 2 (Rinfresco completo) - use SELECT dropdown (admin form uses dropdown, not radio buttons)
      const presetMenuSelect = page.locator('select#preset_menu')
      await presetMenuSelect.selectOption('menu_2')
      console.log('✅ Preset menu selected: menu_2')

      // CRITICAL: Wait 5 seconds for form to update after menu selection
      await page.waitForTimeout(5000)
      console.log('✅ Waited 5s for form to update after menu selection')

      // Admin form uses HTML input elements (NOT dropdown components like public form)
      // Fill DATE using HTML date input
      console.log(`📅 Filling date: ${testDateStr}`)
      await page.fill('input#desired_date', testDateStr)
      console.log('✅ Date filled')

      // Fill TIME using HTML time input
      console.log(`⏰ Filling time: ${testTime}`)
      await page.fill('input#desired_time', testTime)
      console.log('✅ Time filled')

      console.log('👥 Filling num_guests: 30')
      await page.fill('input#num_guests', '30')
      console.log('✅ Num guests filled')

      // Admin form does NOT have privacy checkbox (unlike public form)
      // No privacy checkbox needed for admin form

      console.log(`✅ Admin form filled with time: ${testTime}`)

      // Submit form
      const submitButton = page.locator('button[type="submit"]').filter({ hasText: /crea|invia/i })
      await submitButton.click()
      console.log('✅ Admin form submitted')

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

      // Admin bookings should be 'accepted' status
      expect(booking.status).toBe('accepted')
      console.log(`✅ DB status: "${booking.status}" (admin booking)`)

      // Verify booking type and menu
      expect(booking.booking_type).toBe('rinfresco_laurea')
      console.log(`✅ DB booking_type: "${booking.booking_type}"`)

      expect(booking.preset_menu).toBe('menu_2')
      console.log(`✅ DB preset_menu: "${booking.preset_menu}"`)

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
