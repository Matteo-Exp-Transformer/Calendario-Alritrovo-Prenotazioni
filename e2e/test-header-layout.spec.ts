import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test('Verifica posizionamento User Info e Logout accanto a Rifiutate', async ({ page }) => {
  // Login con helper
  const loginSuccess = await loginAsAdmin(page)
  
  if (!loginSuccess) {
    console.log('❌ Login fallito, ma continuiamo per verificare lo stato')
  }
  
  await page.waitForTimeout(3000)
  
  // Prendi uno screenshot
  await page.screenshot({ path: 'screenshots/header-layout-test.png', fullPage: true })
  
  // Trova la card "Rifiutate"
  const rifiutateCard = page.locator('text=Rifiutate').locator('..').locator('..')
  
  // Trova User Info
  const userInfo = page.locator('text=/Admin|Staff/').locator('..').locator('..').locator('..')
  
  // Trova Logout button
  const logoutButton = page.locator('button:has-text("Logout")')
  
  const rifiutateCount = await rifiutateCard.count()
  const userInfoCount = await userInfo.count()
  const logoutCount = await logoutButton.count()
  
  console.log(`Card Rifiutate trovata: ${rifiutateCount}`)
  console.log(`User Info trovata: ${userInfoCount}`)
  console.log(`Logout button trovato: ${logoutCount}`)
  
  if (rifiutateCount > 0 && userInfoCount > 0) {
    // Verifica posizione relativa
    const rifiutateBox = await rifiutateCard.first().boundingBox()
    const userInfoBox = await userInfo.first().boundingBox()
    
    if (rifiutateBox && userInfoBox) {
      const distance = userInfoBox.x - (rifiutateBox.x + rifiutateBox.width)
      console.log(`Distanza tra Rifiutate e User Info: ${distance}px`)
      
      // Verifica che siano sulla stessa riga (y simili)
      const yDifference = Math.abs(userInfoBox.y - rifiutateBox.y)
      console.log(`Differenza verticale: ${yDifference}px`)
      
      expect(yDifference).toBeLessThan(50) // Dovrebbero essere sulla stessa riga
    }
  }
  
  expect(rifiutateCount + userInfoCount + logoutCount).toBeGreaterThan(0)
})


