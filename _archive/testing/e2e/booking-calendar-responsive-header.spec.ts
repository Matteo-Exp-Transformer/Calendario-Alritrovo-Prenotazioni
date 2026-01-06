import { test, expect } from '@playwright/test'

/**
 * E2E Tests for BookingCalendar Responsive Header Redesign
 *
 * Tests the responsive header with:
 * - Mobile: Dropdown for view selection
 * - Desktop: Inline buttons for view selection
 * - Proper layout on different viewports
 * - View state changes correctly update calendar
 */

test.describe('BookingCalendar Responsive Header', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for navigation to admin dashboard
    await page.waitForURL('/admin/dashboard')

    // Navigate to Calendar tab
    await page.click('button:has-text("Calendario")')

    // Wait for calendar to load
    await page.waitForSelector('.fc-daygrid-body', { timeout: 10000 })
  })

  test('Mobile: Header displays dropdown for view selection', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check header layout on mobile
    const header = page.locator('text=Calendario Prenotazioni').locator('..')
    await expect(header).toBeVisible()

    // Dropdown should be visible on mobile
    const dropdown = page.locator('button[role="combobox"]')
    await expect(dropdown).toBeVisible()

    // Desktop buttons should be hidden on mobile
    const desktopButtons = page.locator('button:has-text("Mese")').nth(0)
    await expect(desktopButtons).toBeHidden()

    // Badge should be visible
    const badge = page.locator('text=/\\d+ prenotazioni/')
    await expect(badge).toBeVisible()
  })

  test('Desktop: Header displays inline buttons for view selection', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Check header layout on desktop
    const header = page.locator('text=Calendario Prenotazioni').locator('..')
    await expect(header).toBeVisible()

    // Desktop buttons should be visible
    const meseButton = page.locator('button:has-text("Mese")').first()
    const settimanaButton = page.locator('button:has-text("Settimana")').first()
    const giornoButton = page.locator('button:has-text("Giorno")').first()
    const listaButton = page.locator('button:has-text("Lista")').first()

    await expect(meseButton).toBeVisible()
    await expect(settimanaButton).toBeVisible()
    await expect(giornoButton).toBeVisible()
    await expect(listaButton).toBeVisible()

    // Dropdown should be hidden on desktop
    const dropdown = page.locator('button[role="combobox"]')
    await expect(dropdown).toBeHidden()
  })

  test('Mobile: Dropdown changes calendar view correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Initial view should be month
    await expect(page.locator('.fc-dayGridMonth-view')).toBeVisible()

    // Open dropdown
    const dropdown = page.locator('button[role="combobox"]')
    await dropdown.click()

    // Select "Settimana" view
    await page.click('[role="option"]:has-text("Settimana")')

    // Calendar should change to week view
    await expect(page.locator('.fc-timeGridWeek-view')).toBeVisible()

    // Open dropdown again
    await dropdown.click()

    // Select "Giorno" view
    await page.click('[role="option"]:has-text("Giorno")')

    // Calendar should change to day view
    await expect(page.locator('.fc-timeGridDay-view')).toBeVisible()
  })

  test('Desktop: Buttons change calendar view correctly', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Initial view should be month
    await expect(page.locator('.fc-dayGridMonth-view')).toBeVisible()

    // Click "Settimana" button
    const settimanaButton = page.locator('button:has-text("Settimana")').first()
    await settimanaButton.click()

    // Calendar should change to week view
    await expect(page.locator('.fc-timeGridWeek-view')).toBeVisible()

    // Click "Giorno" button
    const giornoButton = page.locator('button:has-text("Giorno")').first()
    await giornoButton.click()

    // Calendar should change to day view
    await expect(page.locator('.fc-timeGridDay-view')).toBeVisible()

    // Click "Lista" button
    const listaButton = page.locator('button:has-text("Lista")').first()
    await listaButton.click()

    // Calendar should change to list view
    await expect(page.locator('.fc-listWeek-view')).toBeVisible()

    // Click "Mese" button to go back
    const meseButton = page.locator('button:has-text("Mese")').first()
    await meseButton.click()

    // Calendar should change back to month view
    await expect(page.locator('.fc-dayGridMonth-view')).toBeVisible()
  })

  test('Desktop: Active view button shows correct styling', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })

    // "Mese" button should be active by default
    const meseButton = page.locator('button:has-text("Mese")').first()
    await expect(meseButton).toHaveClass(/bg-warm-wood/)

    // Click "Settimana" button
    const settimanaButton = page.locator('button:has-text("Settimana")').first()
    await settimanaButton.click()

    // "Settimana" button should be active
    await expect(settimanaButton).toHaveClass(/bg-warm-wood/)

    // "Mese" button should not be active
    await expect(meseButton).not.toHaveClass(/bg-warm-wood/)
  })

  test('Mobile: No horizontal scroll at 375px viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check for horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)

    // Body width should not exceed viewport width
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth)
  })

  test('Tablet: Proper layout at 768px breakpoint', async ({ page }) => {
    // Set tablet viewport (768px is the breakpoint)
    await page.setViewportSize({ width: 768, height: 1024 })

    // Desktop buttons should be visible at 768px
    const meseButton = page.locator('button:has-text("Mese")').first()
    await expect(meseButton).toBeVisible()

    // Dropdown should be hidden at 768px
    const dropdown = page.locator('button[role="combobox"]')
    await expect(dropdown).toBeHidden()
  })

  test('View state resets on page reload (no persistence)', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Change to week view
    const settimanaButton = page.locator('button:has-text("Settimana")').first()
    await settimanaButton.click()
    await expect(page.locator('.fc-timeGridWeek-view')).toBeVisible()

    // Reload page
    await page.reload()

    // Wait for calendar to load
    await page.waitForSelector('.fc-daygrid-body', { timeout: 10000 })

    // View should reset to month (default)
    await expect(page.locator('.fc-dayGridMonth-view')).toBeVisible()
  })
})
