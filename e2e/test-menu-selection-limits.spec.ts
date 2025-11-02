import { test, expect } from '@playwright/test'

/**
 * Test Suite: Menu Selection Limits
 *
 * Tests all category-specific selection rules:
 * 1. Bevande: Mutual exclusion (Caraffe/Drink OR Caraffe/Drink Premium, not both)
 * 2. Antipasti: Max 3 items total + Pizza/Focaccia exclusion
 * 3. Fritti: Max 3 items
 * 4. Primi: Max 1 item (existing rule)
 * 5. Secondi: Max 3 items
 */

test.describe('Menu Selection Limits', () => {

  // Helper to login as admin
  const adminLogin = async (page) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill('#email', '0cavuz0@gmail.com')
    await page.fill('#password', 'Cavallaro')
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i })
    await submitButton.click()
    await page.waitForTimeout(3000)
    const currentUrl = page.url()
    if (!currentUrl.includes('/admin')) {
      throw new Error('Login failed - not redirected to admin dashboard')
    }
  }

  // Helper to open booking form
  const openBookingForm = async (page) => {
    await page.click('button:has-text("Aggiungi Nuova Prenotazione")')
    await page.waitForSelector('text=Dati Cliente', { timeout: 5000 })
  }

  // Helper to scroll menu section into view
  const scrollToMenu = async (page) => {
    const menuSection = page.locator('h2:has-text("Menù")')
    await menuSection.scrollIntoViewIfNeeded()
  }

  test.beforeEach(async ({ page }) => {
    await adminLogin(page)
    await openBookingForm(page)
    await scrollToMenu(page)
  })

  test('BEVANDE: Should block selecting both standard and premium drinks', async ({ page }) => {
    // Select standard drink first
    await page.click('text=Caraffe / Drink')

    // Try to select premium drink - should be blocked
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Puoi scegliere solo Caraffe/Drink O Caraffe/Drink Premium, non entrambi')
      await dialog.accept()
    })
    await page.click('text=Caraffe / Drink Premium')

    // Verify standard drink is still selected, premium is not
    await expect(page.locator('label:has-text("Caraffe / Drink")')).toHaveCSS('background-color', /rgba\(245, 222, 179/)
    await expect(page.locator('label:has-text("Caraffe / Drink Premium")')).not.toHaveCSS('background-color', /rgba\(245, 222, 179/)
  })

  test('BEVANDE: Should block selecting standard drink if premium already selected', async ({ page }) => {
    // Select premium drink first
    await page.click('text=Caraffe / Drink Premium')

    // Try to select standard drink - should be blocked
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Puoi scegliere solo Caraffe/Drink O Caraffe/Drink Premium, non entrambi')
      await dialog.accept()
    })
    await page.click('text=Caraffe / Drink')

    // Verify premium drink is still selected, standard is not
    await expect(page.locator('label:has-text("Caraffe / Drink Premium")')).toHaveCSS('background-color', /rgba\(245, 222, 179/)
    await expect(page.locator('label:has-text("Caraffe / Drink")').first()).not.toHaveCSS('background-color', /rgba\(245, 222, 179/)
  })

  test('ANTIPASTI: Should block selecting more than 3 items', async ({ page }) => {
    // Select 3 antipasti
    await page.click('text=Pizza Margherita')
    await page.click('text=Farinata')
    await page.click('text=Caprese')

    // Try to select 4th - should be blocked
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Puoi scegliere massimo 3 antipasti')
      await dialog.accept()
    })
    await page.click('text=Salumi con piadina')

    // Verify only 3 selected
    const selectedAntipasti = page.locator('label:has-text("Antipasti") ~ div label').filter({
      has: page.locator('[style*="rgba(245, 222, 179"]')
    })
    await expect(selectedAntipasti).toHaveCount(3)
  })

  test('ANTIPASTI: Should block selecting second pizza/focaccia', async ({ page }) => {
    // Select Pizza Margherita
    await page.click('text=Pizza Margherita')

    // Try to select Pizza rossa - should be blocked
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Puoi scegliere solo una tra Pizza Margherita, Pizza Rossa o Focaccia Rosmarino')
      await dialog.accept()
    })
    await page.click('text=Pizza rossa')

    // Try to select Focaccia - should also be blocked
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Puoi scegliere solo una tra Pizza Margherita, Pizza Rossa o Focaccia Rosmarino')
      await dialog.accept()
    })
    await page.click('text=Focaccia Rosmarino')
  })

  test('FRITTI: Should block selecting more than 3 items', async ({ page }) => {
    // Select 3 fritti
    await page.click('text=Olive Ascolana')
    await page.click('text=Anelli di Cipolla')
    await page.click('text=Patatine fritte')

    // Try to select 4th - should be blocked
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Puoi scegliere massimo 3 fritti')
      await dialog.accept()
    })
    await page.click('text=Camembert')
  })

  test('PRIMI: Should block selecting more than 1 item (existing rule)', async ({ page }) => {
    // Select first primo
    await page.click('text=Lasagne Ragù')

    // Try to select second primo - should be blocked
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Puoi selezionare solo un primo piatto')
      await dialog.accept()
    })
    await page.click('text=Cannelloni Ricotta e Spinaci')
  })

  test('SECONDI: Should block selecting more than 3 items', async ({ page }) => {
    // Select 3 secondi
    await page.click('text=Polpette di carne')
    await page.click('text=Polpette di melanzane')
    await page.click('text=Polpette Patate e Mortadella')

    // Try to select 4th - should be blocked
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Puoi scegliere massimo 3 secondi')
      await dialog.accept()
    })
    await page.click('text=Polpette Salsiccia e friarielli')
  })

  test('Should allow deselecting items and selecting within new limits', async ({ page }) => {
    // Select 3 antipasti
    await page.click('text=Pizza Margherita')
    await page.click('text=Farinata')
    await page.click('text=Caprese')

    // Deselect one
    await page.click('text=Farinata')

    // Now should be able to select another
    await page.click('text=Salumi con piadina')

    // Should have 3 selected (Pizza, Caprese, Salumi)
    await expect(page.locator('label:has-text("Pizza Margherita")')).toHaveCSS('background-color', /rgba\(245, 222, 179/)
    await expect(page.locator('label:has-text("Caprese")')).toHaveCSS('background-color', /rgba\(245, 222, 179/)
    await expect(page.locator('label:has-text("Salumi con piadina")')).toHaveCSS('background-color', /rgba\(245, 222, 179/)
  })

  test('Should show visual counters for categories with limits', async ({ page }) => {
    // Check antipasti counter shows 0/3
    const antipastiHeader = page.locator('h3:has-text("Antipasti")')
    await expect(antipastiHeader).toContainText('0/3')

    // Select 2 antipasti
    await page.click('text=Pizza Margherita')
    await page.click('text=Farinata')

    // Counter should show 2/3
    await expect(antipastiHeader).toContainText('2/3')

    // Check other category counters
    await expect(page.locator('h3:has-text("Fritti")')).toContainText('0/3')
    await expect(page.locator('h3:has-text("Primi Piatti")')).toContainText('0/1')
    await expect(page.locator('h3:has-text("Secondi Piatti")')).toContainText('0/3')
  })
})
