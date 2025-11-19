import { test, expect } from '@playwright/test'

/**
 * Test per verificare che l'indirizzo "Via Centotrecento 1/1B - Bologna, Italia"
 * sia visualizzato in grassetto sia su mobile che desktop
 */

test.describe('Indirizzo Bold Verification', () => {
  test('dovrebbe mostrare indirizzo in grassetto su mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')
    
    // Verifica elemento indirizzo
    const addressSpan = page.locator('span:has-text("Via Centotrecento")')
    await expect(addressSpan).toBeVisible()
    
    // Verifica fontWeight
    const fontWeight = await addressSpan.evaluate(el => {
      return window.getComputedStyle(el).fontWeight
    })
    
    console.log('Mobile fontWeight:', fontWeight)
    // font-bold dovrebbe essere 700 o equivalente
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(700)
    
    // Screenshot
    await page.screenshot({
      path: 'e2e/screenshots/address-bold-mobile.png',
      fullPage: false
    })
  })
  
  test('dovrebbe mostrare indirizzo in grassetto su desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')
    
    // Verifica elemento indirizzo
    const addressSpan = page.locator('span:has-text("Via Centotrecento")')
    await expect(addressSpan).toBeVisible()
    
    // Verifica fontWeight
    const fontWeight = await addressSpan.evaluate(el => {
      return window.getComputedStyle(el).fontWeight
    })
    
    console.log('Desktop fontWeight:', fontWeight)
    // font-bold dovrebbe essere 700 o equivalente
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(700)
    
    // Screenshot
    await page.screenshot({
      path: 'e2e/screenshots/address-bold-desktop.png',
      fullPage: false
    })
  })
})












