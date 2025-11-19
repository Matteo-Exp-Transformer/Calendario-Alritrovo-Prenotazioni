import { test, expect } from '@playwright/test'

/**
 * E2E Test: Verify NO Horizontal Scroll When Modal is Open
 *
 * This test verifies that when the BookingDetailsModal is open on mobile,
 * there is NO horizontal scroll visible or accessible to the user.
 */

test.describe('BookingDetailsModal - NO Horizontal Scroll', () => {
  test('should NOT show horizontal scrollbar when modal is open on mobile', async ({ page }) => {
    // Set viewport to mobile (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to admin dashboard
    await page.goto('http://localhost:5175/admin')
    await page.waitForLoadState('networkidle')

    // Take screenshot BEFORE opening modal
    await page.screenshot({
      path: 'e2e/screenshots/before-modal-open.png',
      fullPage: false
    })

    // Check scroll BEFORE modal opens
    const beforeScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const beforeClientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    console.log(`BEFORE MODAL: scrollWidth=${beforeScrollWidth}px, clientWidth=${beforeClientWidth}px`)

    // Open modal
    await page.waitForSelector('[data-testid="booking-card"]', { timeout: 10000 })
    const firstCard = page.locator('[data-testid="booking-card"]').first()
    await firstCard.click()

    // Wait for modal to appear
    await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })
    await page.waitForTimeout(500) // Let styles settle

    // Take screenshot AFTER opening modal
    await page.screenshot({
      path: 'e2e/screenshots/after-modal-open.png',
      fullPage: false
    })

    // Check scroll AFTER modal opens
    const afterScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const afterClientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    console.log(`AFTER MODAL: scrollWidth=${afterScrollWidth}px, clientWidth=${afterClientWidth}px`)

    // Critical test: scrollWidth should NOT exceed clientWidth
    // This is the definitive test for horizontal scroll
    expect(afterScrollWidth).toBeLessThanOrEqual(afterClientWidth + 1) // 1px tolerance

    // Verify body styles are applied
    const bodyStyles = await page.evaluate(() => ({
      overflow: document.body.style.overflow,
      overflowX: document.body.style.overflowX,
      position: document.body.style.position,
      width: document.body.style.width
    }))

    console.log('Body styles:', bodyStyles)

    expect(bodyStyles.overflow).toBe('hidden')
    expect(bodyStyles.overflowX).toBe('hidden')
    expect(bodyStyles.position).toBe('fixed')
    expect(bodyStyles.width).toBe('100%')

    // Verify html styles are applied
    const htmlStyles = await page.evaluate(() => ({
      overflow: document.documentElement.style.overflow,
      overflowX: document.documentElement.style.overflowX
    }))

    console.log('HTML styles:', htmlStyles)

    expect(htmlStyles.overflow).toBe('hidden')
    expect(htmlStyles.overflowX).toBe('hidden')

    // Final screenshot with modal open
    await page.screenshot({
      path: 'e2e/screenshots/modal-open-no-scroll.png',
      fullPage: false
    })

    // Additional verification: try to scroll horizontally (should not be possible)
    await page.evaluate(() => {
      window.scrollTo(100, 0) // Try to scroll right
    })

    await page.waitForTimeout(200)

    const scrollX = await page.evaluate(() => window.scrollX)
    console.log(`Scroll position after attempt: ${scrollX}px`)

    // scrollX should remain 0 (cannot scroll)
    expect(scrollX).toBe(0)
  })

  test('should restore scroll after closing modal', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:5175/admin')
    await page.waitForLoadState('networkidle')

    // Open modal
    await page.waitForSelector('[data-testid="booking-card"]', { timeout: 10000 })
    await page.locator('[data-testid="booking-card"]').first().click()
    await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })

    // Verify scroll is locked
    const bodyOverflowWhileOpen = await page.evaluate(() => document.body.style.overflow)
    expect(bodyOverflowWhileOpen).toBe('hidden')

    // Close modal
    const closeButton = page.locator('button[aria-label="Chiudi"]')
    await closeButton.click()
    await page.waitForTimeout(500)

    // Verify scroll is restored
    const bodyOverflowAfterClose = await page.evaluate(() => document.body.style.overflow)
    const bodyPositionAfterClose = await page.evaluate(() => document.body.style.position)

    console.log('After close - overflow:', bodyOverflowAfterClose, 'position:', bodyPositionAfterClose)

    // Should be restored to original values (empty string or auto)
    expect(bodyOverflowAfterClose).not.toBe('hidden')
    expect(bodyPositionAfterClose).not.toBe('fixed')

    await page.screenshot({ path: 'e2e/screenshots/after-modal-close.png' })
  })

  test('should prevent background scroll on different mobile sizes', async ({ page }) => {
    const sizes = [
      { width: 320, height: 568, name: 'Small mobile' },
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' }
    ]

    for (const size of sizes) {
      console.log(`\nTesting ${size.name} (${size.width}x${size.height})`)

      await page.setViewportSize({ width: size.width, height: size.height })
      await page.goto('http://localhost:5175/admin')
      await page.waitForLoadState('networkidle')

      // Open modal
      await page.waitForSelector('[data-testid="booking-card"]', { timeout: 10000 })
      await page.locator('[data-testid="booking-card"]').first().click()
      await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })

      // Check no horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

      console.log(`  scrollWidth=${scrollWidth}px, clientWidth=${clientWidth}px`)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)

      // Try to scroll
      await page.evaluate(() => window.scrollTo(50, 0))
      const scrollX = await page.evaluate(() => window.scrollX)
      expect(scrollX).toBe(0)

      // Close modal
      await page.locator('button[aria-label="Chiudi"]').click()
      await page.waitForTimeout(300)
    }
  })
})
