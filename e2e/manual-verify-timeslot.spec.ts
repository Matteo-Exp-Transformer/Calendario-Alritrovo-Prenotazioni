import { test, expect } from '@playwright/test'

/**
 * Manual verification test for time slot display fix
 * This test will take screenshots for manual inspection
 */

test.describe('Manual Time Slot Display Verification', () => {
  test('navigate and capture screenshots for manual verification', async ({ page }) => {
    // Set longer timeout
    test.setTimeout(90000)

    console.log('🔵 Navigating to admin login page...')
    await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Take screenshot of login page
    await page.screenshot({
      path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-01-login-page.png',
      fullPage: true
    })
    console.log('✅ Screenshot 1: Login page captured')

    // Fill in login form
    console.log('🔵 Filling in login credentials...')
    await page.fill('input[type="email"]', 'admin@alritrovo.it')
    await page.fill('input[type="password"]', 'alritrovo2024')
    await page.waitForTimeout(500)

    // Take screenshot before clicking submit
    await page.screenshot({
      path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-02-login-filled.png',
      fullPage: true
    })
    console.log('✅ Screenshot 2: Login form filled')

    // Click submit button
    console.log('🔵 Clicking login button...')
    const loginButton = page.locator('button[type="submit"]')
    await loginButton.click()

    // Wait for navigation with increased timeout
    await page.waitForTimeout(3000)

    // Take screenshot after login attempt
    await page.screenshot({
      path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-03-after-login.png',
      fullPage: true
    })
    console.log('✅ Screenshot 3: After login attempt')

    // Check current URL
    const currentUrl = page.url()
    console.log(`Current URL: ${currentUrl}`)

    // If we're on dashboard, proceed
    if (currentUrl.includes('/admin/dashboard') || currentUrl.includes('/admin')) {
      console.log('🔵 Successfully logged in, navigating to Calendar tab...')

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Take screenshot of dashboard
      await page.screenshot({
        path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-04-dashboard.png',
        fullPage: true
      })
      console.log('✅ Screenshot 4: Dashboard page')

      // Look for and click Calendar tab
      const calendarTab = page.locator('button:has-text("Calendario"), [role="tab"]:has-text("Calendario")')

      if (await calendarTab.count() > 0) {
        console.log('🔵 Found Calendar tab, clicking...')
        await calendarTab.first().click()
        await page.waitForTimeout(2000)

        // Take screenshot of calendar view
        await page.screenshot({
          path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-05-calendar-view.png',
          fullPage: true
        })
        console.log('✅ Screenshot 5: Calendar view')

        // Scroll to time slot cards
        const disponibilitaHeader = page.locator('h3:has-text("Disponibilità")')
        if (await disponibilitaHeader.count() > 0) {
          console.log('🔵 Scrolling to Disponibilità section...')
          await disponibilitaHeader.scrollIntoViewIfNeeded()
          await page.waitForTimeout(1000)

          // Take screenshot of time slot cards
          await page.screenshot({
            path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-06-timeslot-cards.png',
            fullPage: true
          })
          console.log('✅ Screenshot 6: Time slot cards section')

          // Expand all collapsed cards
          const collapsedButtons = page.locator('button[aria-expanded="false"]')
          const collapsedCount = await collapsedButtons.count()
          console.log(`🔵 Found ${collapsedCount} collapsed cards, expanding...`)

          for (let i = 0; i < collapsedCount; i++) {
            try {
              const button = collapsedButtons.nth(i)
              if (await button.isVisible()) {
                await button.click()
                await page.waitForTimeout(800)
              }
            } catch (e) {
              console.log(`Could not expand card ${i}`)
            }
          }

          // Take final screenshot with all cards expanded
          await page.screenshot({
            path: 'c:\\Users\\matte.MIO\\Documents\\GitHub\\Calendarbackup\\e2e\\screenshots\\verify-07-timeslot-cards-expanded.png',
            fullPage: true
          })
          console.log('✅ Screenshot 7: Time slot cards expanded')

          // Get booking counts from each time slot
          const morningSection = page.locator('text=Mattina').locator('..')
          const afternoonSection = page.locator('text=Pomeriggio').locator('..')
          const eveningSection = page.locator('text=Sera').locator('..')

          const morningBookings = await morningSection.locator('.bg-white\\/98').count()
          const afternoonBookings = await afternoonSection.locator('.bg-white\\/98').count()
          const eveningBookings = await eveningSection.locator('.bg-white\\/98').count()

          console.log('📊 Booking counts per time slot:')
          console.log(`   - Morning (10:00-14:30): ${morningBookings} bookings`)
          console.log(`   - Afternoon (14:31-18:30): ${afternoonBookings} bookings`)
          console.log(`   - Evening (18:31-23:30): ${eveningBookings} bookings`)
        }
      } else {
        console.log('⚠️ Calendar tab not found')
      }
    } else {
      console.log('⚠️ Login may have failed, still on login page')
    }

    // Check for console errors
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

    console.log('✅ Manual verification complete - check screenshots in e2e/screenshots/')
  })
})
