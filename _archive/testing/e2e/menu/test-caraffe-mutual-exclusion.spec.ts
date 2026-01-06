import { test, expect } from '@playwright/test'

/**
 * Test per verificare che la logica mutual exclusion delle caraffe funzioni correttamente
 * Skill: verification-before-completion - Verifica visiva obiettiva
 */

test.describe('Logica Caraffe - Mutual Exclusion', () => {
  test('Selezionare Caraffe / Drink rimuove automaticamente Caraffe / Drink Premium', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:5175/prenota')

    await page.waitForSelector('form', { timeout: 10000 })
    
    // Seleziona "Rinfresco di Laurea"
    await page.selectOption('#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(2000)

    // Trova "Caraffe / Drink Premium" e selezionalo
    const premiumCheckbox = page.locator('label').filter({ hasText: /Caraffe \/ Drink Premium/i }).first()
    await expect(premiumCheckbox).toBeVisible()
    await premiumCheckbox.click()
    await page.waitForTimeout(500)

    // Verifica che Premium sia selezionato
    const premiumInput = premiumCheckbox.locator('input[type="checkbox"]')
    await expect(premiumInput).toBeChecked()

    // Trova "Caraffe / Drink" standard e selezionalo
    const standardCheckbox = page.locator('label').filter({ hasText: /^Caraffe \/ Drink$/ }).first()
    await expect(standardCheckbox).toBeVisible()
    await standardCheckbox.click()
    await page.waitForTimeout(500)

    // Verifica che Standard sia selezionato
    const standardInput = standardCheckbox.locator('input[type="checkbox"]')
    await expect(standardInput).toBeChecked()

    // Verifica che Premium sia stato deselezionato automaticamente
    await expect(premiumInput).not.toBeChecked()

    console.log('✅ Test 1: Caraffe / Drink rimuove Premium - PASSATO')

    // Screenshot
    await page.screenshot({
      path: 'e2e/screenshots/caraffe-mutual-exclusion-test1.png',
      fullPage: true
    })
  })

  test('Selezionare Caraffe / Drink Premium rimuove automaticamente Caraffe / Drink', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:5175/prenota')

    await page.waitForSelector('form', { timeout: 10000 })
    
    // Seleziona "Rinfresco di Laurea"
    await page.selectOption('#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(2000)

    // Trova "Caraffe / Drink" standard e selezionalo
    const standardCheckbox = page.locator('label').filter({ hasText: /^Caraffe \/ Drink$/ }).first()
    await expect(standardCheckbox).toBeVisible()
    await standardCheckbox.click()
    await page.waitForTimeout(500)

    // Verifica che Standard sia selezionato
    const standardInput = standardCheckbox.locator('input[type="checkbox"]')
    await expect(standardInput).toBeChecked()

    // Trova "Caraffe / Drink Premium" e selezionalo
    const premiumCheckbox = page.locator('label').filter({ hasText: /Caraffe \/ Drink Premium/i }).first()
    await expect(premiumCheckbox).toBeVisible()
    await premiumCheckbox.click()
    await page.waitForTimeout(500)

    // Verifica che Premium sia selezionato
    const premiumInput = premiumCheckbox.locator('input[type="checkbox"]')
    await expect(premiumInput).toBeChecked()

    // Verifica che Standard sia stato deselezionato automaticamente
    await expect(standardInput).not.toBeChecked()

    console.log('✅ Test 2: Caraffe / Drink Premium rimuove Standard - PASSATO')

    // Screenshot
    await page.screenshot({
      path: 'e2e/screenshots/caraffe-mutual-exclusion-test2.png',
      fullPage: true
    })
  })

  test('Counter bevande mostra 1/1 quando caraffe è selezionata', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:5175/prenota')

    await page.waitForSelector('form', { timeout: 10000 })
    
    // Seleziona "Rinfresco di Laurea"
    await page.selectOption('#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(2000)

    // Trova "Caraffe / Drink" e selezionalo
    const standardCheckbox = page.locator('label').filter({ hasText: /^Caraffe \/ Drink$/ }).first()
    await expect(standardCheckbox).toBeVisible()
    await standardCheckbox.click()
    await page.waitForTimeout(500)

    // Verifica che il counter mostri "1/1"
    const bevandeHeader = page.locator('h3').filter({ hasText: /Bevande/i }).first()
    await expect(bevandeHeader).toContainText('1/1 selezionato')

    console.log('✅ Test 3: Counter mostra 1/1 quando caraffe selezionata - PASSATO')

    // Screenshot
    await page.screenshot({
      path: 'e2e/screenshots/caraffe-counter-1-1.png',
      fullPage: true
    })
  })
})













