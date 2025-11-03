import { test, expect } from '@playwright/test'

/**
 * Test visuale per verificare layout 2 colonne di Orari e Contatti
 */

test.describe('Orari e Contatti - Visual 2 Colonne', () => {
  test('dovrebbe mostrare 2 colonne ben visibili su desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')
    
    // Scroll fino alla sezione
    const orariSection = page.locator('h3:has-text("Orari e Contatti")')
    await expect(orariSection).toBeVisible()
    await orariSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)
    
    // Screenshot della sezione completa
    await page.screenshot({
      path: 'e2e/screenshots/orari-contatti-completa.png',
      fullPage: false
    })
    
    // Verifica elementi colonna sinistra (contatti)
    const email = page.locator('text=Alritrovobologna@gmail.com')
    await expect(email).toBeVisible()
    
    const phone = page.locator('text=3505362538')
    await expect(phone).toBeVisible()
    
    // Verifica elementi colonna destra (orari)
    const orarioLabel = page.locator('text=Orario:')
    await expect(orarioLabel).toBeVisible()
    
    // Screenshot dettagliato della griglia
    const gridContainer = page.locator('div:has(h3:has-text("Orari e Contatti"))').locator('.grid.gap-6.grid-2cols-desktop').first()
    await expect(gridContainer).toBeVisible()
    await gridContainer.screenshot({
      path: 'e2e/screenshots/orari-contatti-grid.png'
    })
  })
})

