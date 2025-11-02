import { test, expect } from '@playwright/test'

/**
 * Test per verificare la card unificata delle intolleranze alimentari
 * con sfondo semi-trasparente che raggruppa:
 * - Form intolleranze
 * - Lista intolleranze inserite
 * - Note o richieste speciali
 * - Privacy policy
 * - Asterisco campi obbligatori
 *
 * RED PHASE: Questo test deve FALLIRE perché la card unificata
 * non esiste ancora.
 */

test.describe('DietaryRestrictionsSection - Card Unificata', () => {
  test('dovrebbe mostrare una card unificata semi-trasparente con tutti gli elementi', async ({ page }) => {
    // Vai al form di prenotazione
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')

    // Scrolla fino alla sezione intolleranze (usa heading)
    const intolleranzeHeading = page.locator('h2:has-text("Intolleranze Alimentari")')
    await intolleranzeHeading.scrollIntoViewIfNeeded({ timeout: 10000 })
    await page.waitForTimeout(500)

    // 🔴 RED PHASE: Verifica presenza card unificata con sfondo semi-trasparente
    // Stessa classe usata per BookingDetailsModal
    const unifiedCard = page.locator('.bg-white\\/95.backdrop-blur-md.border-2.border-gray-200.rounded-xl.shadow-lg').filter({
      has: page.locator('text=Intolleranze')
    })

    await expect(unifiedCard).toBeVisible({ timeout: 5000 })

    // Verifica che la card contenga il form intolleranze
    const restrictionSelect = unifiedCard.locator('select, [role="combobox"]').first()
    await expect(restrictionSelect).toBeVisible()

    // Verifica campo numero ospiti
    const guestCountInput = unifiedCard.locator('input[type="number"]').first()
    await expect(guestCountInput).toBeVisible()

    // Verifica bottone Aggiungi
    const addButton = unifiedCard.locator('button:has-text("Aggiungi")')
    await expect(addButton).toBeVisible()

    // Verifica campo Note o richieste speciali
    const notesTextarea = unifiedCard.locator('textarea').first()
    await expect(notesTextarea).toBeVisible()

    // Verifica label "Note o richieste speciali"
    await expect(unifiedCard.locator('text=Note o richieste speciali')).toBeVisible()

    // Verifica checkbox privacy
    const privacyCheckbox = unifiedCard.locator('input[type="checkbox"]').first()
    await expect(privacyCheckbox).toBeVisible()

    // Verifica link Privacy Policy
    await expect(unifiedCard.locator('text=Privacy Policy')).toBeVisible()

    // Verifica testo campi obbligatori
    await expect(unifiedCard.locator('text=* I campi contrassegnati sono obbligatori')).toBeVisible()

    // Screenshot per verifica visuale
    await page.screenshot({
      path: 'e2e/screenshots/dietary-restrictions-unified-card.png',
      fullPage: true
    })
  })

  test('dovrebbe avere layout responsive (mobile vs desktop)', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')

    const unifiedCard = page.locator('.bg-white\\/95.backdrop-blur-md.border-2.border-gray-200.rounded-xl.shadow-lg').filter({
      has: page.locator('text=Intolleranze')
    })

    await expect(unifiedCard).toBeVisible()

    // Screenshot desktop
    const intolleranzeHeading = page.locator('h2:has-text("Intolleranze Alimentari")')
    await intolleranzeHeading.scrollIntoViewIfNeeded({ timeout: 10000 })
    await page.screenshot({
      path: 'e2e/screenshots/dietary-card-desktop.png',
      fullPage: false
    })

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')

    await expect(unifiedCard).toBeVisible()

    // Screenshot mobile
    await intolleranzeHeading.scrollIntoViewIfNeeded({ timeout: 10000 })
    await page.screenshot({
      path: 'e2e/screenshots/dietary-card-mobile.png',
      fullPage: false
    })
  })
})
