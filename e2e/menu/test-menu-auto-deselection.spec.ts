import { test, expect } from '@playwright/test'

/**
 * Test Suite: Menu Auto-Deselection UX
 *
 * Tests that mutually exclusive items auto-deselect instead of showing alerts:
 * 1. Bevande: Selecting standard drink auto-deselects premium (and vice versa)
 * 2. Antipasti: Selecting a pizza/focaccia auto-deselects other pizzas/focaccias
 */

test.describe('Menu Auto-Deselection UX', () => {

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

  // Helper to check if item is selected (background color check)
  const isItemSelected = async (page, itemText: string) => {
    const label = page.locator(`label:has-text("${itemText}")`).first()
    const bgColor = await label.evaluate(el => window.getComputedStyle(el).backgroundColor)
    // Selected items have rgba(245, 222, 179, 0.6)
    return bgColor.includes('245, 222, 179')
  }

  test.beforeEach(async ({ page }) => {
    await adminLogin(page)
    await openBookingForm(page)
    await scrollToMenu(page)
  })

  test('BEVANDE: Should auto-deselect standard drink when premium is selected', async ({ page }) => {
    // Step 1: Select standard drink
    await page.click('text=Caraffe / Drink')
    await page.waitForTimeout(300) // Wait for state update

    // Verify standard drink is selected
    expect(await isItemSelected(page, 'Caraffe / Drink')).toBe(true)

    // Step 2: Select premium drink - should auto-deselect standard
    await page.click('text=Caraffe / Drink Premium')
    await page.waitForTimeout(300) // Wait for state update

    // Verify premium is selected and standard is NOT selected
    expect(await isItemSelected(page, 'Caraffe / Drink Premium')).toBe(true)
    expect(await isItemSelected(page, 'Caraffe / Drink')).toBe(false)
  })

  test('BEVANDE: Should auto-deselect premium drink when standard is selected', async ({ page }) => {
    // Step 1: Select premium drink
    await page.click('text=Caraffe / Drink Premium')
    await page.waitForTimeout(300)

    // Verify premium drink is selected
    expect(await isItemSelected(page, 'Caraffe / Drink Premium')).toBe(true)

    // Step 2: Select standard drink - should auto-deselect premium
    await page.click('text=Caraffe / Drink')
    await page.waitForTimeout(300)

    // Verify standard is selected and premium is NOT selected
    expect(await isItemSelected(page, 'Caraffe / Drink')).toBe(true)
    expect(await isItemSelected(page, 'Caraffe / Drink Premium')).toBe(false)
  })

  test('BEVANDE: Should not show alert when switching between drink groups', async ({ page }) => {
    // Set up dialog listener - test should fail if dialog appears
    page.on('dialog', async dialog => {
      throw new Error(`Unexpected alert: ${dialog.message()}`)
    })

    // Select standard, then premium - no alert should appear
    await page.click('text=Caraffe / Drink')
    await page.waitForTimeout(300)
    await page.click('text=Caraffe / Drink Premium')
    await page.waitForTimeout(300)

    // If we get here without error, test passes
    expect(await isItemSelected(page, 'Caraffe / Drink Premium')).toBe(true)
  })

  test('ANTIPASTI: Should auto-deselect Pizza Margherita when Pizza rossa is selected', async ({ page }) => {
    // Step 1: Select Pizza Margherita
    await page.click('text=Pizza Margherita')
    await page.waitForTimeout(300)

    expect(await isItemSelected(page, 'Pizza Margherita')).toBe(true)

    // Step 2: Select Pizza rossa - should auto-deselect Margherita
    await page.click('text=Pizza rossa')
    await page.waitForTimeout(300)

    expect(await isItemSelected(page, 'Pizza rossa')).toBe(true)
    expect(await isItemSelected(page, 'Pizza Margherita')).toBe(false)
  })

  test('ANTIPASTI: Should auto-deselect pizza when Focaccia is selected', async ({ page }) => {
    // Step 1: Select Pizza Margherita
    await page.click('text=Pizza Margherita')
    await page.waitForTimeout(300)

    expect(await isItemSelected(page, 'Pizza Margherita')).toBe(true)

    // Step 2: Select Focaccia - should auto-deselect pizza
    await page.click('text=Focaccia Rosmarino')
    await page.waitForTimeout(300)

    expect(await isItemSelected(page, 'Focaccia Rosmarino')).toBe(true)
    expect(await isItemSelected(page, 'Pizza Margherita')).toBe(false)
  })

  test('ANTIPASTI: Should preserve other antipasti when switching pizzas', async ({ page }) => {
    // Step 1: Select non-pizza antipasti
    await page.click('text=Farinata')
    await page.click('text=Caprese')
    await page.waitForTimeout(300)

    // Step 2: Select Pizza Margherita
    await page.click('text=Pizza Margherita')
    await page.waitForTimeout(300)

    // Step 3: Switch to Pizza rossa
    await page.click('text=Pizza rossa')
    await page.waitForTimeout(300)

    // Verify: Pizza rossa selected, Margherita not selected, but Farinata and Caprese still selected
    expect(await isItemSelected(page, 'Pizza rossa')).toBe(true)
    expect(await isItemSelected(page, 'Pizza Margherita')).toBe(false)
    expect(await isItemSelected(page, 'Farinata')).toBe(true)
    expect(await isItemSelected(page, 'Caprese')).toBe(true)
  })

  test('ANTIPASTI: Should not show alert when switching between pizzas', async ({ page }) => {
    // Set up dialog listener - test should fail if dialog appears
    page.on('dialog', async dialog => {
      throw new Error(`Unexpected alert: ${dialog.message()}`)
    })

    // Select Margherita, then switch to rossa - no alert should appear
    await page.click('text=Pizza Margherita')
    await page.waitForTimeout(300)
    await page.click('text=Pizza rossa')
    await page.waitForTimeout(300)

    expect(await isItemSelected(page, 'Pizza rossa')).toBe(true)
  })

  test('ANTIPASTI: Should cycle through all three pizza/focaccia options smoothly', async ({ page }) => {
    // Margherita → rossa → Focaccia → Margherita
    await page.click('text=Pizza Margherita')
    await page.waitForTimeout(300)
    expect(await isItemSelected(page, 'Pizza Margherita')).toBe(true)

    await page.click('text=Pizza rossa')
    await page.waitForTimeout(300)
    expect(await isItemSelected(page, 'Pizza rossa')).toBe(true)
    expect(await isItemSelected(page, 'Pizza Margherita')).toBe(false)

    await page.click('text=Focaccia Rosmarino')
    await page.waitForTimeout(300)
    expect(await isItemSelected(page, 'Focaccia Rosmarino')).toBe(true)
    expect(await isItemSelected(page, 'Pizza rossa')).toBe(false)

    await page.click('text=Pizza Margherita')
    await page.waitForTimeout(300)
    expect(await isItemSelected(page, 'Pizza Margherita')).toBe(true)
    expect(await isItemSelected(page, 'Focaccia Rosmarino')).toBe(false)
  })
})

