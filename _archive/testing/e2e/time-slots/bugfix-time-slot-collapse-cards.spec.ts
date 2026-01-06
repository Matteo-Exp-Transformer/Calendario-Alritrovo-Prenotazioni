import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

/**
 * BugFix Test: CollapseCard fasce orarie (Pomeriggio e Sera) non si aprono/chiudono
 * Bug: Pomeriggio e Sera avevano collapseDisabled={true}, non si potevano chiudere
 * Fix: Cambiato collapseDisabled={false} per entrambe
 * Date: 2025-01-XX
 */

test.describe('BugFix: Time Slot CollapseCards open/close correctly', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login as admin
    const loginSuccess = await loginAsAdmin(page)
    if (!loginSuccess) {
      console.log('❌ Login fallito')
      test.skip()
      return
    }
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('all time slot cards (Mattina, Pomeriggio, Sera) can expand and collapse', async ({ page }) => {
    // Navigate to Calendar tab
    const calendarTab = page.locator('text=Calendario').first()
    await calendarTab.click()
    await page.waitForTimeout(2000)

    // Click on today's date to show time slot cards
    const todayCell = page.locator('.fc-day-today').first()
    if (await todayCell.count() > 0) {
      await todayCell.click()
      await page.waitForTimeout(2000)
    }

    // Wait for cards to be visible
    await page.waitForSelector('text=/Mattina/i', { timeout: 10000 })
    await page.waitForTimeout(2000)

    // Screenshot: Initial state
    await page.screenshot({
      path: 'screenshots/bugfix-time-slots-initial.png',
      fullPage: true
    })

    // Helper function to test a card
    const testCardExpandCollapse = async (cardName: string, expectedInitiallyExpanded: boolean = true) => {
      console.log(`🧪 Testing ${cardName} card...`)
      
      // Find card by title text - get the CollapsibleCard container (has data-expanded attribute)
      const cardContainer = page.locator(`[data-expanded]`).filter({ has: page.locator(`h3:has-text("${cardName}")`) }).first()
      await expect(cardContainer).toBeVisible({ timeout: 5000 })
      
      // Get the header button (clickable area)
      const cardHeader = cardContainer.locator('[role="button"]').first()
      await expect(cardHeader).toBeVisible()
      
      // Check initial state using aria-expanded attribute
      const initialAriaExpanded = await cardHeader.getAttribute('aria-expanded')
      const initialDataExpanded = await cardContainer.getAttribute('data-expanded')
      
      console.log(`  Initial aria-expanded: ${initialAriaExpanded}, data-expanded: ${initialDataExpanded}`)
      
      const isInitiallyExpanded = initialAriaExpanded === 'true' || initialDataExpanded === 'true'
      
      if (expectedInitiallyExpanded) {
        expect(isInitiallyExpanded).toBe(true)
        console.log(`✅ ${cardName} card is expanded initially`)
      }
      
      // Toggle: if expanded, collapse it; if collapsed, expand it
      await cardHeader.click()
      await page.waitForTimeout(800)
      
      // Check new state
      const newAriaExpanded = await cardHeader.getAttribute('aria-expanded')
      const newDataExpanded = await cardContainer.getAttribute('data-expanded')
      const isNewExpanded = newAriaExpanded === 'true' || newDataExpanded === 'true'
      
      // Should be opposite of initial state
      expect(isNewExpanded).toBe(!isInitiallyExpanded)
      console.log(`✅ ${cardName} card toggled successfully (now ${isNewExpanded ? 'expanded' : 'collapsed'})`)
      
      // Toggle back
      await cardHeader.click()
      await page.waitForTimeout(800)
      
      // Should be back to initial state
      const finalAriaExpanded = await cardHeader.getAttribute('aria-expanded')
      const finalDataExpanded = await cardContainer.getAttribute('data-expanded')
      const isFinalExpanded = finalAriaExpanded === 'true' || finalDataExpanded === 'true'
      
      expect(isFinalExpanded).toBe(isInitiallyExpanded)
      console.log(`✅ ${cardName} card returned to initial state`)
      
      return { cardContainer, cardHeader }
    }

    // Test Mattina
    await testCardExpandCollapse('Mattina')
    await page.screenshot({
      path: 'screenshots/bugfix-time-slots-mattina-tested.png',
      fullPage: true
    })

    // Test Pomeriggio (BUG FIXED)
    await testCardExpandCollapse('Pomeriggio')
    await page.screenshot({
      path: 'screenshots/bugfix-time-slots-pomeriggio-tested.png',
      fullPage: true
    })

    // Test Sera (BUG FIXED)
    await testCardExpandCollapse('Sera')
    await page.screenshot({
      path: 'screenshots/bugfix-time-slots-sera-tested.png',
      fullPage: true
    })

    // Final screenshot
    await page.screenshot({
      path: 'screenshots/bugfix-time-slots-all-tested.png',
      fullPage: true
    })

    console.log('✅ ALL TESTS PASSED - All time slot cards can expand/collapse correctly')
  })

  test('time slot cards maintain state independently', async ({ page }) => {
    // Navigate to Calendar tab
    const calendarTab = page.locator('text=Calendario').first()
    await calendarTab.click()
    await page.waitForTimeout(2000)

    // Click on today's date
    const todayCell = page.locator('.fc-day-today').first()
    if (await todayCell.count() > 0) {
      await todayCell.click()
      await page.waitForTimeout(2000)
    }

    await page.waitForSelector('text=/Mattina/i', { timeout: 10000 })
    await page.waitForTimeout(2000)

    // Helper to get card state
    const getCardState = async (cardName: string) => {
      const cardContainer = page.locator(`[data-expanded]`).filter({ has: page.locator(`h3:has-text("${cardName}")`) }).first()
      const cardHeader = cardContainer.locator('[role="button"]').first()
      const ariaExpanded = await cardHeader.getAttribute('aria-expanded')
      return ariaExpanded === 'true'
    }

    // Get initial states
    const mattinaInitial = await getCardState('Mattina')
    const pomeriggioInitial = await getCardState('Pomeriggio')
    const seraInitial = await getCardState('Sera')

    // Collapse only Pomeriggio
    const pomeriggioContainer = page.locator(`[data-expanded]`).filter({ has: page.locator(`h3:has-text("Pomeriggio")`) }).first()
    const pomeriggioHeader = pomeriggioContainer.locator('[role="button"]').first()
    await pomeriggioHeader.click()
    await page.waitForTimeout(1000)

    // Verify Pomeriggio is collapsed
    const pomeriggioCollapsed = !(await getCardState('Pomeriggio'))
    expect(pomeriggioCollapsed).toBe(true)

    // Verify Mattina and Sera are still in their initial state
    const mattinaState = await getCardState('Mattina')
    const seraState = await getCardState('Sera')
    expect(mattinaState).toBe(mattinaInitial)
    expect(seraState).toBe(seraInitial)

    await page.screenshot({
      path: 'screenshots/bugfix-time-slots-independent-state.png',
      fullPage: true
    })

    console.log('✅ Cards maintain independent state correctly')
  })
})
