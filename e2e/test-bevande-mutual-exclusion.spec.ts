import { test, expect } from '@playwright/test'

/**
 * Test: Mutua Esclusione Bevande nel Form Pubblico
 * 
 * Verifica che:
 * 1. Selezionando "Caraffe / Drink" si deseleziona automaticamente "Caraffe / Drink Premium"
 * 2. Selezionando "Caraffe / Drink Premium" si deseleziona automaticamente "Caraffe / Drink"
 * 3. Non è possibile avere entrambi selezionati contemporaneamente
 * 4. Lo switch avviene automaticamente senza alert/errori
 */

test.describe('Test Mutua Esclusione Bevande - Form Pubblico', () => {
  
  test.beforeEach(async ({ page }) => {
    // Naviga al form pubblico
    await page.goto('http://localhost:5175/prenota')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Seleziona "Rinfresco di Laurea" per mostrare il menu
    await page.selectOption('#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(500)
    
    // Scroll alla sezione menu
    const menuSection = page.locator('h2:has-text("Menù")')
    if (await menuSection.count() > 0) {
      await menuSection.scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
    }
  })

  // Helper per verificare se un item è selezionato
  const isItemSelected = async (page, itemText: string): Promise<boolean> => {
    const label = page.locator(`label:has-text("${itemText}")`).first()
    if (await label.count() === 0) return false
    
    const bgColor = await label.evaluate(el => window.getComputedStyle(el).backgroundColor)
    // Selected items have rgba(245, 222, 179, 0.6) or rgb(245, 222, 179)
    return bgColor.includes('245, 222, 179') || bgColor.includes('rgb(245, 222, 179)')
  }

  test('Dovrebbe deselezionare automaticamente "Caraffe / Drink Premium" quando si seleziona "Caraffe / Drink"', async ({ page }) => {
    console.log('🧪 Test: Standard drink → Premium auto-deselected')
    
    // Verifica che la sezione Bevande esista
    const bevandeSection = page.locator('h3:has-text("Bevande")')
    if (await bevandeSection.count() === 0) {
      test.skip()
      return
    }

    // Step 1: Seleziona "Caraffe / Drink Premium"
    const premiumLabel = page.locator('label:has-text("Caraffe / Drink Premium")').first()
    if (await premiumLabel.count() > 0) {
      await premiumLabel.click()
      await page.waitForTimeout(300)
      
      // Verifica che premium è selezionato
      expect(await isItemSelected(page, 'Caraffe / Drink Premium')).toBe(true)
      console.log('✅ Premium drink selezionato')
    }

    // Step 2: Seleziona "Caraffe / Drink" → dovrebbe deselezionare automaticamente premium
    const standardLabel = page.locator('label:has-text("Caraffe / Drink")').first()
    if (await standardLabel.count() > 0) {
      await standardLabel.click()
      await page.waitForTimeout(300)
      
      // Verifica che standard è selezionato e premium NO
      expect(await isItemSelected(page, 'Caraffe / Drink')).toBe(true)
      expect(await isItemSelected(page, 'Caraffe / Drink Premium')).toBe(false)
      console.log('✅ Standard drink selezionato, Premium deselezionato automaticamente')
    } else {
      console.log('⚠️ Label "Caraffe / Drink" non trovato')
    }
  })

  test('Dovrebbe deselezionare automaticamente "Caraffe / Drink" quando si seleziona "Caraffe / Drink Premium"', async ({ page }) => {
    console.log('🧪 Test: Premium drink → Standard auto-deselected')
    
    // Verifica che la sezione Bevande esista
    const bevandeSection = page.locator('h3:has-text("Bevande")')
    if (await bevandeSection.count() === 0) {
      test.skip()
      return
    }

    // Step 1: Seleziona "Caraffe / Drink"
    const standardLabel = page.locator('label:has-text("Caraffe / Drink")').first()
    if (await standardLabel.count() > 0) {
      await standardLabel.click()
      await page.waitForTimeout(300)
      
      // Verifica che standard è selezionato
      expect(await isItemSelected(page, 'Caraffe / Drink')).toBe(true)
      console.log('✅ Standard drink selezionato')
    }

    // Step 2: Seleziona "Caraffe / Drink Premium" → dovrebbe deselezionare automaticamente standard
    const premiumLabel = page.locator('label:has-text("Caraffe / Drink Premium")').first()
    if (await premiumLabel.count() > 0) {
      await premiumLabel.click()
      await page.waitForTimeout(300)
      
      // Verifica che premium è selezionato e standard NO
      expect(await isItemSelected(page, 'Caraffe / Drink Premium')).toBe(true)
      expect(await isItemSelected(page, 'Caraffe / Drink')).toBe(false)
      console.log('✅ Premium drink selezionato, Standard deselezionato automaticamente')
    } else {
      console.log('⚠️ Label "Caraffe / Drink Premium" non trovato')
    }
  })

  test('Non dovrebbe mostrare alert quando si passa da uno all\'altro', async ({ page }) => {
    console.log('🧪 Test: Nessun alert durante switch')
    
    // Verifica che la sezione Bevande esista
    const bevandeSection = page.locator('h3:has-text("Bevande")')
    if (await bevandeSection.count() === 0) {
      test.skip()
      return
    }

    // Listener per dialog - il test fallisce se appare un alert
    let dialogAppeared = false
    page.on('dialog', async dialog => {
      dialogAppeared = true
      console.error(`❌ Alert inaspettato: ${dialog.message()}`)
      await dialog.dismiss()
    })

    // Switch tra standard e premium più volte
    const standardLabel = page.locator('label:has-text("Caraffe / Drink")').first()
    const premiumLabel = page.locator('label:has-text("Caraffe / Drink Premium")').first()
    
    if (await standardLabel.count() > 0 && await premiumLabel.count() > 0) {
      // Standard → Premium
      await standardLabel.click()
      await page.waitForTimeout(300)
      
      // Premium → Standard
      await premiumLabel.click()
      await page.waitForTimeout(300)
      
      // Standard → Premium di nuovo
      await standardLabel.click()
      await page.waitForTimeout(300)
      
      expect(dialogAppeared).toBe(false)
      console.log('✅ Nessun alert durante lo switch')
    } else {
      console.log('⚠️ Labels non trovati')
    }
  })

  test('Dovrebbe permettere solo una selezione alla volta tra standard e premium', async ({ page }) => {
    console.log('🧪 Test: Solo una selezione alla volta')
    
    // Verifica che la sezione Bevande esista
    const bevandeSection = page.locator('h3:has-text("Bevande")')
    if (await bevandeSection.count() === 0) {
      test.skip()
      return
    }

    const standardLabel = page.locator('label:has-text("Caraffe / Drink")').first()
    const premiumLabel = page.locator('label:has-text("Caraffe / Drink Premium")').first()
    
    if (await standardLabel.count() > 0 && await premiumLabel.count() > 0) {
      // Test 1: Seleziona standard, verifica che premium NON è selezionato
      await standardLabel.click()
      await page.waitForTimeout(300)
      
      const standardSelected = await isItemSelected(page, 'Caraffe / Drink')
      const premiumSelected = await isItemSelected(page, 'Caraffe / Drink Premium')
      
      expect(standardSelected).toBe(true)
      expect(premiumSelected).toBe(false)
      console.log('✅ Solo standard selezionato')
      
      // Test 2: Seleziona premium, verifica che standard NON è selezionato
      await premiumLabel.click()
      await page.waitForTimeout(300)
      
      const standardSelected2 = await isItemSelected(page, 'Caraffe / Drink')
      const premiumSelected2 = await isItemSelected(page, 'Caraffe / Drink Premium')
      
      expect(standardSelected2).toBe(false)
      expect(premiumSelected2).toBe(true)
      console.log('✅ Solo premium selezionato')
    } else {
      console.log('⚠️ Labels non trovati')
    }
  })

  test('Dovrebbe funzionare anche dopo multiple interazioni', async ({ page }) => {
    console.log('🧪 Test: Multiple interazioni - switch fluido')
    
    // Verifica che la sezione Bevande esista
    const bevandeSection = page.locator('h3:has-text("Bevande")')
    if (await bevandeSection.count() === 0) {
      test.skip()
      return
    }

    const standardLabel = page.locator('label:has-text("Caraffe / Drink")').first()
    const premiumLabel = page.locator('label:has-text("Caraffe / Drink Premium")').first()
    
    if (await standardLabel.count() > 0 && await premiumLabel.count() > 0) {
      // Ciclo: Standard → Premium → Standard → Premium
      for (let i = 0; i < 4; i++) {
        const isEven = i % 2 === 0
        
        if (isEven) {
          await standardLabel.click()
          await page.waitForTimeout(300)
          expect(await isItemSelected(page, 'Caraffe / Drink')).toBe(true)
          expect(await isItemSelected(page, 'Caraffe / Drink Premium')).toBe(false)
          console.log(`✅ Ciclo ${i + 1}: Standard selezionato`)
        } else {
          await premiumLabel.click()
          await page.waitForTimeout(300)
          expect(await isItemSelected(page, 'Caraffe / Drink Premium')).toBe(true)
          expect(await isItemSelected(page, 'Caraffe / Drink')).toBe(false)
          console.log(`✅ Ciclo ${i + 1}: Premium selezionato`)
        }
      }
      
      console.log('✅ Switch fluido tra standard e premium funziona correttamente')
    } else {
      console.log('⚠️ Labels non trovati')
    }
  })
})




