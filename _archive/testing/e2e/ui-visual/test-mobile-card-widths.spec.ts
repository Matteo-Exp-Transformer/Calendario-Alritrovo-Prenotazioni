import { test, expect } from '@playwright/test'

/**
 * Test per verificare che le card dei titoli abbiano padding aumentato su mobile.
 * 
 * Card da verificare:
 * 1. "Dati Personali" 
 * 2. "Dettagli Prenotazione"
 * 3. "Menù" 
 * 4. "Antipasti"
 * 5. "Fritti"
 * 
 * RED PHASE: Questo test deve FALLIRE perché le card hanno padding inferiore a 24px su mobile
 */

test.describe('Mobile Card Padding - Title Cards', () => {
  test('dovrebbe avere padding orizzontale >= 24px su mobile per tutte le card titolo', async ({ page }) => {
    // Set mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')
    
    // Test 1: "Dati Personali" card
    const datiPersonaliH2 = page.locator('h2:has-text("Dati Personali")')
    await expect(datiPersonaliH2).toBeVisible()
    
    const datiPersonaliPadding = await datiPersonaliH2.evaluate(el => {
      const styles = window.getComputedStyle(el)
      const paddingLeft = parseFloat(styles.paddingLeft)
      const paddingRight = parseFloat(styles.paddingRight)
      return { left: paddingLeft, right: paddingRight, min: Math.min(paddingLeft, paddingRight) }
    })
    
    console.log('Dati Personali padding:', datiPersonaliPadding)
    expect(datiPersonaliPadding.min, 'Dati Personali dovrebbe avere padding >= 24px').toBeGreaterThanOrEqual(24)
    
    // Test 2: "Dettagli Prenotazione" card
    const dettagliPrenotazioneH2 = page.locator('h2:has-text("Dettagli Prenotazione")')
    await expect(dettagliPrenotazioneH2).toBeVisible()
    
    const dettagliPrenotazionePadding = await dettagliPrenotazioneH2.evaluate(el => {
      const styles = window.getComputedStyle(el)
      const paddingLeft = parseFloat(styles.paddingLeft)
      const paddingRight = parseFloat(styles.paddingRight)
      return { left: paddingLeft, right: paddingRight, min: Math.min(paddingLeft, paddingRight) }
    })
    
    console.log('Dettagli Prenotazione padding:', dettagliPrenotazionePadding)
    expect(dettagliPrenotazionePadding.min, 'Dettagli Prenotazione dovrebbe avere padding >= 24px').toBeGreaterThanOrEqual(24)
    
    // Seleziona "Rinfresco di Laurea" per far apparire Menù, Antipasti, Fritti
    await page.selectOption('select#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(2000) // Attendi il rendering
    
    // Test 3: "Menù" card
    const menuH2 = page.locator('h2:has-text("Menù")')
    await expect(menuH2).toBeVisible({ timeout: 10000 })
    await menuH2.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    
    const menuPadding = await menuH2.evaluate(el => {
      const styles = window.getComputedStyle(el)
      const paddingLeft = parseFloat(styles.paddingLeft)
      const paddingRight = parseFloat(styles.paddingRight)
      return { left: paddingLeft, right: paddingRight, min: Math.min(paddingLeft, paddingRight) }
    })
    
    console.log('Menù padding:', menuPadding)
    expect(menuPadding.min, 'Menù dovrebbe avere padding >= 24px').toBeGreaterThanOrEqual(24)
    
    // Test 4: "Antipasti" card
    const antipastiH3 = page.locator('h3:has-text("Antipasti")')
    await expect(antipastiH3).toBeVisible({ timeout: 10000 })
    await antipastiH3.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    
    const antipastiPadding = await antipastiH3.evaluate(el => {
      const styles = window.getComputedStyle(el)
      const paddingLeft = parseFloat(styles.paddingLeft)
      const paddingRight = parseFloat(styles.paddingRight)
      return { left: paddingLeft, right: paddingRight, min: Math.min(paddingLeft, paddingRight) }
    })
    
    console.log('Antipasti padding:', antipastiPadding)
    expect(antipastiPadding.min, 'Antipasti dovrebbe avere padding >= 24px').toBeGreaterThanOrEqual(24)
    
    // Test 5: "Fritti" card
    const frittiH3 = page.locator('h3:has-text("Fritti")')
    await expect(frittiH3).toBeVisible({ timeout: 10000 })
    await frittiH3.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    
    const frittiPadding = await frittiH3.evaluate(el => {
      const styles = window.getComputedStyle(el)
      const paddingLeft = parseFloat(styles.paddingLeft)
      const paddingRight = parseFloat(styles.paddingRight)
      return { left: paddingLeft, right: paddingRight, min: Math.min(paddingLeft, paddingRight) }
    })
    
    console.log('Fritti padding:', frittiPadding)
    expect(frittiPadding.min, 'Fritti dovrebbe avere padding >= 24px').toBeGreaterThanOrEqual(24)
    
    // Screenshot finale per verifica visuale
    await page.screenshot({
      path: 'e2e/screenshots/mobile-card-padding-test.png',
      fullPage: true
    })
  })
  
  test('dovrebbe mostrare tutte le card su mobile con screenshot finale', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')
    
    // Screenshot mobile view con sezione Dati Personali
    await page.screenshot({
      path: 'e2e/screenshots/mobile-cards-section1.png',
      fullPage: false
    })
    
    // Seleziona "Rinfresco di Laurea"
    await page.selectOption('select#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(2000)
    
    // Scorri fino alle sezioni Menù
    const menuH2 = page.locator('h2:has-text("Menù")')
    await expect(menuH2).toBeVisible({ timeout: 10000 })
    await menuH2.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    
    // Screenshot mobile view con sezione Menù, Antipasti, Fritti
    await page.screenshot({
      path: 'e2e/screenshots/mobile-cards-section2.png',
      fullPage: false
    })
  })
})

