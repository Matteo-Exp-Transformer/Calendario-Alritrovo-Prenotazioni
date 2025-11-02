import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

/**
 * Test per verificare che tutte le collapse card delle fasce orarie
 * abbiano il colore di background interno corretto
 * 
 * Problema: Solo "Pomeriggio" mostra il colore interno correttamente
 * Obiettivo: Assicurarsi che Mattina e Sera abbiano lo stesso comportamento
 */
test.describe('Collapse Cards Colori Fasce Orarie', () => {
  test.beforeEach(async ({ page }) => {
    // Login come admin
    const loginSuccess = await loginAsAdmin(page)
    if (!loginSuccess) {
      test.skip()
      return
    }

    // Naviga alla sezione Calendario dove ci sono le collapse card
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    // Clicca sul tab "Calendario" se presente
    const calendarTab = page.locator('button, a').filter({ hasText: /calendario/i }).first()
    if (await calendarTab.count() > 0) {
      await calendarTab.click()
      await page.waitForTimeout(1000)
    }
    
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-expanded]', { timeout: 15000 })
  })

  test('verifica colori interni delle collapse card', async ({ page }) => {
    console.log('🧪 Test: Verifica colori interni collapse card')

    // Prendi uno screenshot iniziale
    await page.screenshot({ path: 'e2e/screenshots/collapse-cards-colors-initial.png', fullPage: true })

    // Verifica che le collapse card esistano
    const mattinaCard = page.locator('[data-expanded]').filter({ has: page.locator('h3:has-text("Mattina")') }).first()
    const pomeriggioCard = page.locator('[data-expanded]').filter({ has: page.locator('h3:has-text("Pomeriggio")') }).first()
    const seraCard = page.locator('[data-expanded]').filter({ has: page.locator('h3:has-text("Sera")') }).first()

    await expect(mattinaCard).toBeVisible({ timeout: 5000 })
    await expect(pomeriggioCard).toBeVisible({ timeout: 5000 })
    await expect(seraCard).toBeVisible({ timeout: 5000 })

    console.log('✅ Tutte le collapse card sono visibili')

    // Verifica gli stili di background per ogni card
    // Ogni card è wrappata in un div con backgroundColor inline

    // 1. MATTINA - dovrebbe avere backgroundColor verde
    const mattinaWrapper = mattinaCard.locator('..').locator('..').first()
    const mattinaBgColor = await mattinaWrapper.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    console.log('🎨 Mattina backgroundColor:', mattinaBgColor)
    
    // Verifica che sia verde (rgba(240, 253, 244, 0.6) = rgb(240, 253, 244) con opacity)
    expect(mattinaBgColor).toContain('240') // Componente R del verde chiaro
    expect(mattinaBgColor).toContain('253') // Componente G del verde chiaro

    // 2. POMERIGGIO - dovrebbe avere backgroundColor giallo
    const pomeriggioWrapper = pomeriggioCard.locator('..').locator('..').first()
    const pomeriggioBgColor = await pomeriggioWrapper.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    console.log('🎨 Pomeriggio backgroundColor:', pomeriggioBgColor)
    
    // Verifica che sia giallo (rgba(254, 249, 195, 0.6) = rgb(254, 249, 195) con opacity)
    expect(pomeriggioBgColor).toContain('254') // Componente R del giallo
    expect(pomeriggioBgColor).toContain('249') // Componente G del giallo

    // 3. SERA - dovrebbe avere backgroundColor blu
    const seraWrapper = seraCard.locator('..').locator('..').first()
    const seraBgColor = await seraWrapper.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    console.log('🎨 Sera backgroundColor:', seraBgColor)
    
    // Verifica che sia blu (rgba(239, 246, 255, 0.6) = rgb(239, 246, 255) con opacity)
    expect(seraBgColor).toContain('239') // Componente R del blu chiaro
    expect(seraBgColor).toContain('246') // Componente G del blu chiaro

    // Screenshot finale per verifica visiva
    await page.screenshot({ path: 'e2e/screenshots/collapse-cards-colors-verified.png', fullPage: true })

    console.log('✅ Test completato - Tutti i colori verificati')
  })

  test('verifica colori con ispezione DOM completa', async ({ page }) => {
    console.log('🔍 Test: Ispezione DOM completa per colori')

    // Trova i div wrapper esterni (quelli con border e backgroundColor)
    const allCards = await page.$$('[data-expanded]')
    console.log(`📦 Trovate ${allCards.length} collapse card`)

    for (const card of allCards) {
      const title = await card.$eval('h3', el => el.textContent)
      console.log(`\n📋 Card: ${title}`)

      // Trova il div wrapper parent che dovrebbe avere backgroundColor
      const wrapper = await card.evaluateHandle((el) => {
        // Sale fino al div con border e backgroundColor
        let parent = el.parentElement
        while (parent && parent.tagName !== 'BODY') {
          const style = window.getComputedStyle(parent)
          const bgColor = style.backgroundColor
          // Se ha un backgroundColor diverso da bianco/transparent, è il wrapper
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent' && !bgColor.includes('255, 255, 255')) {
            return parent
          }
          parent = parent.parentElement
        }
        return null
      })

      if (wrapper) {
        const bgColor = await wrapper.evaluate((el) => {
          return {
            inline: el.getAttribute('style'),
            computed: window.getComputedStyle(el).backgroundColor,
          }
        })
        console.log(`  🎨 Inline style: ${bgColor.inline}`)
        console.log(`  🎨 Computed background: ${bgColor.computed}`)
      } else {
        console.log(`  ⚠️  Wrapper con backgroundColor non trovato!`)
      }
    }

    await page.screenshot({ path: 'e2e/screenshots/collapse-cards-dom-inspection.png', fullPage: true })
  })
})



