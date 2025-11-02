import { test, expect } from '@playwright/test'

/**
 * TEST EMPIRICO: Verifica logica mutual exclusion caraffe
 * Skill: verification-before-completion - TEST OBBLIGATORIO PRIMA DI DICHIARARE COMPLETATO
 */

test.describe('Verifica Empirica: Logica Caraffe Mutual Exclusion', () => {
  test('DEVE FUNZIONARE: Selezione Caraffe/Drink rimuove Caraffe/Drink Premium', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:5173/prenota', { waitUntil: 'networkidle' })

    await page.waitForSelector('form', { timeout: 15000 })
    
    // Seleziona "Rinfresco di Laurea"
    await page.selectOption('#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(3000) // Attendi caricamento completo menu

    // TROVA "Caraffe Drink Premium" (nomi reali: "Caraffe Drink Premium" senza slash)
    const premiumLabels = page.locator('label').filter({ hasText: /Caraffe.*Drink.*Premium/i })
    const premiumCount = await premiumLabels.count()
    console.log(`\n🔍 Trovate ${premiumCount} label con "Caraffe Drink Premium"`)
    
    if (premiumCount === 0) {
      await page.screenshot({ path: 'e2e/screenshots/ERROR-no-premium-found.png', fullPage: true })
      throw new Error('NON TROVATO: Caraffe Drink Premium nel menu')
    }

    const premiumCheckbox = premiumLabels.first()
    await expect(premiumCheckbox).toBeVisible({ timeout: 5000 })
    
    // CLICCA Premium
    await premiumCheckbox.click()
    await page.waitForTimeout(1000)

    // VERIFICA: Premium è selezionato
    const premiumInput = premiumCheckbox.locator('input[type="checkbox"]')
    const isPremiumChecked = await premiumInput.isChecked()
    console.log(`✅ Premium selezionato: ${isPremiumChecked}`)
    expect(isPremiumChecked).toBe(true)

    // TROVA "Caraffe drink" (standard, SENZA Premium nel testo, senza slash)
    const standardLabels = page.locator('label').filter({ hasText: /Caraffe.*drink/i }).filter({ hasNotText: /Premium/i })
    const standardCount = await standardLabels.count()
    console.log(`🔍 Trovate ${standardCount} label con "Caraffe drink" (senza Premium)`)
    
    if (standardCount === 0) {
      await page.screenshot({ path: 'e2e/screenshots/ERROR-no-standard-found.png', fullPage: true })
      throw new Error('NON TROVATO: Caraffe drink standard nel menu')
    }

    const standardCheckbox = standardLabels.first()
    await expect(standardCheckbox).toBeVisible({ timeout: 5000 })
    
    // CLICCA Standard
    await standardCheckbox.click()
    await page.waitForTimeout(1000)

    // VERIFICA EMPIRICA: Standard è selezionato
    const standardInput = standardCheckbox.locator('input[type="checkbox"]')
    const isStandardChecked = await standardInput.isChecked()
    console.log(`✅ Standard selezionato: ${isStandardChecked}`)
    expect(isStandardChecked).toBe(true)

    // VERIFICA EMPIRICA: Premium è stato DESELETTATO automaticamente
    const isPremiumStillChecked = await premiumInput.isChecked()
    console.log(`✅ Premium ancora selezionato dopo click Standard: ${isPremiumStillChecked}`)
    
    if (isPremiumStillChecked) {
      await page.screenshot({ path: 'e2e/screenshots/FAIL-premium-not-deselected.png', fullPage: true })
      throw new Error('FALLITO: Premium NON è stato deselezionato quando Standard è stato selezionato')
    }

    expect(isPremiumStillChecked).toBe(false)
    console.log('\n✅ TEST PASSATO: Caraffe/Drink rimuove Premium correttamente')

    // Screenshot finale
    await page.screenshot({
      path: 'e2e/screenshots/PASS-caraffe-mutual-exclusion-test1.png',
      fullPage: true
    })
  })

  test('DEVE FUNZIONARE: Selezione Caraffe/Drink Premium rimuove Caraffe/Drink', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:5173/prenota', { waitUntil: 'networkidle' })

    await page.waitForSelector('form', { timeout: 15000 })
    await page.selectOption('#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(3000)

    // Seleziona Standard PRIMA (nome reale: "Caraffe drink" senza slash)
    const standardCheckbox = page.locator('label').filter({ hasText: /Caraffe.*drink/i }).filter({ hasNotText: /Premium/i }).first()
    await expect(standardCheckbox).toBeVisible({ timeout: 5000 })
    await standardCheckbox.click()
    await page.waitForTimeout(1000)

    const standardInput = standardCheckbox.locator('input[type="checkbox"]')
    expect(await standardInput.isChecked()).toBe(true)

    // Seleziona Premium
    const premiumCheckbox = page.locator('label').filter({ hasText: /Caraffe.*Drink.*Premium/i }).first()
    await expect(premiumCheckbox).toBeVisible({ timeout: 5000 })
    await premiumCheckbox.click()
    await page.waitForTimeout(1000)

    // VERIFICA: Premium selezionato, Standard deselezionato
    const premiumInput = premiumCheckbox.locator('input[type="checkbox"]')
    expect(await premiumInput.isChecked()).toBe(true)
    expect(await standardInput.isChecked()).toBe(false)

    console.log('\n✅ TEST PASSATO: Caraffe/Drink Premium rimuove Standard correttamente')

    await page.screenshot({
      path: 'e2e/screenshots/PASS-caraffe-mutual-exclusion-test2.png',
      fullPage: true
    })
  })

  test('DEVE FUNZIONARE: Solo una caraffe può essere selezionata alla volta', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:5173/prenota', { waitUntil: 'networkidle' })

    await page.waitForSelector('form', { timeout: 15000 })
    await page.selectOption('#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(3000)

    const standardCheckbox = page.locator('label').filter({ hasText: /Caraffe.*drink/i }).filter({ hasNotText: /Premium/i }).first()
    const premiumCheckbox = page.locator('label').filter({ hasText: /Caraffe.*Drink.*Premium/i }).first()

    await expect(standardCheckbox).toBeVisible({ timeout: 5000 })
    await expect(premiumCheckbox).toBeVisible({ timeout: 5000 })

    // Seleziona entrambi (sequenzialmente)
    await standardCheckbox.click()
    await page.waitForTimeout(500)
    await premiumCheckbox.click()
    await page.waitForTimeout(1000)

    // VERIFICA EMPIRICA: Solo uno deve essere selezionato
    const standardInput = standardCheckbox.locator('input[type="checkbox"]')
    const premiumInput = premiumCheckbox.locator('input[type="checkbox"]')

    const standardChecked = await standardInput.isChecked()
    const premiumChecked = await premiumInput.isChecked()

    console.log(`\n🔍 Standard checked: ${standardChecked}`)
    console.log(`🔍 Premium checked: ${premiumChecked}`)

    // Calcola quante caraffe sono selezionate
    const totalCaraffeSelected = (standardChecked ? 1 : 0) + (premiumChecked ? 1 : 0)
    console.log(`✅ Totale caraffe selezionate: ${totalCaraffeSelected}`)

    if (totalCaraffeSelected !== 1) {
      await page.screenshot({ path: 'e2e/screenshots/FAIL-multiple-caraffe-selected.png', fullPage: true })
      throw new Error(`FALLITO: ${totalCaraffeSelected} caraffe selezionate invece di 1`)
    }

    expect(totalCaraffeSelected).toBe(1)
    console.log('\n✅ TEST PASSATO: Solo una caraffe può essere selezionata')
  })
})

