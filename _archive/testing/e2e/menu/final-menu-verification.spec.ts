import { test, expect } from '@playwright/test'

test('Final Menu Verification - User Report Resolution', async ({ page }) => {
  console.log('🎯 Final verification of menu fix for user report')

  // Navigate to prenota page
  await page.goto('http://localhost:5174/prenota')
  await page.waitForLoadState('networkidle')

  // Fill required fields
  await page.fill('input[id="client_name"]', 'Test Menu Verification')
  await page.fill('input[id="client_phone"]', '351 123 4567')

  // Select Rinfresco di Laurea
  await page.locator('input[type="radio"][value="rinfresco_laurea"]').check({ force: true })
  await page.waitForTimeout(2000)

  // Verify all menu categories are visible
  await expect(page.locator('h3:has-text("Bevande")')).toBeVisible()
  await expect(page.locator('h3:has-text("Antipasti")')).toBeVisible()
  await expect(page.locator('h3:has-text("Fritti")')).toBeVisible()
  await expect(page.locator('h3:has-text("Primi Piatti")')).toBeVisible()
  await expect(page.locator('h3:has-text("Secondi Piatti")')).toBeVisible()

  // Verify no error message
  const errorCount = await page.locator('text="Errore nel caricamento del menu"').count()
  expect(errorCount).toBe(0)

  // Take final screenshot
  await page.screenshot({
    path: 'e2e/screenshots/FINAL-MENU-WORKING.png',
    fullPage: true
  })

  console.log('✅ Menu is fully functional - all categories visible')
  console.log('📸 Screenshot saved: FINAL-MENU-WORKING.png')
})

