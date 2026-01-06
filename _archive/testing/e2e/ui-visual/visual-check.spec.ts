import { test, expect } from '@playwright/test'

test.describe('Visual Design Check - Admin Dashboard', () => {
  test('Check if dashboard loads and verify rounded styles', async ({ page }) => {
    // Go directly to admin dashboard (assuming login redirect or public access)
    await page.goto('http://localhost:5177/admin/dashboard')

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Take full screenshot
    await page.screenshot({ path: 'screenshots/dashboard-full.png', fullPage: true })

    // Check for rounded-2xl elements
    const rounded = page.locator('.rounded-2xl')
    const count = await rounded.count()
    console.log(`✅ Found ${count} elements with rounded-2xl class`)

    // Check navigation buttons specifically
    const navButtons = page.locator('nav button')
    const navCount = await navButtons.count()
    console.log(`✅ Found ${navCount} navigation buttons`)

    if (navCount > 0) {
      const firstNav = navButtons.first()
      const box = await firstNav.boundingBox()
      if (box) {
        console.log(`📏 First nav button: ${box.width}px wide x ${box.height}px tall`)
      }

      // Check classes
      const classes = await firstNav.getAttribute('class')
      console.log(`🎨 Nav button classes: ${classes}`)
    }

    // Check stats cards in header
    const statsCards = page.locator('div.shadow-md.rounded-2xl').filter({ hasText: /Settimana|Oggi|Mese|Rifiutate/ })
    const statsCount = await statsCards.count()
    console.log(`📊 Found ${statsCount} stats cards`)

    // Log all elements with border class
    const bordered = page.locator('.border')
    const borderCount = await bordered.count()
    console.log(`🔲 Found ${borderCount} elements with border class`)
  })
})

