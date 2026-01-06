import { test, expect } from '@playwright/test'

test.describe('Quick Mobile Check', () => {
  test.use({
    viewport: { width: 375, height: 667 },
  })

  test('Check mobile dashboard layout', async ({ page }) => {
    console.log('📱 Testing mobile layout on 375x667')

    await page.goto('http://localhost:5179/login')
    await page.fill('input[type="email"]', '0cavuz0@gmail.com')
    await page.fill('input[type="password"]', 'Cavallaro')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/admin', { timeout: 10000 })
    await page.waitForTimeout(2000)

    // Take screenshot
    await page.screenshot({ path: 'screenshots/mobile-dashboard-updated.png', fullPage: true })
    console.log('✅ Screenshot saved: mobile-dashboard-updated.png')

    // Check CollapsibleCards borders
    const collapsibleCards = page.locator('[role="region"]')
    const cardsCount = await collapsibleCards.count()
    console.log(`   Found ${cardsCount} CollapsibleCard regions`)

    // Check stats cards
    const statsCards = page.locator('div.bg-white.rounded-modern.border-2').filter({ hasText: /Settimana|Oggi|Mese|Rifiutate/ })
    const statsCount = await statsCards.count()
    console.log(`   Found ${statsCount} stats cards`)

    // Check first stats card size
    if (statsCount > 0) {
      const firstCard = statsCards.first()
      const box = await firstCard.boundingBox()
      if (box) {
        console.log(`   First stats card size: ${Math.round(box.width)}px × ${Math.round(box.height)}px`)
      }
    }

    // Check logout button
    const logoutBtn = page.locator('button:has-text("Logout")')
    const logoutBox = await logoutBtn.boundingBox()
    if (logoutBox) {
      console.log(`   Logout button: ${Math.round(logoutBox.width)}px × ${Math.round(logoutBox.height)}px at x=${Math.round(logoutBox.x)}`)
    }

    console.log('\n✅ Test completed - check screenshot for visual verification')
  })
})

