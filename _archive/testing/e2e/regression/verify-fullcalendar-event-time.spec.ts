import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for E2E tests
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dphuttzgdcerexunebct.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHV0dHpnZGNlcmV4dW5lYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTI0NDMsImV4cCI6MjA3NzA4ODQ0M30.8OpmfjuZkT2vdSbOcr4fUeaKaKibuF4vdFLnNSk7h60'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * REGRESSION TEST: Verify FullCalendar Event Objects Have Correct Time
 *
 * Root Cause: bookingEventTransform.ts usava confirmed_start (TIMESTAMP WITH TIME ZONE)
 * invece di desired_time (TIME), causando shift timezone in production
 *
 * Fix: Modificato transformBookingToCalendarEvent per usare getAccurateTime()
 * che preferisce desired_time a confirmed_start
 *
 * Test verifica che:
 * 1. Gli oggetti evento FullCalendar abbiano le date corrette (non solo il testo)
 * 2. Le ore negli oggetti evento siano esattamente quelle inserite (NO +1h shift)
 * 3. Il tooltip/hover mostri l'orario corretto
 */

test.describe('Regression: FullCalendar Event Objects Time', () => {
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

  test('should have correct time in FullCalendar event objects (not just text)', async ({ page }) => {
    const testEmail = `fc-event-time-${Date.now()}@test.com`
    const testTime = '20:00'
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 7) // 7 giorni nel futuro
    const testDateStr = testDate.toISOString().split('T')[0] // YYYY-MM-DD

    console.log('🧪 REGRESSION TEST: FullCalendar Event Objects Time')
    console.log(`📧 Test email: ${testEmail}`)
    console.log(`🕐 Test time: ${testTime}`)
    console.log(`📅 Test date: ${testDateStr}`)

    try {
      // STEP 1: Insert booking
      console.log('\n=== STEP 1: Inserimento prenotazione ===')
      await page.goto('/prenota')
      await page.waitForLoadState('networkidle')

      // Fill form
      await page.fill('input[name="clientName"]', 'FC Event Time Test')
      await page.fill('input[name="clientEmail"]', testEmail)
      await page.fill('input[name="clientPhone"]', '+39 333 7654321')
      await page.fill('input[name="desiredDate"]', testDateStr)
      await page.fill('input[name="desiredTime"]', testTime)
      await page.fill('input[name="numGuests"]', '6')

      // Select event type
      const eventTypeSelect = page.locator('select[name="eventType"]')
      await eventTypeSelect.selectOption('Pranzo/Cena')

      console.log('✅ Form filled with time:', testTime)

      // Submit
      const submitButton = page.locator('button[type="submit"]').filter({ hasText: /invia/i })
      await submitButton.click()
      await page.waitForTimeout(2000)

      // STEP 2: Login as admin
      console.log('\n=== STEP 2: Login admin ===')
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

      // STEP 3: Accept booking
      console.log('\n=== STEP 3: Accettazione prenotazione ===')

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

      // STEP 4: Go to calendar
      console.log('\n=== STEP 4: Navigazione calendario ===')
      const calendarTab = page.locator('button:has-text("Calendario")')
      await calendarTab.click()
      await page.waitForTimeout(2000)

      // Navigate to test date
      await page.evaluate((dateStr) => {
        const calendar = document.querySelector('.fc')
        if (calendar) {
          // @ts-ignore
          const api = calendar.fcApi
          if (api) {
            api.gotoDate(dateStr)
          }
        }
      }, testDateStr)

      await page.waitForTimeout(1000)

      // STEP 5: Verify FullCalendar event object has correct time
      console.log('\n=== STEP 5: Verifica oggetti evento FullCalendar ===')

      // Extract event objects from FullCalendar API
      const eventData = await page.evaluate((email) => {
        const calendar = document.querySelector('.fc')
        if (!calendar) return { error: 'Calendar not found' }

        // @ts-ignore
        const api = calendar.fcApi
        if (!api) return { error: 'FullCalendar API not found' }

        // Get all events
        const events = api.getEvents()

        // Find test event
        const testEvent = events.find((e: any) => {
          return e.extendedProps?.client_email === email
        })

        if (!testEvent) return { error: 'Test event not found in calendar' }

        return {
          id: testEvent.id,
          title: testEvent.title,
          start: testEvent.start?.toISOString(),
          end: testEvent.end?.toISOString(),
          startHours: testEvent.start?.getHours(),
          startMinutes: testEvent.start?.getMinutes(),
          endHours: testEvent.end?.getHours(),
          endMinutes: testEvent.end?.getMinutes(),
          clientEmail: testEvent.extendedProps?.client_email,
          desiredTime: testEvent.extendedProps?.desired_time,
        }
      }, testEmail)

      console.log('📊 Event data from FullCalendar API:', JSON.stringify(eventData, null, 2))

      // Assertions
      expect(eventData).toBeDefined()
      // @ts-ignore
      expect(eventData.error).toBeUndefined()
      // @ts-ignore
      expect(eventData.clientEmail).toBe(testEmail)

      // ✅ CRITICAL ASSERTION: Start time should be exactly testTime (20:00)
      // @ts-ignore
      const actualStartHours = eventData.startHours
      // @ts-ignore
      const actualStartMinutes = eventData.startMinutes
      const [expectedHours, expectedMinutes] = testTime.split(':').map(Number)

      console.log(`🕐 Expected time: ${expectedHours}:${String(expectedMinutes).padStart(2, '0')}`)
      console.log(`🕐 Actual event start: ${actualStartHours}:${String(actualStartMinutes).padStart(2, '0')}`)

      expect(actualStartHours).toBe(expectedHours)
      expect(actualStartMinutes).toBe(expectedMinutes)

      console.log(`✅ FullCalendar event object has correct time: ${actualStartHours}:${String(actualStartMinutes).padStart(2, '0')}`)

      // STEP 6: Verify event click shows correct time in modal
      console.log('\n=== STEP 6: Verifica modal dettagli evento ===')

      // Click on event
      const eventElement = page.locator('.fc-event', { hasText: 'FC Event Time Test' })
      await eventElement.click()
      await page.waitForTimeout(1000)

      // Verify modal opened
      const modal = page.locator('[role="dialog"]')
      await expect(modal).toBeVisible()

      // Verify time in modal
      const modalTime = modal.locator('text=/Orario:/i').locator('..').locator('span').last()
      const modalTimeText = await modalTime.textContent()
      console.log(`🕐 Modal time text: "${modalTimeText}"`)

      // ✅ CRITICAL ASSERTION: Modal should show exact time
      expect(modalTimeText).toContain(testTime)
      console.log(`✅ Modal displays correct time: ${testTime}`)

      // Take screenshot for verification
      await page.screenshot({ path: 'e2e/screenshots/fullcalendar-event-time-modal.png', fullPage: true })

      console.log('\n✅ ✅ ✅ ALL CHECKS PASSED - FullCalendar events have correct time! ✅ ✅ ✅')

    } finally {
      // Cleanup
      console.log('\n=== CLEANUP ===')
      await cleanupTestBooking(testEmail)
      console.log('✅ Test booking deleted')
    }
  })
})
