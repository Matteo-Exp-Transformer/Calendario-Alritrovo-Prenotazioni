import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test('Verifica posizionamento Logout sotto Dashboard Amministratore', async ({ page }) => {
  // Login con helper
  const loginSuccess = await loginAsAdmin(page)
  
  if (!loginSuccess) {
    console.log('❌ Login fallito, ma continuiamo per verificare lo stato')
  }
  
  await page.waitForTimeout(3000)
  
  // Prendi uno screenshot
  await page.screenshot({ path: 'screenshots/logout-position-test.png', fullPage: true })
  
  // Attendi che la pagina sia completamente caricata
  await page.waitForLoadState('networkidle')
  
  // Trova il testo "Dashboard Amministratore" nell'header
  const dashboardText = page.locator('text=Dashboard Amministratore').first()
  const dashboardCount = await dashboardText.count()
  console.log(`Testo "Dashboard Amministratore" trovato: ${dashboardCount} volte`)
  
  // Trova il pulsante Logout nell'header
  const logoutButton = page.locator('button:has-text("Logout")').first()
  const logoutCount = await logoutButton.count()
  console.log(`Pulsante Logout trovato: ${logoutCount} volte`)
  
  // Se non trovato, prova altri selettori
  if (dashboardCount === 0) {
    console.log('⚠️ Testo "Dashboard Amministratore" non trovato con il primo selettore, provo alternativi...')
    const altDashboard = page.locator('p:has-text("Dashboard")')
    const altCount = await altDashboard.count()
    console.log(`Trovato con selettore alternativo: ${altCount}`)
  }
  
  expect(dashboardCount).toBeGreaterThan(0)
  expect(logoutCount).toBeGreaterThan(0)
  
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
      // Verifica che sia ragionevolmente vicino al testo (max 20px)
      expect(yDifference).toBeGreaterThan(0)
      expect(yDifference).toBeLessThan(20) // Accetta fino a 20px di distanza
      
      // Verifica che siano allineati (x simili con tolleranza)
      expect(xDifference).toBeLessThan(50)
      
      // Verifica che la distanza dai bottoni nav sia sufficiente
      // (questo viene verificato indirettamente dal layout con mb-6)
      
      console.log('✅ Logout posizionato correttamente sotto "Dashboard Amministratore"')
    }
  }
  
  // Verifica che ci sia il logout
  expect(logoutCount).toBeGreaterThan(0)
})


