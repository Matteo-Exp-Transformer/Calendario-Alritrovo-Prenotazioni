import { test, expect } from '@playwright/test'

/**
 * Test per verificare la presenza della scheda opaca unificata
 * nei dettagli della prenotazione (BookingDetailsModal)
 *
 * RED PHASE: Questo test deve FALLIRE inizialmente perché
 * la scheda opaca unificata non esiste ancora nel componente.
 */

test.describe('BookingDetailsModal - Scheda Opaca Unificata', () => {
  test.beforeEach(async ({ page }) => {
    // Login come admin
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill('#email', '0cavuz0@gmail.com')
    await page.fill('#password', 'Cavallaro')
    await page.click('button[type="submit"]')

    try {
      await page.waitForURL('**/admin**', { timeout: 10000 })
    } catch (error) {
      await page.waitForTimeout(2000)
      if (!page.url().includes('/admin')) {
        test.skip()
        return
      }
    }

    await page.waitForTimeout(2000)
  })

  test('dovrebbe mostrare una scheda opaca unificata con tutti i dettagli della prenotazione', async ({ page }) => {
    // Vai alla sezione calendario
    await page.click('button:has-text("Calendario")')
    await page.waitForTimeout(1000)

    // Trova e clicca su una prenotazione esistente nel calendario
    const bookingEvent = page.locator('.fc-event').first()
    await expect(bookingEvent).toBeVisible({ timeout: 10000 })
    await bookingEvent.click()

    // Attendi che il modal si apra
    await page.waitForTimeout(500)

    // Verifica che il modal sia aperto
    const modal = page.locator('[role="dialog"]').or(page.locator('div:has(> div > h2:text("Drink"))'))
    await expect(modal).toBeVisible({ timeout: 5000 })

    // 🔴 RED PHASE: Verifica la presenza della scheda opaca unificata
    // Questa verifica DEVE fallire perché la scheda non esiste ancora
    const unifiedCard = page.locator('.bg-white\\/95.backdrop-blur-md.border-2.border-gray-200.rounded-xl.shadow-lg')

    await expect(unifiedCard).toBeVisible({
      timeout: 5000
    })

    // Verifica che la scheda contenga le informazioni del cliente
    const clientInfoSection = unifiedCard.locator('h3:has-text("Informazioni Cliente")')
    await expect(clientInfoSection).toBeVisible()

    // Verifica che la scheda contenga i dettagli evento
    const eventDetailsSection = unifiedCard.locator('h3:has-text("Dettagli Evento")')
    await expect(eventDetailsSection).toBeVisible()

    // Verifica che la scheda abbia il padding corretto
    await expect(unifiedCard).toHaveClass(/p-6|p-8/)

    // Screenshot per verifica visuale
    await page.screenshot({
      path: 'e2e/screenshots/booking-details-unified-card-test.png',
      fullPage: false
    })
  })

  test('dovrebbe mostrare la scheda opaca anche in modalità edit', async ({ page }) => {
    // Vai alla sezione calendario
    await page.click('button:has-text("Calendario")')
    await page.waitForTimeout(1000)

    // Clicca su una prenotazione
    const bookingEvent = page.locator('.fc-event').first()
    await expect(bookingEvent).toBeVisible({ timeout: 10000 })
    await bookingEvent.click()
    await page.waitForTimeout(500)

    // Clicca sul pulsante Modifica
    await page.click('button:has-text("Modifica")')
    await page.waitForTimeout(500)

    // 🔴 Verifica che la scheda opaca sia presente anche in edit mode
    const unifiedCard = page.locator('.bg-white\\/95.backdrop-blur-md.border-2.border-gray-200.rounded-xl.shadow-lg')
    await expect(unifiedCard).toBeVisible()

    // Verifica che contenga i form di modifica
    await expect(unifiedCard.locator('input[type="date"]')).toBeVisible()
    await expect(unifiedCard.locator('input[type="time"]').first()).toBeVisible()
  })
})
