import { test, expect } from '@playwright/test'

test.describe('Final Visual Verification - Admin Dashboard (Simple)', () => {
  const baseUrl = 'http://localhost:5175'
  const screenshotDir = 'e2e/screenshots/final-verification'

  async function loginToAdmin(page: any) {
    // Navigate to login page
    await page.goto(`${baseUrl}/login`)
    await page.waitForLoadState('networkidle')

    // Fill login form
    await page.fill('#email', '0cavuz0@gmail.com')
    await page.fill('#password', 'Cavallaro')

    // Submit login
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i })
    await submitButton.click()

    // Wait for navigation to admin
    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle', { timeout: 5000 })
  }

  test('01 - Admin header screenshot', async ({ page }) => {
    await loginToAdmin(page)
    await page.screenshot({ path: `${screenshotDir}/01-admin-header.png`, fullPage: false })
  })

  test('02 - Navigation tabs screenshot', async ({ page }) => {
    await loginToAdmin(page)
    await page.screenshot({ path: `${screenshotDir}/02-navigation-tabs.png`, fullPage: false })
  })

  test('03 - Time slots collapsed screenshot', async ({ page }) => {
    await loginToAdmin(page)

    // Scroll down to see time slots
    await page.evaluate(() => {
      const main = document.querySelector('main')
      if (main) {
        main.scrollTop = main.scrollHeight
      }
    })

    await page.waitForTimeout(1000)
    await page.screenshot({ path: `${screenshotDir}/03-time-slots-collapsed.png`, fullPage: false })
  })

  test('04 - Time slots expanded screenshot', async ({ page }) => {
    await loginToAdmin(page)

    // Scroll down to see time slots
    await page.evaluate(() => {
      const main = document.querySelector('main')
      if (main) {
        main.scrollTop = main.scrollHeight
      }
    })

    await page.waitForTimeout(500)

    // Try to find and click collapsible headers
    const headers = page.locator('button').filter({ hasText: /Mattina|Pomeriggio|Sera/ })
    const count = await headers.count()

    // Expand first few if they exist
    for (let i = 0; i < Math.min(count, 3); i++) {
      try {
        const header = headers.nth(i)
        await header.click()
        await page.waitForTimeout(200)
      } catch (e) {
        // Skip if can't click
      }
    }

    await page.screenshot({ path: `${screenshotDir}/04-time-slots-expanded.png`, fullPage: false })
  })

  test('05 - Calendar view screenshot', async ({ page }) => {
    await loginToAdmin(page)

    // Scroll to top to see calendar
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)

    await page.screenshot({ path: `${screenshotDir}/05-calendar-view.png`, fullPage: true })
  })

  test('06 - Mobile view 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 })
    await loginToAdmin(page)
    await page.screenshot({ path: `${screenshotDir}/06-mobile-view-320px.png`, fullPage: true })
  })

  test('07 - Tablet view 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await loginToAdmin(page)
    await page.screenshot({ path: `${screenshotDir}/07-mobile-view-768px.png`, fullPage: true })
  })
})
