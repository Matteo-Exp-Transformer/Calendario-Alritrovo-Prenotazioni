import { test, expect } from '@playwright/test'

/**
 * Test per verificare il layout dell'header su mobile e desktop
 */

test.describe('Header Layout Verification', () => {
  test('dovrebbe mostrare header con Al Ritrovo e Prenota il Tuo Tavolo su desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')
    
    // Verifica "Al Ritrovo" a sinistra
    const leftText = page.locator('h1:has-text("Al Ritrovo")')
    await expect(leftText).toBeVisible()
    
    // Verifica "Prenota il Tuo Tavolo" a destra
    const rightText = page.locator('text=Prenota il Tuo Tavolo')
    await expect(rightText).toBeVisible()
    
    // Screenshot
    await page.screenshot({
      path: 'e2e/screenshots/header-layout-desktop.png',
      fullPage: false
    })
  })
  
  test('dovrebbe mostrare sezione orari e contatti con 2 colonne su desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')
    
    // Scroll fino alla sezione Orari e Contatti
    const orariSection = page.locator('h3:has-text("Orari e Contatti")')
    await expect(orariSection).toBeVisible()
    await orariSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    
    // Verifica che ci sia il grid con 2 colonne
    const grid = page.locator('div:has(h3:has-text("Orari e Contatti"))').locator('.grid.gap-6.grid-2cols-desktop')
    await expect(grid).toBeVisible()
    
    // Verifica che il grid abbia 2 colonne su desktop
    const gridTemplateColumns = await grid.evaluate((el) => {
      const cs = window.getComputedStyle(el)
      return cs.gridTemplateColumns
    })
    // Dovrebbe avere 2 colonne, quindi 2 valori con "px"
    const columns = gridTemplateColumns.split(' ').filter(val => val.includes('px'))
    expect(columns.length).toBe(2)
    
    // Screenshot
    await page.screenshot({
      path: 'e2e/screenshots/orari-contatti-2colonne-desktop.png',
      fullPage: false
    })
  })
  
  test('dovrebbe mostrare layout responsive su mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')
    
    // Verifica header
    const leftText = page.locator('h1:has-text("Al Ritrovo")')
    await expect(leftText).toBeVisible()
    
    const rightText = page.locator('text=Prenota il Tuo Tavolo')
    await expect(rightText).toBeVisible()
    
    // Screenshot
    await page.screenshot({
      path: 'e2e/screenshots/header-layout-mobile.png',
      fullPage: false
    })
  })
})
