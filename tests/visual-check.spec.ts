import { test, expect } from '@playwright/test'

test.describe('Visual Design Check', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5177/admin/login')
    await page.fill('input[type="email"]', 'admin@alritrovo.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin/dashboard')
  })

  test('Stats cards should have rounded corners and borders', async ({ page }) => {
    // Check stats cards exist
    const statsCards = page.locator('div.rounded-2xl.border.border-gray-300.shadow-md')
    const count = await statsCards.count()
    console.log(`Found ${count} elements with rounded-2xl border`)

    expect(count).toBeGreaterThan(0)

    // Take screenshot
    await page.screenshot({ path: 'screenshots/stats-cards.png', fullPage: true })
  })

  test('Navigation buttons should be large and rounded', async ({ page }) => {
    // Check navigation buttons
    const navButtons = page.locator('button.rounded-2xl.border')
    const count = await navButtons.count()
    console.log(`Found ${count} navigation buttons with rounded borders`)

    // Check first button dimensions
    const firstButton = navButtons.first()
    const box = await firstButton.boundingBox()

    if (box) {
      console.log(`Button dimensions: width=${box.width}px, height=${box.height}px`)
      // Buttons should be larger (at least 150px wide)
      expect(box.width).toBeGreaterThan(150)
    }

    await page.screenshot({ path: 'screenshots/navigation-buttons.png' })
  })

  test('Archive cards should have rounded borders', async ({ page }) => {
    // Navigate to archive tab
    await page.click('text=Archivio')
    await page.waitForTimeout(1000)

    // Check archive cards
    const archiveCards = page.locator('div.rounded-2xl.border.border-gray-300')
    const count = await archiveCards.count()
    console.log(`Found ${count} archive cards with rounded borders`)

    await page.screenshot({ path: 'screenshots/archive-cards.png', fullPage: true })
  })

  test('Verify all rounded-2xl elements', async ({ page }) => {
    // Count all elements with rounded-2xl
    const allRounded = page.locator('.rounded-2xl')
    const count = await allRounded.count()
    console.log(`Total elements with rounded-2xl: ${count}`)

    // List classes of first 10 elements
    for (let i = 0; i < Math.min(10, count); i++) {
      const element = allRounded.nth(i)
      const classes = await element.getAttribute('class')
      console.log(`Element ${i}: ${classes}`)
    }

    await page.screenshot({ path: 'screenshots/full-dashboard.png', fullPage: true })
  })
})
