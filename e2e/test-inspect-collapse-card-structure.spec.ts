import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

/**
 * Test di ispezione DOM per capire perché solo Pomeriggio mostra il colore
 * Systematic Debugging Phase 1: Root Cause Investigation
 */
test.describe('Ispezione DOM Collapse Cards', () => {
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

  test('Ispeziona struttura DOM di tutte le collapse card', async ({ page }) => {
    console.log('🔍 Phase 1: Root Cause Investigation - Ispezione DOM')
    
    const cards = ['Mattina', 'Pomeriggio', 'Sera']
    
    for (const cardName of cards) {
      console.log(`\n📋 === ${cardName.toUpperCase()} ===`)
      
      const card = page.locator('[data-expanded]').filter({ has: page.locator(`h3:has-text("${cardName}")`) }).first()
      
      if ((await card.count()) === 0) {
        console.log(`  ⚠️ Card "${cardName}" non trovata`)
        continue
      }

      // Trova il wrapper esterno (div con backgroundColor)
      const wrapperInfo = await card.evaluateHandle((el) => {
        let parent: HTMLElement | null = el.parentElement
        const path: string[] = []
        
        while (parent && parent.tagName !== 'BODY') {
          const style = window.getComputedStyle(parent)
          const bgColor = style.backgroundColor
          const inlineStyle = parent.getAttribute('style') || ''
          
          path.push(`${parent.tagName.toLowerCase()}.${parent.className || 'no-class'}`)
          
          // Se ha backgroundColor inline, è il wrapper
          if (inlineStyle.includes('background') || bgColor !== 'rgba(0, 0, 0, 0)') {
            return {
              element: parent.tagName,
              className: parent.className,
              inlineStyle,
              computedBg: bgColor,
              rect: parent.getBoundingClientRect(),
            }
          }
          
          parent = parent.parentElement
        }
        return null
      })
      
      const wrapperData = await wrapperInfo.jsonValue()
      console.log('  📦 Wrapper esterno:', wrapperData)
      
      // Ispeziona il CollapsibleCard stesso
      const cardInfo = await card.evaluate((el) => {
        const style = window.getComputedStyle(el)
        return {
          tagName: el.tagName,
          className: el.className,
          backgroundColor: style.backgroundColor,
          background: style.background,
          inlineStyle: el.getAttribute('style') || '',
        }
      })
      console.log('  🎴 CollapsibleCard:', cardInfo)
      
      // Ispeziona il contenuto interno (div con px-4)
      const contentDiv = card.locator('.px-4, .px-6').first()
      if (await contentDiv.count() > 0) {
        const contentInfo = await contentDiv.evaluate((el) => {
          const style = window.getComputedStyle(el)
          return {
            className: el.className,
            backgroundColor: style.backgroundColor,
            background: style.background,
            inlineStyle: el.getAttribute('style') || '',
          }
        })
        console.log('  📄 Contenuto interno:', contentInfo)
      }
      
      // Verifica se il colore è visibile guardando un punto specifico
      const visibleColor = await card.evaluate((el) => {
        const rect = el.getBoundingClientRect()
        // Controlla il punto centrale della card
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        // Non possiamo usare document.elementFromPoint qui, ma possiamo controllare gli stili
        return {
          centerX,
          centerY,
          height: rect.height,
        }
      })
      console.log('  📍 Posizione card:', visibleColor)
    }
    
    // Screenshot per riferimento visivo
    await page.screenshot({ path: 'e2e/screenshots/inspect-collapse-card-structure.png', fullPage: true })
    
    console.log('\n✅ Ispezione completata')
  })
})

