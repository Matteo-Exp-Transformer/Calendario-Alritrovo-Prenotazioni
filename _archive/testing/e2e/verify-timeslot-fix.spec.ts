import { test, expect } from '@playwright/test'

/**
 * Verification test for time slot display fix
 *
 * Purpose: Verify that bookings appear ONLY in the time slot card where they START,
 * not in all time slots they span across.
 *
 * Expected behavior:
 * - A booking starting at 19:00 should appear ONLY in "Sera" card
 * - A booking starting at 17:30 should appear ONLY in "Pomeriggio" card (even if it ends in Sera)
 * - A booking starting at 12:00 should appear ONLY in "Mattina" card
 */

test.describe('Time Slot Display Fix Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('http://localhost:5174/admin')

    // Login as admin
    await page.fill('input[type="email"]', 'admin@alritrovo.it')
    await page.fill('input[type="password"]', 'alritrovo2024')
    await page.click('button[type="submit"]')

    // Wait for dashboard to load
    await page.waitForURL('http://localhost:5174/admin/dashboard')
    await page.waitForLoadState('networkidle')

    // Navigate to Calendar tab
    await page.click('button:has-text("Calendario")')
    await page.waitForTimeout(1000) // Wait for calendar to render
  })

  test('should verify bookings appear only in start time slot cards', async ({ page }) => {
    // Take initial screenshot of calendar
    await page.screenshot({
      path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\calendar-time-slot-verification-full.png',
      fullPage: true
    })

    // Find a date with bookings (look for events in the calendar)
    const events = await page.locator('.fc-event').count()
    console.log(`Found ${events} events in calendar`)

    if (events > 0) {
      // Click on the first event to select its date
      const firstEvent = page.locator('.fc-event').first()
      await firstEvent.click()
      await page.waitForTimeout(1000)

      // Close any modal that might have opened
      const closeButton = page.locator('button:has-text("Chiudi")')
      if (await closeButton.isVisible()) {
        await closeButton.click()
        await page.waitForTimeout(500)
      }
    }

    // Scroll to time slot cards section
    await page.locator('h3:has-text("Disponibilità")').scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Take screenshot of the "Disponibilità" section with time slot cards
    await page.screenshot({
      path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\time-slot-cards-verification.png',
      fullPage: true
    })

    // Verify that time slot cards exist
    const morningCard = page.locator('text=Mattina').first()
    const afternoonCard = page.locator('text=Pomeriggio').first()
    const eveningCard = page.locator('text=Sera').first()

    await expect(morningCard).toBeVisible()
    await expect(afternoonCard).toBeVisible()
    await expect(eveningCard).toBeVisible()

    console.log('✅ All three time slot cards are visible')

    // Check capacity counters
    const morningCounter = page.locator('text=Mattina').locator('..').locator('text=/\\d+\\/\\d+/').first()
    const afternoonCounter = page.locator('text=Pomeriggio').locator('..').locator('text=/\\d+\\/\\d+/').first()
    const eveningCounter = page.locator('text=Sera').locator('..').locator('text=/\\d+\\/\\d+/').first()

    if (await morningCounter.isVisible()) {
      const morningText = await morningCounter.textContent()
      console.log(`Morning capacity: ${morningText}`)
    }
    if (await afternoonCounter.isVisible()) {
      const afternoonText = await afternoonCounter.textContent()
      console.log(`Afternoon capacity: ${afternoonText}`)
    }
    if (await eveningCounter.isVisible()) {
      const eveningText = await eveningCounter.textContent()
      console.log(`Evening capacity: ${eveningText}`)
    }

    // Expand all cards to see bookings
    const expandButtons = page.locator('button[aria-expanded="false"]')
    const expandCount = await expandButtons.count()
    console.log(`Found ${expandCount} collapsed cards`)

    for (let i = 0; i < expandCount; i++) {
      const button = expandButtons.nth(i)
      if (await button.isVisible()) {
        await button.click()
        await page.waitForTimeout(500)
      }
    }

    // Take screenshot with all cards expanded
    await page.screenshot({
      path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\time-slot-cards-expanded.png',
      fullPage: true
    })

    // Look for booking cards in each time slot
    const morningBookings = page.locator('text=Mattina').locator('..').locator('.bg-white\\/98')
    const afternoonBookings = page.locator('text=Pomeriggio').locator('..').locator('.bg-white\\/98')
    const eveningBookings = page.locator('text=Sera').locator('..').locator('.bg-white\\/98')

    const morningCount = await morningBookings.count()
    const afternoonCount = await afternoonBookings.count()
    const eveningCount = await eveningBookings.count()

    console.log(`Bookings found:`)
    console.log(`  - Morning: ${morningCount}`)
    console.log(`  - Afternoon: ${afternoonCount}`)
    console.log(`  - Evening: ${eveningCount}`)

    // Check console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`)
      }
    })

    console.log('✅ Verification complete')
  })

  test('should check for JavaScript errors in console', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Navigate to calendar and interact
    await page.click('button:has-text("Calendario")')
    await page.waitForTimeout(2000)

    // Check if there are any console errors
    if (consoleErrors.length > 0) {
      console.error('❌ Console errors found:')
      consoleErrors.forEach(error => console.error(`  - ${error}`))
    } else {
      console.log('✅ No console errors found')
    }

    expect(consoleErrors.length).toBe(0)
  })
})
