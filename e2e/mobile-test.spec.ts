import { test, expect } from '@playwright/test'

test.describe('Mobile Responsiveness Tests', () => {
  // Configure mobile viewport
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE dimensions
  })

  test('Login and navigate admin dashboard on mobile', async ({ page }) => {
    console.log('📱 Testing on mobile viewport: 375x667')

    // Step 1: Login
    console.log('\n🔐 Step 1: Logging in...')
    await page.goto('http://localhost:5179/login')
    await page.waitForLoadState('networkidle')

    // Fill login form
    await page.fill('input[type="email"]', '0cavuz0@gmail.com')
    await page.fill('input[type="password"]', 'Cavallaro')

    // Take screenshot of login page
    await page.screenshot({ path: 'screenshots/mobile-login.png', fullPage: true })
    console.log('✅ Login page screenshot saved')

    await page.click('button[type="submit"]')

    // Wait for redirect to /admin
    await page.waitForURL('**/admin', { timeout: 10000 })
    await page.waitForTimeout(2000)

    console.log('✅ Login successful')

    // Step 2: Check dashboard on mobile
    console.log('\n📊 Step 2: Checking dashboard...')
    await page.screenshot({ path: 'screenshots/mobile-dashboard.png', fullPage: true })

    // Check if stats cards are visible
    const statsCards = page.locator('div.bg-white.rounded-modern.border-2')
    const statsCount = await statsCards.count()
    console.log(`   Found ${statsCount} rounded-modern elements`)

    // Step 3: Test navigation buttons
    console.log('\n🧭 Step 3: Testing navigation buttons...')
    const navButtons = page.locator('nav button')
    const navCount = await navButtons.count()
    console.log(`   Found ${navCount} navigation buttons`)

    // Try clicking each navigation button
    if (navCount > 0) {
      // Click Calendar tab
      await page.click('text=Calendario')
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'screenshots/mobile-calendar-tab.png', fullPage: true })
      console.log('   ✅ Calendar tab clicked')

      // Click Pending tab
      await page.click('text=Pendenti')
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'screenshots/mobile-pending-tab.png', fullPage: true })
      console.log('   ✅ Pending tab clicked')

      // Click Archive tab
      await page.click('text=Archivio')
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'screenshots/mobile-archive-tab.png', fullPage: true })
      console.log('   ✅ Archive tab clicked')
    }

    // Step 4: Test form filling (new booking)
    console.log('\n📝 Step 4: Testing new booking form...')

    // Go back to main tab
    await page.click('nav button:first-child')
    await page.waitForTimeout(500)

    // Try to expand new booking form (if it exists)
    const newBookingHeader = page.locator('text=Inserisci Nuova Prenotazione')
    if (await newBookingHeader.count() > 0) {
      await newBookingHeader.click()
      await page.waitForTimeout(500)
      await page.screenshot({ path: 'screenshots/mobile-new-booking-form.png', fullPage: true })
      console.log('   ✅ New booking form expanded')

      // Test form interactions
      const nameInput = page.locator('input[placeholder*="Nome"], input[name*="name"]').first()
      if (await nameInput.count() > 0) {
        await nameInput.click()
        await page.waitForTimeout(300)
        await page.screenshot({ path: 'screenshots/mobile-form-focused.png', fullPage: true })
        console.log('   ✅ Form input focused (keyboard should appear)')
      }
    }

    // Step 5: Test scrolling
    console.log('\n📜 Step 5: Testing scroll behavior...')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'screenshots/mobile-scrolled-bottom.png', fullPage: false })
    console.log('   ✅ Scrolled to bottom')

    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)

    // Step 6: Test user info and logout button
    console.log('\n👤 Step 6: Testing user info and logout...')
    const logoutBtn = page.locator('button:has-text("Logout")')
    const logoutVisible = await logoutBtn.isVisible()
    console.log(`   Logout button visible: ${logoutVisible}`)

    if (logoutVisible) {
      const logoutBox = await logoutBtn.boundingBox()
      if (logoutBox) {
        console.log(`   Logout button size: ${logoutBox.width}px × ${logoutBox.height}px`)
        console.log(`   Logout button position: x=${logoutBox.x}, y=${logoutBox.y}`)
      }
    }

    // Final summary
    console.log('\n✅ MOBILE TEST SUMMARY:')
    console.log(`   - Stats cards found: ${statsCount}`)
    console.log(`   - Navigation buttons: ${navCount}`)
    console.log(`   - All screenshots saved to screenshots/ directory`)
    console.log('   - Check screenshots for layout issues and clickability')
  })

  test('Test public booking page on mobile', async ({ page }) => {
    console.log('\n📱 Testing public booking page on mobile')

    await page.goto('http://localhost:5179/prenota')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Take screenshot
    await page.screenshot({ path: 'screenshots/mobile-public-booking.png', fullPage: true })
    console.log('✅ Public booking page screenshot saved')

    // Test form filling
    const nameInput = page.locator('input[placeholder*="Nome"]').first()
    if (await nameInput.count() > 0) {
      await nameInput.click()
      await page.waitForTimeout(300)
      console.log('✅ Name input focused')
    }

    // Check if calendar is visible
    const calendar = page.locator('.fc, [class*="calendar"]')
    const calendarVisible = await calendar.count() > 0
    console.log(`Calendar visible: ${calendarVisible}`)

    await page.screenshot({ path: 'screenshots/mobile-public-booking-focused.png', fullPage: true })
  })
})
