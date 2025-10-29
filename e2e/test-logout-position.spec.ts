import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test('Verifica posizionamento Logout sotto Dashboard Amministratore', async ({ page }) => {
  // Login con helper
  const loginSuccess = await loginAsAdmin(page)
  
  if (!loginSuccess) {
    console.log('❌ Login fallito, ma continuiamo per verificare lo stato')
  }
  
  await page.waitForTimeout(3000)
  
  // Prendi uno screenshot
  await page.screenshot({ path: 'screenshots/logout-position-test.png', fullPage: true })
  
  // Trova il testo "Dashboard Amministratore"
  const dashboardText = page.locator('text=Dashboard Amministratore')
  const dashboardCount = await dashboardText.count()
  console.log(`Testo "Dashboard Amministratore" trovato: ${dashboardCount} volte`)
  
  // Trova il pulsante Logout
  const logoutButton = page.locator('button:has-text("Logout")')
  const logoutCount = await logoutButton.count()
  console.log(`Pulsante Logout trovato: ${logoutCount} volte`)
  
  if (dashboardCount > 0 && logoutCount > 0) {
    // Verifica posizione relativa
    const dashboardBox = await dashboardText.first().boundingBox()
    const logoutBox = await logoutButton.first().boundingBox()
    
    if (dashboardBox && logoutBox) {
      // Verifica che logout sia sotto dashboard (y maggiore)
      const yDifference = logoutBox.y - (dashboardBox.y + dashboardBox.height)
      console.log(`Distanza verticale tra "Dashboard Amministratore" e Logout: ${yDifference}px`)
      
      // Verifica che siano allineati orizzontalmente (x simile)
      const xDifference = Math.abs(logoutBox.x - dashboardBox.x)
      console.log(`Differenza orizzontale: ${xDifference}px`)
      
      // Logout dovrebbe essere sotto (distanza positiva)
      expect(yDifference).toBeGreaterThan(0)
      
      // Verifica che la distanza sia ragionevole (non troppo lontano)
      expect(yDifference).toBeLessThan(100)
      
      // Verifica che siano allineati (x simili con tolleranza)
      expect(xDifference).toBeLessThan(50)
      
      console.log('✅ Logout posizionato correttamente sotto "Dashboard Amministratore"')
    }
  }
  
  // Verifica che ci sia il logout
  expect(logoutCount).toBeGreaterThan(0)
})

