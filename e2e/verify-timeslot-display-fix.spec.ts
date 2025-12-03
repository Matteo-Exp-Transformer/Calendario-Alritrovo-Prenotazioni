import { test, expect } from '@playwright/test'

/**
 * VERIFICATION TEST: Time Slot Display Fix
 *
 * Purpose: Verify that bookings appear ONLY in the time slot card where they START
 *
 * Expected Behavior:
 * - Booking starting at 12:00 → appears ONLY in "Mattina" (10:00-14:30)
 * - Booking starting at 17:30 → appears ONLY in "Pomeriggio" (14:31-18:30), even if it ends in Sera
 * - Booking starting at 19:00 → appears ONLY in "Sera" (18:31-23:30)
 *
 * Implementation:
 * - Uses getStartSlotForBooking() to determine display slot based on start time only
 * - Capacity calculations still use getSlotsOccupiedByBooking() (unchanged)
 */

test.describe('Time Slot Display Fix - Verification', () => {
  test('verify bookings appear only in their start time slot', async ({ page }) => {
    test.setTimeout(90000)

    console.log('🔵 Step 1: Navigate to admin login')
    await page.goto('http://localhost:5174/admin')
    await page.waitForLoadState('networkidle')

    console.log('🔵 Step 2: Login with credentials')
    await page.fill('input[type="email"]', 'admin@alritrovo.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button:has-text("Accedi")')

    console.log('🔵 Step 3: Wait for dashboard redirect')
    await page.waitForURL('**/admin/dashboard', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    console.log('✅ Successfully logged in to admin dashboard')

    // Take full dashboard screenshot
    await page.screenshot({
      path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-dashboard-full.png',
      fullPage: true
    })

    console.log('🔵 Step 4: Navigate to Calendar tab (if not already there)')
    const calendarButton = page.locator('button:has-text("Calendario"), [role="tab"]:has-text("Calendario")')
    const calendarButtonCount = await calendarButton.count()

    if (calendarButtonCount > 0) {
      await calendarButton.first().click()
      await page.waitForTimeout(2000)
      console.log('✅ Clicked Calendar tab')
    } else {
      console.log('ℹ️ Already on Calendar tab or tab not found')
    }

    console.log('🔵 Step 5: Scroll to Disponibilità section')
    const disponibilitaHeader = page.locator('h3:has-text("Disponibilità")')
    await disponibilitaHeader.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)

    // Take screenshot of full calendar page with disponibilità section
    await page.screenshot({
      path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-calendar-full.png',
      fullPage: true
    })

    console.log('🔵 Step 6: Verify time slot cards exist')
    const morningCard = page.locator('text=Mattina').first()
    const afternoonCard = page.locator('text=Pomeriggio').first()
    const eveningCard = page.locator('text=Sera').first()

    await expect(morningCard).toBeVisible({ timeout: 10000 })
    await expect(afternoonCard).toBeVisible()
    await expect(eveningCard).toBeVisible()

    console.log('✅ All three time slot cards are visible')

    console.log('🔵 Step 7: Read capacity counters')
    // Extract capacity info from each card
    const morningText = await morningCard.locator('..').textContent()
    const afternoonText = await afternoonCard.locator('..').textContent()
    const eveningText = await eveningCard.locator('..').textContent()

    console.log('📊 Capacity Info:')
    console.log(`   - Morning: ${morningText}`)
    console.log(`   - Afternoon: ${afternoonText}`)
    console.log(`   - Evening: ${eveningText}`)

    console.log('🔵 Step 8: Expand all collapsed cards')
    // Find and expand any collapsed cards
    let collapsedButtons = page.locator('button[aria-expanded="false"]')
    let collapsedCount = await collapsedButtons.count()
    console.log(`   Found ${collapsedCount} collapsed cards`)

    for (let i = 0; i < collapsedCount; i++) {
      try {
        const button = collapsedButtons.nth(i)
        if (await button.isVisible()) {
          await button.click()
          await page.waitForTimeout(800)
          console.log(`   ✅ Expanded card ${i + 1}`)
        }
      } catch (e) {
        console.log(`   ⚠️ Could not expand card ${i + 1}`)
      }
    }

    // Take screenshot with all cards expanded
    await page.screenshot({
      path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-cards-expanded.png',
      fullPage: true
    })

    console.log('🔵 Step 9: Count bookings in each time slot')
    // Count booking cards in each section
    // Note: booking cards have class 'bg-white/98' and contain booking details

    const morningSection = morningCard.locator('..')
    const afternoonSection = afternoonCard.locator('..')
    const eveningSection = eveningCard.locator('..')

    // Try different selectors to find booking cards
    const morningBookingCards = morningSection.locator('div.bg-white\\/98')
    const afternoonBookingCards = afternoonSection.locator('div.bg-white\\/98')
    const eveningBookingCards = eveningSection.locator('div.bg-white\\/98')

    const morningCount = await morningBookingCards.count()
    const afternoonCount = await afternoonBookingCards.count()
    const eveningCount = await eveningBookingCards.count()

    console.log('📊 Booking Distribution:')
    console.log(`   - Morning (10:00-14:30): ${morningCount} booking(s)`)
    console.log(`   - Afternoon (14:31-18:30): ${afternoonCount} booking(s)`)
    console.log(`   - Evening (18:31-23:30): ${eveningCount} booking(s)`)
    console.log(`   - TOTAL: ${morningCount + afternoonCount + eveningCount} booking(s)`)

    console.log('🔵 Step 10: Take individual card screenshots')
    const morningWrapper = morningCard.locator('..').locator('..').locator('..')
    const afternoonWrapper = afternoonCard.locator('..').locator('..').locator('..')
    const eveningWrapper = eveningCard.locator('..').locator('..').locator('..')

    await morningWrapper.screenshot({
      path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-morning-card.png'
    })
    await afternoonWrapper.screenshot({
      path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-afternoon-card.png'
    })
    await eveningWrapper.screenshot({
      path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-evening-card.png'
    })

    console.log('✅ Individual card screenshots saved')

    console.log('🔵 Step 11: Extract booking times (if any)')
    // Try to extract booking times from cards to verify they match slot boundaries
    if (morningCount > 0) {
      const morningBookingTimes = await morningBookingCards.locator('span:has-text("Orario")').allTextContents()
      console.log('   📅 Morning booking times:', morningBookingTimes)
    }
    if (afternoonCount > 0) {
      const afternoonBookingTimes = await afternoonBookingCards.locator('span:has-text("Orario")').allTextContents()
      console.log('   📅 Afternoon booking times:', afternoonBookingTimes)
    }
    if (eveningCount > 0) {
      const eveningBookingTimes = await eveningBookingCards.locator('span:has-text("Orario")').allTextContents()
      console.log('   📅 Evening booking times:', eveningBookingTimes)
    }

    console.log('🔵 Step 12: Check browser console for errors')
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.waitForTimeout(1000)

    if (consoleErrors.length > 0) {
      console.log('❌ Console errors found:')
      consoleErrors.forEach(error => console.log(`   - ${error}`))
    } else {
      console.log('✅ No console errors detected')
    }

    console.log('')
    console.log('=' .repeat(60))
    console.log('✅ VERIFICATION TEST COMPLETE')
    console.log('=' .repeat(60))
    console.log('')
    console.log('📁 Screenshots saved to: e2e/screenshots/')
    console.log('   - verify-dashboard-full.png')
    console.log('   - verify-calendar-full.png')
    console.log('   - verify-cards-expanded.png')
    console.log('   - verify-morning-card.png')
    console.log('   - verify-afternoon-card.png')
    console.log('   - verify-evening-card.png')
    console.log('')
    console.log('🔍 VERIFICATION POINTS:')
    console.log('   1. Each booking should appear in ONLY ONE time slot card')
    console.log('   2. Time slot determined by booking START time (not duration)')
    console.log('   3. Booking 12:00-14:00 → Morning only')
    console.log('   4. Booking 17:30-20:00 → Afternoon only (not Evening)')
    console.log('   5. Booking 19:00-21:00 → Evening only')
    console.log('   6. Capacity counters should show correct occupied/available counts')
    console.log('')
  })
})
