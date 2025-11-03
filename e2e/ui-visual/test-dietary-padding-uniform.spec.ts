import { test, expect } from '@playwright/test'

test.describe('Dietary Restrictions Padding Uniformity', () => {
  test('dietary restriction cards should have same padding as menu cards', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/prenota')

    // Select booking type to make dietary section visible
    await page.selectOption('select#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(500)

    // Wait for dietary restrictions section to be visible
    await page.waitForSelector('h2:has-text("Intolleranze e Richieste Speciali")')

    // Find the select in dietary section (first select after the h2)
    const dietarySection = page.locator('h2:has-text("Intolleranze e Richieste Speciali")').locator('..')
    const dietarySelect = dietarySection.locator('select').first()
    const guestCountInput = dietarySection.locator('input[type="number"]').first()

    // Add first dietary restriction
    await dietarySelect.selectOption('No Lattosio')
    await guestCountInput.fill('2')
    await page.click('button:has-text("Aggiungi")')
    await page.waitForTimeout(500)

    // Add another one
    await dietarySelect.selectOption('No Glutine')
    await guestCountInput.fill('1')
    await page.click('button:has-text("Aggiungi")')
    await page.waitForTimeout(500)

    // Get computed styles for menu card (first menu item)
    const menuCard = page.locator('label').filter({ hasText: 'Polpette Vegane' }).first()
    const menuCardBox = await menuCard.boundingBox()
    const menuCardStyles = await menuCard.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        padding: styles.padding,
        paddingTop: styles.paddingTop,
        paddingRight: styles.paddingRight,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
        gap: styles.gap,
        borderRadius: styles.borderRadius
      }
    })

    // Get computed styles for dietary restriction card
    const dietaryCard = page.locator('div').filter({ hasText: 'No Lattosio' }).filter({ hasText: '2 ospiti' }).first()
    const dietaryCardBox = await dietaryCard.boundingBox()
    const dietaryCardStyles = await dietaryCard.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        padding: styles.padding,
        paddingTop: styles.paddingTop,
        paddingRight: styles.paddingRight,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
        gap: styles.gap,
        borderRadius: styles.borderRadius
      }
    })

    console.log('Menu card styles:', menuCardStyles)
    console.log('Dietary card styles:', dietaryCardStyles)

    // Assert padding uniformity (menu cards use 24px padding)
    expect(dietaryCardStyles.paddingTop).toBe('24px')
    expect(dietaryCardStyles.paddingRight).toBe('24px')
    expect(dietaryCardStyles.paddingBottom).toBe('24px')
    expect(dietaryCardStyles.paddingLeft).toBe('24px')

    // Assert gap uniformity (menu cards use 16px gap)
    expect(dietaryCardStyles.gap).toBe('16px')

    // Assert border radius uniformity (menu cards use 16px)
    expect(dietaryCardStyles.borderRadius).toBe('16px')

    // Visual verification with screenshot
    await page.screenshot({
      path: 'e2e/screenshots/dietary-padding-uniform-test.png',
      fullPage: true
    })
  })
})
