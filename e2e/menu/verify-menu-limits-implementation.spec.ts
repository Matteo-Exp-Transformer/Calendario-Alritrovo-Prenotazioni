import { test, expect } from '@playwright/test'

/**
 * Quick Verification Test: Menu Selection Limits Implementation
 *
 * This test verifies that all 5 category rules are properly implemented:
 * 1. Bevande: Mutual exclusion between standard and premium
 * 2. Antipasti: Max 3 items + Pizza/Focaccia exclusion
 * 3. Fritti: Max 3 items
 * 4. Primi: Max 1 item
 * 5. Secondi: Max 3 items
 */

test.describe('Verify Menu Limits Implementation', () => {

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill('#email', '0cavuz0@gmail.com')
    await page.fill('#password', 'Cavallaro')
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i })
    await submitButton.click()
    await page.waitForTimeout(3000)

    // Open booking form
    await page.click('button:has-text("Aggiungi Nuova Prenotazione")')
    await page.waitForTimeout(2000)

    // Scroll to menu section
    const menuSection = page.locator('h2:has-text("Menù")')
    await menuSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)
  })

  test('Should show counters for categories with limits', async ({ page }) => {
    // Check that headers show counters
    await expect(page.locator('h3:has-text("Antipasti")')).toContainText('/3')
    await expect(page.locator('h3:has-text("Fritti")')).toContainText('/3')
    await expect(page.locator('h3:has-text("Primi Piatti")')).toContainText('/1')
    await expect(page.locator('h3:has-text("Secondi Piatti")')).toContainText('/3')

    console.log('✅ All category counters are visible')

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/menu-limits-counters.png',
      fullPage: true
    })
  })

  test('ANTIPASTI: Should block 4th item with alert', async ({ page }) => {
    // Select 3 antipasti
    await page.click('text=Pizza Margherita')
    await page.waitForTimeout(500)
    await page.click('text=Farinata')
    await page.waitForTimeout(500)
    await page.click('text=Caprese')
    await page.waitForTimeout(500)

    // Verify counter shows 3/3
    await expect(page.locator('h3:has-text("Antipasti")')).toContainText('3/3')

    // Try to select 4th - should show alert
    page.once('dialog', async dialog => {
      console.log('Alert message:', dialog.message())
      expect(dialog.message()).toContain('massimo 3 antipasti')
      await dialog.accept()
    })

    await page.click('text=Salumi con piadina')
    await page.waitForTimeout(1000)

    // Counter should still show 3/3
    await expect(page.locator('h3:has-text("Antipasti")')).toContainText('3/3')

    console.log('✅ Antipasti max 3 limit enforced')
  })

  test('FRITTI: Should block 4th item with alert', async ({ page }) => {
    // Select 3 fritti
    await page.click('text=Olive Ascolana')
    await page.waitForTimeout(500)
    await page.click('text=Anelli di Cipolla')
    await page.waitForTimeout(500)
    await page.click('text=Patatine fritte')
    await page.waitForTimeout(500)

    // Verify counter shows 3/3
    await expect(page.locator('h3:has-text("Fritti")')).toContainText('3/3')

    // Try to select 4th - should show alert
    page.once('dialog', async dialog => {
      console.log('Alert message:', dialog.message())
      expect(dialog.message()).toContain('massimo 3 fritti')
      await dialog.accept()
    })

    await page.click('text=Camembert')
    await page.waitForTimeout(1000)

    // Counter should still show 3/3
    await expect(page.locator('h3:has-text("Fritti")')).toContainText('3/3')

    console.log('✅ Fritti max 3 limit enforced')
  })

  test('SECONDI: Should block 4th item with alert', async ({ page }) => {
    // Select 3 secondi
    await page.click('text=Polpette di carne')
    await page.waitForTimeout(500)
    await page.click('text=Polpette di melanzane')
    await page.waitForTimeout(500)
    await page.click('text=Polpette Patate e Mortadella')
    await page.waitForTimeout(500)

    // Verify counter shows 3/3
    await expect(page.locator('h3:has-text("Secondi Piatti")')).toContainText('3/3')

    // Try to select 4th - should show alert
    page.once('dialog', async dialog => {
      console.log('Alert message:', dialog.message())
      expect(dialog.message()).toContain('massimo 3 secondi')
      await dialog.accept()
    })

    await page.click('text=Polpette Salsiccia e friarielli')
    await page.waitForTimeout(1000)

    // Counter should still show 3/3
    await expect(page.locator('h3:has-text("Secondi Piatti")')).toContainText('3/3')

    console.log('✅ Secondi max 3 limit enforced')
  })

  test('PRIMI: Should block 2nd item with alert (existing rule)', async ({ page }) => {
    // Select first primo
    await page.click('text=Lasagne Ragù')
    await page.waitForTimeout(500)

    // Verify counter shows 1/1
    await expect(page.locator('h3:has-text("Primi Piatti")')).toContainText('1/1')

    // Try to select 2nd - should show alert
    page.once('dialog', async dialog => {
      console.log('Alert message:', dialog.message())
      expect(dialog.message()).toContain('solo un primo piatto')
      await dialog.accept()
    })

    await page.click('text=Cannelloni Ricotta e Spinaci')
    await page.waitForTimeout(1000)

    // Counter should still show 1/1
    await expect(page.locator('h3:has-text("Primi Piatti")')).toContainText('1/1')

    console.log('✅ Primi max 1 limit enforced')
  })

  test('ANTIPASTI: Should block 2nd pizza/focaccia', async ({ page }) => {
    // Select Pizza Margherita
    await page.click('text=Pizza Margherita')
    await page.waitForTimeout(500)

    // Try to select Pizza rossa - should show alert
    page.once('dialog', async dialog => {
      console.log('Alert message:', dialog.message())
      expect(dialog.message()).toContain('Pizza Margherita, Pizza Rossa o Focaccia Rosmarino')
      await dialog.accept()
    })

    await page.click('text=Pizza rossa')
    await page.waitForTimeout(1000)

    console.log('✅ Pizza/Focaccia exclusion enforced')
  })

  test('BEVANDE: Should block mixing standard and premium drinks', async ({ page }) => {
    // Select standard drink
    await page.click('text=Caraffe / Drink')
    await page.waitForTimeout(500)

    // Try to select premium - should show alert
    page.once('dialog', async dialog => {
      console.log('Alert message:', dialog.message())
      expect(dialog.message()).toContain('Caraffe/Drink O Caraffe/Drink Premium')
      await dialog.accept()
    })

    await page.click('text=Caraffe / Drink Premium')
    await page.waitForTimeout(1000)

    console.log('✅ Bevande mutual exclusion enforced')
  })

  test('Should update counter when item is deselected', async ({ page }) => {
    // Select 2 antipasti
    await page.click('text=Pizza Margherita')
    await page.waitForTimeout(500)
    await page.click('text=Farinata')
    await page.waitForTimeout(500)

    // Verify counter shows 2/3
    await expect(page.locator('h3:has-text("Antipasti")')).toContainText('2/3')

    // Deselect one
    await page.click('text=Farinata')
    await page.waitForTimeout(500)

    // Counter should show 1/3
    await expect(page.locator('h3:has-text("Antipasti")')).toContainText('1/3')

    console.log('✅ Counter updates correctly on deselection')
  })
})

