import { test, expect } from '@playwright/test'

/**
 * E2E Test: BookingDetailsModal Mobile Overflow Fix
 *
 * Verifies that the BookingDetailsModal does NOT require horizontal scroll on mobile
 * and all elements (close button, tabs, action buttons) are fully visible.
 */

test.describe('BookingDetailsModal - Mobile Overflow Fix', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('http://localhost:5175/admin')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should NOT require horizontal scroll on mobile (375px width)', async ({ page }) => {
    // Set viewport to mobile size (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 })

    // Wait for bookings to load
    await page.waitForSelector('[data-testid="booking-card"]', { timeout: 10000 })

    // Click on first booking card to open modal
    const firstCard = page.locator('[data-testid="booking-card"]').first()
    await firstCard.click()

    // Wait for modal to be visible
    await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })

    // Take screenshot for debugging
    await page.screenshot({ path: 'e2e/screenshots/mobile-modal-no-overflow-before.png', fullPage: true })

    // Verify body does not have horizontal scroll
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth)

    console.log(`Body scrollWidth: ${bodyScrollWidth}px, clientWidth: ${bodyClientWidth}px`)

    // scrollWidth should equal clientWidth (no overflow)
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 1) // Allow 1px tolerance

    // Verify modal is visible and within viewport
    const modal = page.locator('text=Dettagli Prenotazione').locator('..')
    await expect(modal).toBeVisible()

    // Take final screenshot
    await page.screenshot({ path: 'e2e/screenshots/mobile-modal-no-overflow-after.png', fullPage: true })
  })

  test('should show close button fully visible on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 })

    // Open modal
    await page.waitForSelector('[data-testid="booking-card"]', { timeout: 10000 })
    await page.locator('[data-testid="booking-card"]').first().click()
    await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })

    // Verify close button is visible without scrolling
    const closeButton = page.locator('button[aria-label="Chiudi"]')
    await expect(closeButton).toBeVisible()

    // Verify close button is within viewport (no horizontal scroll needed)
    const closeButtonBox = await closeButton.boundingBox()
    expect(closeButtonBox).not.toBeNull()
    if (closeButtonBox) {
      expect(closeButtonBox.x + closeButtonBox.width).toBeLessThanOrEqual(375)
      console.log(`Close button right edge: ${closeButtonBox.x + closeButtonBox.width}px (viewport: 375px)`)
    }

    // Screenshot
    await page.screenshot({ path: 'e2e/screenshots/mobile-close-button-visible.png' })
  })

  test('should show all action buttons (Modifica, Elimina) fully visible on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 })

    // Open modal
    await page.waitForSelector('[data-testid="booking-card"]', { timeout: 10000 })
    await page.locator('[data-testid="booking-card"]').first().click()
    await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })

    // Verify "Modifica" button is visible
    const modificaButton = page.locator('button:has-text("Modifica")')
    await expect(modificaButton).toBeVisible()

    // Verify "Elimina" button is visible
    const eliminaButton = page.locator('button:has-text("Elimina")')
    await expect(eliminaButton).toBeVisible()

    // Verify both buttons are within viewport (no horizontal scroll needed)
    const modificaBox = await modificaButton.boundingBox()
    const eliminaBox = await eliminaButton.boundingBox()

    expect(modificaBox).not.toBeNull()
    expect(eliminaBox).not.toBeNull()

    if (modificaBox && eliminaBox) {
      expect(modificaBox.x + modificaBox.width).toBeLessThanOrEqual(375)
      expect(eliminaBox.x + eliminaBox.width).toBeLessThanOrEqual(375)

      console.log(`Modifica button right edge: ${modificaBox.x + modificaBox.width}px`)
      console.log(`Elimina button right edge: ${eliminaBox.x + eliminaBox.width}px`)
      console.log(`Viewport width: 375px`)
    }

    // Screenshot
    await page.screenshot({ path: 'e2e/screenshots/mobile-action-buttons-visible.png' })
  })

  test('should show tab buttons fully visible on mobile (icon-only mode)', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 })

    // Open modal
    await page.waitForSelector('[data-testid="booking-card"]', { timeout: 10000 })
    await page.locator('[data-testid="booking-card"]').first().click()
    await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })

    // Verify at least one tab button is visible
    const tabButtons = page.locator('button').filter({ hasText: /📋|🍽️|⚠️/ })
    const tabCount = await tabButtons.count()

    expect(tabCount).toBeGreaterThan(0)
    console.log(`Found ${tabCount} tab button(s)`)

    // Verify all tab buttons are within viewport
    for (let i = 0; i < tabCount; i++) {
      const tabButton = tabButtons.nth(i)
      await expect(tabButton).toBeVisible()

      const tabBox = await tabButton.boundingBox()
      if (tabBox) {
        expect(tabBox.x + tabBox.width).toBeLessThanOrEqual(375)
        console.log(`Tab ${i + 1} right edge: ${tabBox.x + tabBox.width}px`)
      }
    }

    // Screenshot
    await page.screenshot({ path: 'e2e/screenshots/mobile-tab-buttons-visible.png' })
  })

  test('should NOT require horizontal scroll across different mobile sizes', async ({ page }) => {
    const mobileSizes = [
      { width: 320, height: 568, name: 'iPhone SE (small)' },
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 12 Pro' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' }
    ]

    for (const size of mobileSizes) {
      console.log(`Testing ${size.name} (${size.width}x${size.height})`)

      // Set viewport
      await page.setViewportSize({ width: size.width, height: size.height })

      // Navigate to admin dashboard
      await page.goto('http://localhost:5175/admin')
      await page.waitForLoadState('networkidle')

      // Open modal
      await page.waitForSelector('[data-testid="booking-card"]', { timeout: 10000 })
      await page.locator('[data-testid="booking-card"]').first().click()
      await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })

      // Verify no horizontal scroll
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
      const bodyClientWidth = await page.evaluate(() => document.body.clientWidth)

      console.log(`  ${size.name}: scrollWidth=${bodyScrollWidth}px, clientWidth=${bodyClientWidth}px`)
      expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 1)

      // Take screenshot
      await page.screenshot({
        path: `e2e/screenshots/mobile-${size.width}x${size.height}-no-overflow.png`,
        fullPage: false
      })

      // Close modal for next iteration
      const closeButton = page.locator('button[aria-label="Chiudi"]')
      await closeButton.click()
      await page.waitForTimeout(500)
    }
  })
})
