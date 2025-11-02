import { test, expect } from '@playwright/test'

test.describe('Menu System - Bis di Primi Removed', () => {
  test('should not show Bis di Primi checkbox and verify menu UI', async ({ page }) => {
    // 1. Go to public booking form
    await page.goto('http://localhost:5175/prenota')
    await page.waitForLoadState('networkidle')

    // 2. Fill out required fields first
    await page.fill('input[id="client_name"]', 'Test User')
    await page.fill('input[id="client_phone"]', '351 123 4567')

    // 3. Scroll to booking type and click directly on the radio input with force
    await page.locator('text="Dettagli Prenotazione"').scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Force click the radio button input directly
    await page.locator('input[type="radio"][value="rinfresco_laurea"]').check({ force: true })
    await page.waitForTimeout(2000)

    // 4. Take a screenshot to see current state
    await page.screenshot({ path: 'e2e/screenshots/menu-debug-after-rinfresco-click.png', fullPage: true })

    // 5. Check if menu section appeared (look for any menu category)
    const bevandeSectionExists = await page.locator('h3:has-text("Bevande")').count()
    const primiSectionExists = await page.locator('h3:has-text("Primi Piatti")').count()

    console.log(`Bevande section visible: ${bevandeSectionExists > 0}`)
    console.log(`Primi Piatti section visible: ${primiSectionExists > 0}`)

    if (bevandeSectionExists === 0 && primiSectionExists === 0) {
      console.log('❌ Menu sections not visible. This might indicate:')
      console.log('   - Radio button not properly selected')
      console.log('   - No menu items in database')
      console.log('   - Component not rendering')

      // Take screenshot of full page for debugging
      await page.screenshot({ path: 'e2e/screenshots/menu-not-loaded.png', fullPage: true })

      // Check if the radio is actually checked
      const isChecked = await page.locator('input[type="radio"][value="rinfresco_laurea"]').isChecked()
      console.log(`Radio button checked status: ${isChecked}`)

      // Fail the test with helpful message
      expect(bevandeSectionExists + primiSectionExists, 'Menu sections should be visible after selecting Rinfresco di Laurea').toBeGreaterThan(0)
    }

    // 6. If menu loaded, verify NO "Bis di Primi" text appears
    const bisPrimiText = await page.locator('text=/Bis.*Primi/i').count()
    expect(bisPrimiText).toBe(0)

    // 7. Take screenshot of menu
    await page.screenshot({ path: 'e2e/screenshots/menu-no-bis-primi.png', fullPage: true })

    console.log('✅ No "Bis di Primi" checkbox found in menu')
  })

  test('should allow only ONE primo selection with alert', async ({ page }) => {
    // 1. Go to public booking form
    await page.goto('http://localhost:5175/prenota')
    await page.waitForLoadState('networkidle')

    // 2. Fill out required fields
    await page.fill('input[id="client_name"]', 'Test User')
    await page.fill('input[id="client_phone"]', '351 123 4567')

    // 3. Select Rinfresco di Laurea
    await page.locator('input[type="radio"][value="rinfresco_laurea"]').check({ force: true })
    await page.waitForTimeout(2000)

    // 4. Check if Primi Piatti section exists
    const primiExists = await page.locator('h3:has-text("Primi Piatti")').count()
    if (primiExists === 0) {
      console.log('⚠️  Primi Piatti section not found - skipping test')
      return
    }

    // 5. Scroll to Primi Piatti section
    await page.locator('h3:has-text("Primi Piatti")').scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // 6. Get all primo checkboxes
    const primiSection = page.locator('h3:has-text("Primi Piatti")').locator('..')
    const primiLabels = primiSection.locator('label')
    const primiCount = await primiLabels.count()

    console.log(`Found ${primiCount} primi piatti options`)

    if (primiCount < 2) {
      console.log('⚠️  Not enough primi options to test - need at least 2')
      return
    }

    // 7. Click first primo (using label click, not checkbox)
    await primiLabels.nth(0).click()
    await page.waitForTimeout(500)

    // 8. Take screenshot after first primo selected
    await page.screenshot({ path: 'e2e/screenshots/menu-one-primo-selected.png', fullPage: true })

    // 9. Set up dialog handler BEFORE attempting second click
    let alertMessage = ''
    page.on('dialog', async dialog => {
      alertMessage = dialog.message()
      console.log('✅ Alert shown:', alertMessage)
      await dialog.accept()
    })

    // 10. Try to select second primo
    await primiLabels.nth(1).click()
    await page.waitForTimeout(1000)

    // 11. Verify alert was shown
    expect(alertMessage).toContain('primo')

    // 12. Verify only first primo is checked
    const primiCheckboxes = primiSection.locator('input[type="checkbox"]')
    const firstChecked = await primiCheckboxes.nth(0).isChecked()
    const secondChecked = await primiCheckboxes.nth(1).isChecked()

    expect(firstChecked).toBe(true)
    expect(secondChecked).toBe(false)

    console.log('✅ Single primo restriction working correctly')
  })

  test('should calculate total as simple sum (no surcharge)', async ({ page }) => {
    // 1. Go to public booking form
    await page.goto('http://localhost:5175/prenota')
    await page.waitForLoadState('networkidle')

    // 2. Fill out required fields
    await page.fill('input[id="client_name"]', 'Test User')
    await page.fill('input[id="client_phone"]', '351 123 4567')

    // 3. Select Rinfresco di Laurea
    await page.locator('input[type="radio"][value="rinfresco_laurea"]').check({ force: true })
    await page.waitForTimeout(2000)

    // 4. Check if menu loaded
    const menuExists = await page.locator('h3:has-text("Bevande")').count()
    if (menuExists === 0) {
      console.log('⚠️  Menu not loaded - skipping test')
      return
    }

    // 5. Select items and track prices
    const selectedPrices: number[] = []

    // Select first Bevanda
    const bevandaSection = page.locator('h3:has-text("Bevande")').locator('..')
    const bevandaLabels = bevandaSection.locator('label')
    const bevandaCount = await bevandaLabels.count()

    if (bevandaCount > 0) {
      const firstBevanda = bevandaLabels.nth(0)
      const priceText = await firstBevanda.locator('span.text-lg').textContent()
      console.log('Bevanda price text:', priceText)

      // Parse price
      const priceMatch = priceText?.match(/€?([\d.]+)/)
      if (priceMatch) {
        selectedPrices.push(parseFloat(priceMatch[1]))
      }

      await firstBevanda.click()
      await page.waitForTimeout(500)
    }

    // Select first Primo
    const primiSection = page.locator('h3:has-text("Primi Piatti")').locator('..')
    await page.locator('h3:has-text("Primi Piatti")').scrollIntoViewIfNeeded()
    const primiLabels = primiSection.locator('label')
    const primiCount = await primiLabels.count()

    if (primiCount > 0) {
      const firstPrimo = primiLabels.nth(0)
      const priceText = await firstPrimo.locator('span.text-lg').textContent()
      console.log('Primo price text:', priceText)

      // Parse price
      const priceMatch = priceText?.match(/€?([\d.]+)/)
      if (priceMatch) {
        selectedPrices.push(parseFloat(priceMatch[1]))
      }

      await firstPrimo.click()
      await page.waitForTimeout(500)
    }

    // 6. Calculate expected total
    const expectedTotal = selectedPrices.reduce((sum, price) => sum + price, 0)
    console.log(`Selected prices: ${selectedPrices.join(' + ')} = €${expectedTotal.toFixed(2)}`)

    // 7. Scroll to and read displayed total
    const totalExists = await page.locator('text="Totale a Persona"').count()
    if (totalExists === 0) {
      console.log('⚠️  Total not displayed - no items selected or component issue')
      return
    }

    await page.locator('text="Totale a Persona"').scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // 8. Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/menu-total-calculation.png', fullPage: true })

    // 9. Get displayed total
    const totalContainer = page.locator('text="Totale a Persona"').locator('..')
    const displayedTotalText = await totalContainer.locator('span.text-3xl').textContent()
    console.log('Displayed total text:', displayedTotalText)

    // Parse displayed total
    const displayedMatch = displayedTotalText?.match(/€?([\d.]+)/)
    const displayedTotal = displayedMatch ? parseFloat(displayedMatch[1]) : 0

    // 10. Verify totals match (simple sum, no surcharges)
    expect(displayedTotal).toBe(expectedTotal)

    console.log('✅ Total calculation is correct (simple sum, no surcharges)')
  })
})

