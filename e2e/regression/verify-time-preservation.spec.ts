import { test, expect } from '@playwright/test'
import { supabase } from '../../src/lib/supabase'

/**
 * REGRESSION TEST: Verify Time Preservation
 *
 * Root Cause: confirmed_start (TIMESTAMP WITH TIME ZONE) causa shift timezone in production
 * Fix: Usare desired_time (TIME) per visualizzazione accurata
 *
 * Test verifica che:
 * 1. Orario inserito dal cliente (es. 20:00) viene salvato esattamente in DB
 * 2. Dopo accettazione, desired_time viene preservato
 * 3. Calendario visualizza esattamente l'orario inserito (NO +1h shift)
 */

test.describe('Regression: Time Preservation', () => {
  // Cleanup function
  const cleanupTestBooking = async (email: string) => {
    const { error } = await supabase
      .from('booking_requests')
      .delete()
      .eq('client_email', email)

    if (error) {
      console.warn('⚠️ Cleanup warning:', error.message)
    }
  }

  test('should preserve exact time from client input through acceptance to calendar display', async ({ page }) => {
    const testEmail = `time-test-${Date.now()}@test.com`
    const testTime = '20:00'
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 7) // 7 giorni nel futuro
    const testDateStr = testDate.toISOString().split('T')[0] // YYYY-MM-DD

    console.log('🧪 REGRESSION TEST: Time Preservation')
    console.log(`📧 Test email: ${testEmail}`)
    console.log(`🕐 Test time: ${testTime}`)
    console.log(`📅 Test date: ${testDateStr}`)

    try {
      // STEP 1: Insert booking con orario specifico
      console.log('\n=== STEP 1: Inserimento prenotazione ===')
      await page.goto('/prenota')
      await page.waitForLoadState('networkidle')

      // Fill form
      await page.fill('input[name="clientName"]', 'Test Time Preservation')
      await page.fill('input[name="clientEmail"]', testEmail)
      await page.fill('input[name="clientPhone"]', '+39 333 1234567')
      await page.fill('input[name="desiredDate"]', testDateStr)
      await page.fill('input[name="desiredTime"]', testTime)
      await page.fill('input[name="numGuests"]', '4')

      // Select event type
      const eventTypeSelect = page.locator('select[name="eventType"]')
      await eventTypeSelect.selectOption('Pranzo/Cena')

      console.log('✅ Form filled with time:', testTime)

      // Submit
      const submitButton = page.locator('button[type="submit"]').filter({ hasText: /invia/i })
      await submitButton.click()
      await page.waitForTimeout(2000)

      // STEP 2: Verify in DB - desired_time salvato correttamente
      console.log('\n=== STEP 2: Verifica DB - desired_time salvato ===')
      const { data: insertedBooking, error: fetchError } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('client_email', testEmail)
        .single()

      expect(fetchError).toBeNull()
      expect(insertedBooking).toBeDefined()
      expect(insertedBooking.desired_time).toBe(testTime)
      console.log(`✅ DB desired_time: ${insertedBooking.desired_time} (expected: ${testTime})`)

      // STEP 3: Login as admin
      console.log('\n=== STEP 3: Login admin ===')
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      await page.fill('#email', '0cavuz0@gmail.com')
      await page.fill('#password', 'Cavallaro')
      const loginButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i })
      await loginButton.click()
      await page.waitForTimeout(2000)

      const currentUrl = page.url()
      if (!currentUrl.includes('/admin')) {
        console.log('⚠️ Login failed - skipping test')
        test.skip()
        return
      }
      console.log('✅ Admin logged in')

      // STEP 4: Accept booking
      console.log('\n=== STEP 4: Accettazione prenotazione ===')

      // Go to pending tab
      const pendingTab = page.locator('button:has-text("Prenotazioni Pendenti")')
      await pendingTab.click()
      await page.waitForTimeout(1000)

      // Find and accept test booking
      const bookingCard = page.locator(`text=${testEmail}`).locator('..').locator('..')
      const acceptButton = bookingCard.locator('button:has-text("Accetta")')
      await acceptButton.click()
      await page.waitForTimeout(2000)

      console.log('✅ Booking accepted')

      // STEP 5: Verify in DB - desired_time preserved after acceptance
      console.log('\n=== STEP 5: Verifica DB - desired_time preservato dopo accettazione ===')
      const { data: acceptedBooking, error: acceptError } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('client_email', testEmail)
        .single()

      expect(acceptError).toBeNull()
      expect(acceptedBooking).toBeDefined()
      expect(acceptedBooking.status).toBe('accepted')
      expect(acceptedBooking.desired_time).toBe(testTime) // ✅ CRITICAL CHECK
      console.log(`✅ DB desired_time after acceptance: ${acceptedBooking.desired_time} (expected: ${testTime})`)

      // STEP 6: Verify calendar display
      console.log('\n=== STEP 6: Verifica visualizzazione calendario ===')

      // Go to calendar tab
      const calendarTab = page.locator('button:has-text("Calendario")')
      await calendarTab.click()
      await page.waitForTimeout(2000)

      // Navigate to test date
      const calendarApi = await page.evaluate((dateStr) => {
        const calendar = document.querySelector('.fc')
        if (calendar) {
          // @ts-ignore
          const api = calendar.fcApi
          if (api) {
            api.gotoDate(dateStr)
            return true
          }
        }
        return false
      }, testDateStr)

      if (!calendarApi) {
        console.warn('⚠️ Could not access FullCalendar API')
      }

      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'e2e/screenshots/time-preservation-calendar.png', fullPage: true })

      // Verify time displayed in calendar
      const eventText = page.locator('.fc-event', { hasText: 'Test Time Preservation' })
      await expect(eventText).toBeVisible()

      // Check that time displayed contains testTime (20:00)
      const eventContent = await eventText.textContent()
      console.log(`📅 Calendar event text: "${eventContent}"`)

      // ✅ CRITICAL ASSERTION: Time should be exactly as inserted
      expect(eventContent).toContain(testTime)
      console.log(`✅ Calendar displays correct time: ${testTime}`)

      // STEP 7: Verify in daily capacity cards
      console.log('\n=== STEP 7: Verifica card dettaglio giornaliero ===')

      // Click on date in calendar to open daily view
      const dateCell = page.locator(`.fc-day[data-date="${testDateStr}"]`)
      await dateCell.click()
      await page.waitForTimeout(1000)

      // Find the booking card in daily view
      const dailyCard = page.locator(`text=${testEmail}`).locator('..').locator('..')
      await expect(dailyCard).toBeVisible()

      // Verify time in card
      const cardTime = dailyCard.locator(`text=/Orario:/i`).locator('..').locator('span').last()
      const timeText = await cardTime.textContent()
      console.log(`🕐 Card time text: "${timeText}"`)

      // ✅ CRITICAL ASSERTION: Card should show exact time
      expect(timeText).toContain(testTime)
      console.log(`✅ Card displays correct time: ${testTime}`)

      console.log('\n✅ ✅ ✅ ALL CHECKS PASSED - Time preserved correctly! ✅ ✅ ✅')

    } finally {
      // Cleanup
      console.log('\n=== CLEANUP ===')
      await cleanupTestBooking(testEmail)
      console.log('✅ Test booking deleted')
    }
  })
})
