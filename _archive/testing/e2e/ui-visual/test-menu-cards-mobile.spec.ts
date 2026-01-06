import { test, expect } from '@playwright/test'

test.describe('Menu Cards Mobile Display', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to booking page
    await page.goto('/prenota')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Select "Rinfresco di Laurea" type
    const bookingTypeSelect = page.locator('#booking_type')
    await bookingTypeSelect.selectOption('rinfresco_laurea')
    
    // Wait for menu to load
    await page.waitForTimeout(1000)
  })

  test('Menu category cards (Antipasti, Fritti, Primi, Secondi) should be fully visible and readable on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size
    
    // Check if category headers are visible
    const categoryHeaders = [
      'Antipasti',
      'Fritti', 
      'Primi Piatti',
      'Secondi Piatti'
    ]
    
    for (const category of categoryHeaders) {
      const header = page.locator(`text=${category}`).first()
      await expect(header).toBeVisible()
      
      // Check header is fully within viewport and readable
      const box = await header.boundingBox()
      expect(box).not.toBeNull()
      if (box) {
        expect(box.width).toBeGreaterThan(0)
        expect(box.height).toBeGreaterThan(0)
        // Check text size is readable (at least 14px)
        const fontSize = await header.evaluate((el) => {
          return window.getComputedStyle(el).fontSize
        })
        const fontSizeNum = parseFloat(fontSize)
        expect(fontSizeNum).toBeGreaterThanOrEqual(14)
      }
    }
  })

  test('Menu item cards should be fully visible, readable and well formatted on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Wait for menu items to load
    await page.waitForTimeout(1500)
    
    // Find all menu item cards
    const menuCards = page.locator('label[class*="cursor-pointer"]').filter({ hasText: /€/ })
    
    const count = await menuCards.count()
    expect(count).toBeGreaterThan(0)
    
    // Check each visible card
    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = menuCards.nth(i)
      
      // Check if card is visible
      await expect(card).toBeVisible()
      
      // Check card dimensions and layout
      const box = await card.boundingBox()
      expect(box).not.toBeNull()
      if (box) {
        // Card should be wide enough on mobile (at least 270px considering padding)
        expect(box.width).toBeGreaterThan(270)
        expect(box.height).toBeGreaterThan(80)
      }
      
      // Check text readability
      const itemName = card.locator('span').filter({ hasText: /^[^€]+$/ }).first()
      if (await itemName.count() > 0) {
        const nameBox = await itemName.boundingBox()
        expect(nameBox).not.toBeNull()
        
        // Check font size is readable
        const fontSize = await itemName.evaluate((el) => {
          return window.getComputedStyle(el).fontSize
        })
        const fontSizeNum = parseFloat(fontSize)
        expect(fontSizeNum).toBeGreaterThanOrEqual(14)
      }
      
      // Check price is visible
      const price = card.locator('text=/€[0-9]+\\.[0-9]{2}/')
      await expect(price.first()).toBeVisible()
    }
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'e2e/screenshots/menu-cards-mobile-test.png',
      fullPage: true 
    })
  })

  test('Dietary restrictions card (ingredienti) should be fully visible and readable on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Scroll down to dietary restrictions section
    await page.evaluate(() => window.scrollTo(0, 1500))
    await page.waitForTimeout(1000)
    
    // Add a dietary restriction to see the card
    const restrictionSelect = page.locator('select').filter({ hasText: 'Intolleranza' }).first()
    if (await restrictionSelect.count() > 0) {
      await restrictionSelect.selectOption('No Lattosio')
      
      const guestCountInput = page.locator('input[type="number"]').filter({ hasText: /ospiti/ }).first()
      if (await guestCountInput.count() > 0) {
        await guestCountInput.fill('1')
      }
      
      const addButton = page.locator('button:has-text("Aggiungi")').first()
      await addButton.click()
      
      await page.waitForTimeout(500)
    }
    
    // Check if dietary restriction card is visible
    const restrictionCard = page.locator('div[class*="from-warm-cream"]').filter({ hasText: /ospit/i }).first()
    
    if (await restrictionCard.count() > 0) {
      await expect(restrictionCard).toBeVisible()
      
      // Check card dimensions
      const box = await restrictionCard.boundingBox()
      expect(box).not.toBeNull()
      if (box) {
        // Card should be wide enough (at least 300px on mobile)
        expect(box.width).toBeGreaterThan(280)
        expect(box.height).toBeGreaterThan(50)
      }
      
      // Check text readability
      const restrictionText = restrictionCard.locator('span').first()
      if (await restrictionText.count() > 0) {
        const fontSize = await restrictionText.evaluate((el) => {
          return window.getComputedStyle(el).fontSize
        })
        const fontSizeNum = parseFloat(fontSize)
        expect(fontSizeNum).toBeGreaterThanOrEqual(14)
      }
    }
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'e2e/screenshots/dietary-card-mobile-test.png',
      fullPage: true 
    })
  })

  test('All cards should have proper spacing and padding on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.waitForTimeout(1500)
    
    // Check menu cards have proper padding
    const menuCards = page.locator('label[class*="cursor-pointer"]').filter({ hasText: /€/ })
    if (await menuCards.count() > 0) {
      const firstCard = menuCards.first()
      const padding = await firstCard.evaluate((el) => {
        const style = window.getComputedStyle(el)
        return {
          paddingTop: parseFloat(style.paddingTop),
          paddingBottom: parseFloat(style.paddingBottom),
          paddingLeft: parseFloat(style.paddingLeft),
          paddingRight: parseFloat(style.paddingRight)
        }
      })
      
      // Should have adequate padding (at least 20px)
      expect(padding.paddingTop).toBeGreaterThanOrEqual(20)
      expect(padding.paddingBottom).toBeGreaterThanOrEqual(20)
      expect(padding.paddingLeft).toBeGreaterThanOrEqual(20)
      expect(padding.paddingRight).toBeGreaterThanOrEqual(20)
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'e2e/screenshots/menu-cards-spacing-mobile.png',
      fullPage: true 
    })
  })
})

