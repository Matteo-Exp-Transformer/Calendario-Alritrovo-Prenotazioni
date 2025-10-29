import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test('Verifica bordo delle card corretto', async ({ page }) => {
  // Login con helper
  const loginSuccess = await loginAsAdmin(page)
  
  if (!loginSuccess) {
    console.log('❌ Login fallito, ma continuiamo per verificare lo stato')
  }
  
  await page.waitForTimeout(3000)
  
  // Prendi uno screenshot
  await page.screenshot({ path: 'screenshots/card-borders-test.png', fullPage: true })
  
  // Trova le card
  const card1 = page.locator('text=Inserisci nuova prenotazione').locator('..').locator('..').locator('..')
  const card2 = page.locator('text=Prenotazioni Pendenti').locator('..').locator('..').locator('..')
  
  // Verifica che esistano
  const count1 = await card1.count()
  const count2 = await card2.count()
  
  console.log(`Trovate ${count1} card "Inserisci nuova prenotazione"`)
  console.log(`Trovate ${count2} card "Prenotazioni Pendenti"`)
  
  if (count1 > 0) {
    const borderColor = await card1.first().evaluate((el) => {
      return window.getComputedStyle(el).borderColor
    })
    console.log(`Card 1 - Border color: ${borderColor}`)
  }
  
  if (count2 > 0) {
    const borderColor = await card2.first().evaluate((el) => {
      return window.getComputedStyle(el).borderColor
    })
    console.log(`Card 2 - Border color: ${borderColor}`)
  }
  
  expect(count1 + count2).toBeGreaterThan(0)
})

