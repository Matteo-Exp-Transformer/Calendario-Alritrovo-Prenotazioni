import { test } from '@playwright/test'

/**
 * Final screenshot verification for semi-transparent opaque cards on booking page
 */

test('capture final screenshots of booking form with opaque cards', async ({ page }) => {
  // Desktop view
  await page.setViewportSize({ width: 1280, height: 1024 })
  await page.goto('/prenota')
  await page.waitForLoadState('networkidle')

  // Screenshot 1: Initial view with "Prenota un Tavolo"
  await page.screenshot({
    path: 'e2e/screenshots/opaque-cards-desktop-tavolo.png',
    fullPage: true
  })

  // Screenshot 2: Switch to "Rinfresco di Laurea" to show all sections
  await page.selectOption('#booking_type', 'rinfresco_laurea')
  await page.waitForTimeout(1000) // Wait for sections to appear

  await page.screenshot({
    path: 'e2e/screenshots/opaque-cards-desktop-rinfresco.png',
    fullPage: true
  })

  // Mobile view
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/prenota')
  await page.waitForLoadState('networkidle')

  // Screenshot 3: Mobile view - Tavolo
  await page.screenshot({
    path: 'e2e/screenshots/opaque-cards-mobile-tavolo.png',
    fullPage: true
  })

  // Screenshot 4: Mobile view - Rinfresco di Laurea
  await page.selectOption('#booking_type', 'rinfresco_laurea')
  await page.waitForTimeout(1000)

  await page.screenshot({
    path: 'e2e/screenshots/opaque-cards-mobile-rinfresco.png',
    fullPage: true
  })
})
