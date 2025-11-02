import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

/**
 * Test TDD RED-GREEN-REFACTOR per colori interni collapse card
 * 
 * Problema: Solo "Pomeriggio" mostra colore interno correttamente
 * Mattina e Sera non mostrano il colore di background interno
 * 
 * RED: Test che fallisce - verifica che tutte le card abbiano backgroundColor visibile
 * GREEN: Fix del codice per far passare il test
 * REFACTOR: Verifica che funzioni correttamente
 */
test.describe('Collapse Cards - Colori Interni (TDD)', () => {
  test.beforeEach(async ({ page }) => {
    const loginSuccess = await loginAsAdmin(page)
    if (!loginSuccess) {
      test.skip()
      return
    }

    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    // Clicca sul tab "Calendario"
    const calendarTab = page.locator('button, a').filter({ hasText: /calendario/i }).first()
    if (await calendarTab.count() > 0) {
      await calendarTab.click()
      await page.waitForTimeout(1000)
    }
    
    // Attendi che le collapse card siano visibili
    await page.waitForSelector('[data-expanded]', { timeout: 15000 })
  })

  test('RED: Verifica che tutte le collapse card abbiano backgroundColor interno visibile', async ({ page }) => {
    console.log('🔴 RED Phase: Test fallente - verifica backgroundColor')

    // Trova le tre card delle fasce orarie
    const mattinaCard = page.locator('[data-expanded]').filter({ has: page.locator('h3:has-text("Mattina")') }).first()
    const pomeriggioCard = page.locator('[data-expanded]').filter({ has: page.locator('h3:has-text("Pomeriggio")') }).first()
    const seraCard = page.locator('[data-expanded]').filter({ has: page.locator('h3:has-text("Sera")') }).first()

    await expect(mattinaCard).toBeVisible({ timeout: 5000 })
    await expect(pomeriggioCard).toBeVisible({ timeout: 5000 })
    await expect(seraCard).toBeVisible({ timeout: 5000 })

    // Trova i div wrapper esterni (quelli con backgroundColor inline)
    // Il wrapper è il parent del CollapsibleCard
    const getWrapperBgColor = async (cardLocator: any) => {
      // Vai al parent che ha lo style inline con backgroundColor
      const wrapper = cardLocator.locator('..').first()
      const bgColor = await wrapper.evaluate((el: HTMLElement) => {
        const inlineStyle = el.getAttribute('style') || ''
        const computedStyle = window.getComputedStyle(el)
        return {
          inline: inlineStyle,
          computed: computedStyle.backgroundColor,
          inlineHasBg: inlineStyle.includes('backgroundColor'),
        }
      })
      return bgColor
    }

    // 1. MATTINA - dovrebbe avere backgroundColor verde
    const mattinaBg = await getWrapperBgColor(mattinaCard)
    console.log('🎨 Mattina:', {
      inline: mattinaBg.inline,
      computed: mattinaBg.computed,
      hasBgInInline: mattinaBg.inlineHasBg
    })
    
    // Verifica che il computed backgroundColor sia visibile (non transparent o white)
    expect(mattinaBg.computed).not.toBe('rgba(0, 0, 0, 0)')
    expect(mattinaBg.computed).not.toBe('transparent')
    // Dovrebbe contenere 240, 253, 244 (verde chiaro)
    expect(mattinaBg.computed).toContain('240')
    expect(mattinaBg.computed).toContain('253')

    // 2. POMERIGGIO - dovrebbe avere backgroundColor giallo (questo funziona)
    const pomeriggioBg = await getWrapperBgColor(pomeriggioCard)
    console.log('🎨 Pomeriggio:', {
      inline: pomeriggioBg.inline,
      computed: pomeriggioBg.computed,
      hasBgInInline: pomeriggioBg.inlineHasBg
    })
    
    expect(pomeriggioBg.computed).not.toBe('rgba(0, 0, 0, 0)')
    expect(pomeriggioBg.computed).not.toBe('transparent')
    // Dovrebbe contenere 254, 249, 195 (giallo chiaro)
    expect(pomeriggioBg.computed).toContain('254')
    expect(pomeriggioBg.computed).toContain('249')

    // 3. SERA - dovrebbe avere backgroundColor blu
    const seraBg = await getWrapperBgColor(seraCard)
    console.log('🎨 Sera:', {
      inline: seraBg.inline,
      computed: seraBg.computed,
      hasBgInInline: seraBg.inlineHasBg
    })
    
    expect(seraBg.computed).not.toBe('rgba(0, 0, 0, 0)')
    expect(seraBg.computed).not.toBe('transparent')
    // Dovrebbe contenere 239, 246, 255 (blu chiaro)
    expect(seraBg.computed).toContain('239')
    expect(seraBg.computed).toContain('246')

    // Screenshot per verifica visiva
    await page.screenshot({ path: 'e2e/screenshots/test-collapse-internal-colors-red.png', fullPage: true })
    
    console.log('✅ RED Phase completato - Se fallisce, è corretto (TDD)')
  })
})

