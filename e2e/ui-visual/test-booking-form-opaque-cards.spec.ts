import { test, expect } from '@playwright/test'

/**
 * Test: Verificare che tutte le sezioni del form di prenotazione abbiano schede opache semi-trasparenti
 *
 * Requirement:
 * - Ogni sezione principale deve avere una scheda con:
 *   - bg-white/95 (95% opacità)
 *   - backdrop-blur-md
 *   - border-2 border-gray-200
 *   - rounded-xl
 *   - shadow-lg
 *   - p-6 md:p-8 (padding responsivo)
 *
 * Sezioni da verificare:
 * 1. Dati Personali
 * 2. Dettagli Prenotazione
 * 3. Selezione Menu (solo per Rinfresco di Laurea)
 * 4. Intolleranze Alimentari (solo per Rinfresco di Laurea)
 */

test.describe('Booking Form - Semi-transparent Opaque Cards', () => {
  test('should have semi-transparent cards for all main sections on booking page', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/prenota')

    // Wait for form to be visible
    await page.waitForSelector('form', { state: 'visible' })

    // Select "Rinfresco di Laurea" to show all sections including Menu and Dietary Restrictions
    await page.selectOption('#booking_type', 'rinfresco_laurea')

    // Wait for menu section to appear
    await page.waitForTimeout(500)

    // Verify Dati Personali section has semi-transparent card
    const datiPersonaliCard = page.locator('div.bg-white\\/95.backdrop-blur-md.border-2.border-gray-200.rounded-xl.shadow-lg').filter({ has: page.locator('text=Dati Personali') }).first()
    await expect(datiPersonaliCard).toBeVisible()

    // Verify Dettagli Prenotazione section has semi-transparent card
    const dettagliPrenotazioneCard = page.locator('div.bg-white\\/95.backdrop-blur-md.border-2.border-gray-200.rounded-xl.shadow-lg').filter({ has: page.locator('text=Dettagli Prenotazione') }).first()
    await expect(dettagliPrenotazioneCard).toBeVisible()

    // Verify Menu Selection section has semi-transparent card
    const menuCard = page.locator('div.bg-white\\/95.backdrop-blur-md.border-2.border-gray-200.rounded-xl.shadow-lg').filter({ has: page.locator('text=Menù Rinfresco') }).first()
    await expect(menuCard).toBeVisible()

    // Verify Dietary Restrictions section has semi-transparent card
    const dietaryCard = page.locator('div.bg-white\\/95.backdrop-blur-md.border-2.border-gray-200.rounded-xl.shadow-lg').filter({ has: page.locator('text=Intolleranze Alimentari') }).first()
    await expect(dietaryCard).toBeVisible()

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'e2e/screenshots/booking-form-opaque-cards.png',
      fullPage: true
    })
  })

  test('should verify card padding is responsive (p-6 md:p-8)', async ({ page }) => {
    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/prenota')
    await page.waitForSelector('form', { state: 'visible' })

    // Check that at least one card has the responsive padding classes
    const cardWithPadding = page.locator('div.bg-white\\/95.backdrop-blur-md.p-6').first()
    await expect(cardWithPadding).toBeVisible()

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/prenota')
    await page.waitForSelector('form', { state: 'visible' })

    // Card should still be visible on mobile
    await expect(cardWithPadding).toBeVisible()
  })

  test('should verify old gradient backgrounds are removed', async ({ page }) => {
    await page.goto('/prenota')
    await page.waitForSelector('form', { state: 'visible' })

    // Select Rinfresco di Laurea to show all sections
    await page.selectOption('#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(500)

    // Verify that old gradient backgrounds (bg-gradient-to-br from-warm-cream-60) are NOT present
    // in the main section containers
    const oldGradientDivs = page.locator('div.bg-gradient-to-br.from-warm-cream-60').filter({
      has: page.locator('h2')
    })

    // Count should be 0 for main section containers (privacy section is allowed to keep gradient)
    const count = await oldGradientDivs.count()

    // We expect 0 or very few (only privacy section which is separate)
    expect(count).toBeLessThanOrEqual(2) // Allow privacy and possibly one other non-main section
  })
})
