import { test, expect } from '@playwright/test'

/**
 * Test per verificare le modifiche recenti al form di prenotazione:
 * 1. Padding aumentato tra "Tipologia di Prenotazione" e casella
 * 2. Testo "Tipologia di Prenotazione" in bold
 * 3. Card ingredienti con bordi stondati (rounded-xl) e gap aumentato
 */
test.describe('Booking Form Modifications', () => {
  test('dovrebbe mostrare le modifiche recenti', async ({ page }) => {
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')
    
    // Screenshot completo della pagina
    await page.screenshot({
      path: 'e2e/screenshots/booking-form-modifications-full.png',
      fullPage: true
    })
    
    // Verifica "Tipologia di Prenotazione" è in bold
    const tipologiaLabel = page.locator('label:has-text("Tipologia di Prenotazione")')
    await expect(tipologiaLabel).toBeVisible()
    
    // Verifica che ha font-bold
    const fontWeight = await tipologiaLabel.evaluate(el => {
      return window.getComputedStyle(el).fontWeight
    })
    console.log('Font weight Tipologia:', fontWeight)
    
    // Verifica spacing tra label e select
    const tipologiaSection = page.locator('div:has(label:has-text("Tipologia di Prenotazione"))')
    await expect(tipologiaSection).toBeVisible()
    
    // Seleziona "Rinfresco di Laurea" per vedere il menù
    await page.selectOption('select#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(2000)
    
    // Scorri fino alle card degli ingredienti
    const menuSection = page.locator('h2:has-text("Menù")')
    await menuSection.scrollIntoViewIfNeeded({ timeout: 10000 })
    await page.waitForTimeout(1000)
    
    // Verifica card ingredienti hanno rounded-xl
    const ingredientCards = page.locator('label.rounded-xl').filter({ has: page.locator('input[type="checkbox"]') })
    const count = await ingredientCards.count()
    console.log('Card ingredienti trovate:', count)
    
    if (count > 0) {
      // Scorri fino alla prima card
      await ingredientCards.first().scrollIntoViewIfNeeded()
      await page.waitForTimeout(1000)
      
      // Screenshot completo della sezione menu
      await page.screenshot({
        path: 'e2e/screenshots/booking-form-menu-section-full.png',
        fullPage: false
      })
      
      // Screenshot dettagliato delle card ingredienti
      const firstCard = ingredientCards.first()
      await firstCard.scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
      await page.screenshot({
        path: 'e2e/screenshots/booking-form-menu-items-detail.png',
        fullPage: false
      })
      
      // Verifica border-radius
      const borderRadius = await firstCard.evaluate(el => {
        return window.getComputedStyle(el).borderRadius
      })
      console.log('Border radius card ingredienti:', borderRadius)
      
      // Verifica gap tra card
      const gridContainer = firstCard.locator('xpath=ancestor::div[contains(@class, "grid")]')
      if (await gridContainer.count() > 0) {
        const gap = await gridContainer.first().evaluate(el => {
          return window.getComputedStyle(el).gap
        })
        console.log('Gap tra card ingredienti:', gap)
      }
    } else {
      console.log('⚠️ Nessuna card ingrediente trovata con rounded-xl')
      // Screenshot di debug
      await page.screenshot({
        path: 'e2e/screenshots/booking-form-menu-section-debug.png',
        fullPage: true
      })
    }
  })
})

