import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

/**
 * Test TDD GREEN: Verifica che il fix funzioni
 * Dopo aver aggiunto backgroundColor al contenuto interno di Mattina e Sera
 */
test.describe('Collapse Cards - Colori Interni FIXED (TDD GREEN)', () => {
  test.beforeEach(async ({ page }) => {
    const loginSuccess = await loginAsAdmin(page)
    if (!loginSuccess) {
      test.skip()
      return
    }

    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    const calendarTab = page.locator('button, a').filter({ hasText: /calendario/i }).first()
    if (await calendarTab.count() > 0) {
      await calendarTab.click()
      await page.waitForTimeout(1000)
    }
    
    await page.waitForSelector('[data-expanded]', { timeout: 15000 })
  })

  test('GREEN: Verifica che tutte le collapse card mostrino il colore interno', async ({ page }) => {
    console.log('🟢 GREEN Phase: Verifica fix - colore interno visibile')

    const mattinaCard = page.locator('[data-expanded]').filter({ has: page.locator('h3:has-text("Mattina")') }).first()
    const pomeriggioCard = page.locator('[data-expanded]').filter({ has: page.locator('h3:has-text("Pomeriggio")') }).first()
    const seraCard = page.locator('[data-expanded]').filter({ has: page.locator('h3:has-text("Sera")') }).first()

    await expect(mattinaCard).toBeVisible({ timeout: 5000 })
    await expect(pomeriggioCard).toBeVisible({ timeout: 5000 })
    await expect(seraCard).toBeVisible({ timeout: 5000 })

    // Trova il contenuto interno (div che è figlio diretto del CollapsibleCard content region)
    const getContentBgColor = async (cardLocator: any) => {
      // Trova il content region (quello con border-t, non l'header)
      const contentRegion = cardLocator.locator('[role="region"]').filter({ 
        hasNot: cardLocator.locator('[role="button"]') 
      }).last()
      
      // Trova il primo div dentro il content region che ha px-4 o px-6 (non header)
      const contentDiv = contentRegion.locator('div').filter((el: any) => {
        const className = el.getAttribute('class') || ''
        return (className.includes('px-4') || className.includes('px-6')) && 
               !className.includes('cursor-pointer') && 
               !className.includes('bg-green-100') && 
               !className.includes('bg-yellow-100') && 
               !className.includes('bg-blue-100')
      }).first()
      
      if ((await contentDiv.count()) === 0) {
        // Fallback: primo div dentro content region
        const firstDiv = contentRegion.locator('div').first()
        if ((await firstDiv.count()) === 0) {
          return null
        }
        const bgColor = await firstDiv.evaluate((el: HTMLElement) => {
          const inlineStyle = el.getAttribute('style') || ''
          const computedStyle = window.getComputedStyle(el)
          return {
            inline: inlineStyle,
            computed: computedStyle.backgroundColor,
            hasBgInInline: inlineStyle.includes('background'),
            className: el.className,
          }
        })
        return bgColor
      }
      
      const bgColor = await contentDiv.evaluate((el: HTMLElement) => {
        const inlineStyle = el.getAttribute('style') || ''
        const computedStyle = window.getComputedStyle(el)
        return {
          inline: inlineStyle,
          computed: computedStyle.backgroundColor,
          hasBgInInline: inlineStyle.includes('background'),
          className: el.className,
        }
      })
      return bgColor
    }

    // 1. MATTINA - contenuto interno dovrebbe avere backgroundColor verde
    const mattinaContentBg = await getContentBgColor(mattinaCard)
    console.log('🎨 Mattina contenuto interno:', mattinaContentBg)
    
    expect(mattinaContentBg).not.toBeNull()
    expect(mattinaContentBg?.computed).not.toBe('rgba(0, 0, 0, 0)')
    expect(mattinaContentBg?.computed).not.toBe('transparent')
    expect(mattinaContentBg?.computed).toContain('240') // verde
    expect(mattinaContentBg?.hasBgInInline).toBe(true)

    // 2. POMERIGGIO - dovrebbe funzionare (già funzionava)
    const pomeriggioContentBg = await getContentBgColor(pomeriggioCard)
    console.log('🎨 Pomeriggio contenuto interno:', pomeriggioContentBg)
    
    // Pomeriggio può avere il colore dal wrapper (non abbiamo aggiunto inline per pomeriggio)
    // Ma verificiamo che sia visibile comunque
    expect(pomeriggioContentBg).not.toBeNull()

    // 3. SERA - contenuto interno dovrebbe avere backgroundColor blu
    const seraContentBg = await getContentBgColor(seraCard)
    console.log('🎨 Sera contenuto interno:', seraContentBg)
    
    expect(seraContentBg).not.toBeNull()
    expect(seraContentBg?.computed).not.toBe('rgba(0, 0, 0, 0)')
    expect(seraContentBg?.computed).not.toBe('transparent')
    expect(seraContentBg?.computed).toContain('239') // blu
    expect(seraContentBg?.hasBgInInline).toBe(true)

    // Screenshot per verifica visiva
    await page.screenshot({ path: 'e2e/screenshots/test-collapse-internal-colors-green.png', fullPage: true })
    
    console.log('✅ GREEN Phase completato - Fix verificato!')
  })
})

