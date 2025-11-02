import { test, expect } from '@playwright/test'

/**
 * Test: Mutua Esclusione Primi Piatti nel Form Pubblico
 * 
 * Verifica che:
 * 1. Selezionando un primo piatto, si deseleziona automaticamente quello precedente (se presente)
 * 2. Si può selezionare solo un primo piatto alla volta
 * 3. Lo switch avviene automaticamente senza alert/errori
 */

test.describe('Test Mutua Esclusione Primi Piatti - Form Pubblico', () => {
  
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

  // Helper per trovare tutti i primi piatti disponibili
  const findPrimiItems = async (page) => {
    const primiSection = page.locator('h3:has-text("Primi Piatti")')
    if (await primiSection.count() === 0) return []
    
    // Trova tutti i label nella sezione primi
    const primiLabels = await page.locator('h3:has-text("Primi Piatti")').locator('..').locator('label').all()
    const primiNames = []
    
    for (const label of primiLabels) {
      const text = await label.textContent()
      if (text && text.trim()) {
        // Estrai il nome (rimuovi il prezzo se presente)
        const name = text.split('€')[0].trim()
        if (name) {
          primiNames.push(name)
        }
      }
    }
    
    return primiNames.filter((v, i, a) => a.indexOf(v) === i) // rimuovi duplicati
  }

  test('Dovrebbe deselezionare automaticamente il primo piatto precedente quando se ne seleziona uno nuovo', async ({ page }) => {
    console.log('🧪 Test: Primo piatto → switch automatico')
    
    // Verifica che la sezione Primi esista
    const primiSection = page.locator('h3:has-text("Primi Piatti")')
    if (await primiSection.count() === 0) {
      test.skip()
      return
    }

    // Trova i primi disponibili
    const primiItems = await findPrimiItems(page)
    if (primiItems.length < 2) {
      console.log('⚠️ Non ci sono abbastanza primi piatti per testare (minimo 2 richiesti)')
      test.skip()
      return
    }

    const firstPrimo = primiItems[0]
    const secondPrimo = primiItems[1]

    console.log(`📝 Testing with: "${firstPrimo}" and "${secondPrimo}"`)

    // Step 1: Seleziona il primo piatto
    const firstLabel = page.locator(`label:has-text("${firstPrimo}")`).first()
    if (await firstLabel.count() > 0) {
      await firstLabel.click()
      await page.waitForTimeout(300)
      
      // Verifica che il primo è selezionato
      expect(await isItemSelected(page, firstPrimo)).toBe(true)
      console.log(`✅ ${firstPrimo} selezionato`)
    }

    // Step 2: Seleziona un secondo primo → dovrebbe deselezionare automaticamente il primo
    const secondLabel = page.locator(`label:has-text("${secondPrimo}")`).first()
    if (await secondLabel.count() > 0) {
      await secondLabel.click()
      await page.waitForTimeout(300)
      
      // Verifica che il secondo è selezionato e il primo NO
      expect(await isItemSelected(page, secondPrimo)).toBe(true)
      expect(await isItemSelected(page, firstPrimo)).toBe(false)
      console.log(`✅ ${secondPrimo} selezionato, ${firstPrimo} deselezionato automaticamente`)
    }
  })

  test('Non dovrebbe mostrare alert quando si passa da un primo all\'altro', async ({ page }) => {
    console.log('🧪 Test: Nessun alert durante switch primi')
    
    // Verifica che la sezione Primi esista
    const primiSection = page.locator('h3:has-text("Primi Piatti")')
    if (await primiSection.count() === 0) {
      test.skip()
      return
    }

    const primiItems = await findPrimiItems(page)
    if (primiItems.length < 2) {
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

    const firstPrimo = primiItems[0]
    const secondPrimo = primiItems[1]

    // Switch tra primi più volte
    const firstLabel = page.locator(`label:has-text("${firstPrimo}")`).first()
    const secondLabel = page.locator(`label:has-text("${secondPrimo}")`).first()
    
    if (await firstLabel.count() > 0 && await secondLabel.count() > 0) {
      // Primo → Secondo
      await firstLabel.click()
      await page.waitForTimeout(300)
      
      // Secondo → Primo
      await secondLabel.click()
      await page.waitForTimeout(300)
      
      // Primo → Secondo di nuovo
      await firstLabel.click()
      await page.waitForTimeout(300)
      
      expect(dialogAppeared).toBe(false)
      console.log('✅ Nessun alert durante lo switch tra primi')
    }
  })

  test('Dovrebbe permettere solo un primo piatto selezionato alla volta', async ({ page }) => {
    console.log('🧪 Test: Solo un primo alla volta')
    
    // Verifica che la sezione Primi esista
    const primiSection = page.locator('h3:has-text("Primi Piatti")')
    if (await primiSection.count() === 0) {
      test.skip()
      return
    }

    const primiItems = await findPrimiItems(page)
    if (primiItems.length < 2) {
      test.skip()
      return
    }

    const firstPrimo = primiItems[0]
    const secondPrimo = primiItems[1]
    const thirdPrimo = primiItems.length > 2 ? primiItems[2] : null

    // Test 1: Seleziona primo, verifica che è l'unico
    const firstLabel = page.locator(`label:has-text("${firstPrimo}")`).first()
    if (await firstLabel.count() > 0) {
      await firstLabel.click()
      await page.waitForTimeout(300)
      
      const firstSelected = await isItemSelected(page, firstPrimo)
      const secondSelected = await isItemSelected(page, secondPrimo)
      
      expect(firstSelected).toBe(true)
      expect(secondSelected).toBe(false)
      console.log(`✅ Solo ${firstPrimo} selezionato`)
    }

    // Test 2: Seleziona secondo, verifica che il primo è deselezionato
    const secondLabel = page.locator(`label:has-text("${secondPrimo}")`).first()
    if (await secondLabel.count() > 0) {
      await secondLabel.click()
      await page.waitForTimeout(300)
      
      const firstSelected2 = await isItemSelected(page, firstPrimo)
      const secondSelected2 = await isItemSelected(page, secondPrimo)
      
      expect(firstSelected2).toBe(false)
      expect(secondSelected2).toBe(true)
      console.log(`✅ Solo ${secondPrimo} selezionato`)
    }

    // Test 3: Se c'è un terzo primo, verifica lo switch
    if (thirdPrimo) {
      const thirdLabel = page.locator(`label:has-text("${thirdPrimo}")`).first()
      if (await thirdLabel.count() > 0) {
        await thirdLabel.click()
        await page.waitForTimeout(300)
        
        const secondSelected3 = await isItemSelected(page, secondPrimo)
        const thirdSelected3 = await isItemSelected(page, thirdPrimo)
        
        expect(secondSelected3).toBe(false)
        expect(thirdSelected3).toBe(true)
        console.log(`✅ Solo ${thirdPrimo} selezionato`)
      }
    }
  })

  test('Dovrebbe funzionare correttamente anche dopo multiple interazioni', async ({ page }) => {
    console.log('🧪 Test: Multiple interazioni - switch fluido tra primi')
    
    // Verifica che la sezione Primi esista
    const primiSection = page.locator('h3:has-text("Primi Piatti")')
    if (await primiSection.count() === 0) {
      test.skip()
      return
    }

    const primiItems = await findPrimiItems(page)
    if (primiItems.length < 2) {
      test.skip()
      return
    }

    const firstPrimo = primiItems[0]
    const secondPrimo = primiItems[1]
    const thirdPrimo = primiItems.length > 2 ? primiItems[2] : firstPrimo

    const firstLabel = page.locator(`label:has-text("${firstPrimo}")`).first()
    const secondLabel = page.locator(`label:has-text("${secondPrimo}")`).first()
    const thirdLabel = page.locator(`label:has-text("${thirdPrimo}")`).first()

    if (await firstLabel.count() > 0 && await secondLabel.count() > 0 && await thirdLabel.count() > 0) {
      // Ciclo tra i primi più volte
      const items = [firstPrimo, secondPrimo, thirdPrimo]
      const labels = [firstLabel, secondLabel, thirdLabel]
      
      for (let i = 0; i < 6; i++) {
        const index = i % items.length
        const currentPrimo = items[index]
        const currentLabel = labels[index]
        
        await currentLabel.click()
        await page.waitForTimeout(300)
        
        // Verifica che solo il corrente è selezionato
        expect(await isItemSelected(page, currentPrimo)).toBe(true)
        
        // Verifica che gli altri non sono selezionati
        for (let j = 0; j < items.length; j++) {
          if (j !== index) {
            expect(await isItemSelected(page, items[j])).toBe(false)
          }
        }
        
        console.log(`✅ Ciclo ${i + 1}: ${currentPrimo} selezionato`)
      }
      
      console.log('✅ Switch fluido tra primi funziona correttamente')
    }
  })
})




