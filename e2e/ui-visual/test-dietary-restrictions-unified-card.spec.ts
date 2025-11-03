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

    // Seleziona "Rinfresco di Laurea" per far apparire la sezione intolleranze
    await page.selectOption('select#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(2000) // Attendi il rendering

    // 🔴 RED PHASE: Verifica presenza card unificata con sfondo semi-trasparente
    // Stessa classe usata per BookingDetailsModal
    // Il titolo è "Intolleranze e Richieste Speciali"
    const intolleranzeH2 = page.locator('h2').filter({ hasText: 'Intolleranze' })
    await expect(intolleranzeH2).toBeVisible({ timeout: 15000 })
    
    // Il parent della card ha la classe bg-white/95
    const unifiedCard = intolleranzeH2.locator('xpath=ancestor::div[contains(@class, "bg-white/95")]').first()
    
    await expect(unifiedCard).toBeVisible({ timeout: 5000 })
    
    // Scrolla dopo che è visibile
    await unifiedCard.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

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

    // Seleziona "Rinfresco di Laurea" per far apparire la sezione intolleranze
    await page.selectOption('select#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(1000)

    const intolleranzeH2Desktop = page.locator('h2').filter({ hasText: 'Intolleranze' })
    await expect(intolleranzeH2Desktop).toBeVisible({ timeout: 15000 })
    
    const unifiedCardDesktop = intolleranzeH2Desktop.locator('xpath=ancestor::div[contains(@class, "bg-white/95")]').first()
    
    await expect(unifiedCardDesktop).toBeVisible({ timeout: 5000 })
    await unifiedCardDesktop.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Screenshot desktop
    await unifiedCardDesktop.scrollIntoViewIfNeeded()
    await page.screenshot({
      path: 'e2e/screenshots/dietary-card-desktop.png',
      fullPage: false
    })

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')

    // Seleziona "Rinfresco di Laurea" per far apparire la sezione intolleranze
    await page.selectOption('select#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(1000)

    // Ricrea il locator per mobile dopo il nuovo goto
    const intolleranzeH2Mobile = page.locator('h2').filter({ hasText: 'Intolleranze' })
    await expect(intolleranzeH2Mobile).toBeVisible({ timeout: 15000 })
    
    const unifiedCardMobile = intolleranzeH2Mobile.locator('xpath=ancestor::div[contains(@class, "bg-white/95")]').first()
    
    await expect(unifiedCardMobile).toBeVisible({ timeout: 5000 })
    await unifiedCardMobile.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Screenshot mobile
    await page.screenshot({
      path: 'e2e/screenshots/dietary-card-mobile.png',
      fullPage: false
    })
  })
})
