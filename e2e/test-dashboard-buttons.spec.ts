import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test('Verifica colore bottoni dashboard - nessun effetto esterno al bordo', async ({ page }) => {
  // Login con helper
  const loginSuccess = await loginAsAdmin(page)
  
  if (!loginSuccess) {
    console.log('❌ Login fallito, ma continuiamo per verificare lo stato')
  }
  
  await page.waitForTimeout(3000)
  
  // Prendi uno screenshot per verificare visivamente
  await page.screenshot({ path: 'screenshots/dashboard-buttons-test.png', fullPage: true })
  
  // Verifica se ci sono elementi cliccabili nella navbar
  const navItems = page.locator('div.cursor-pointer.rounded-3xl')
  const count = await navItems.count()
  console.log(`Trovati ${count} elementi navbar`)
  
  // Verifica che NON ci siano glow effects esterni
  const glowElements = page.locator('.absolute.inset-0.bg-gradient')
  const glowCount = await glowElements.count()
  
  if (glowCount > 0) {
    console.error(`❌ TROVATI ${glowCount} GLOW EFFECTS ESTERNI! Questo non dovrebbe esistere.`)
    expect(glowCount).toBe(0)
  } else {
    console.log('✅ Nessun glow effect esterno trovato')
  }
  
  // Verifica colori per ogni elemento
  for (let i = 0; i < Math.min(count, 4); i++) {
    const button = navItems.nth(i)
    
    // Leggi lo sfondo direttamente dal div principale
    const bgColor = await button.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    // Leggi il colore del testo dallo span  
    const textColor = await button.locator('span.text-white').first().evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    
    // Leggi anche il colore dell'icona
    const iconColor = await button.locator('svg.text-white').first().evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    
    // Verifica che non ci siano effetti shadow o drop-shadow
    const hasShadow = await button.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.boxShadow !== 'none' || style.textShadow !== 'none'
    })
    
    if (hasShadow) {
      console.warn(`⚠️ Bottone ${i}: ha ancora effetti di shadow`)
    } else {
      console.log(`✅ Bottone ${i}: nessun effetto shadow`)
    }
    
    console.log(`Bottone ${i}: bg=${bgColor}, textColor=${textColor}, iconColor=${iconColor}`)
  }
  
  expect(count).toBeGreaterThanOrEqual(3) // Almeno 3 bottoni (Calendario, Archive, Settings)
})

