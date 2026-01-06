import { test, expect } from '@playwright/test'

/**
 * 📸 TEST: Menu Cards Before Mobile - Screenshot Baseline
 *
 * SCOPO:
 * Documentare stato attuale layout menu cards prima di modifiche responsive.
 * Screenshot su 3 viewport per analisi e confronto.
 *
 * OUTPUT:
 * - e2e/screenshots/menu-cards-before-desktop.png
 * - e2e/screenshots/menu-cards-before-mobile-375.png
 * - e2e/screenshots/menu-cards-before-mobile-320.png
 * - Metriche console (font-size, padding, overflow)
 *
 * ESECUZIONE:
 * npx playwright test e2e/mobile/test-menu-cards-before-mobile.spec.ts
 */

test.describe('Menu Cards Before Mobile - Baseline Screenshots', () => {
  test('Desktop 1920x1080 - screenshot menu cards layout', async ({ page }) => {
    console.log('\n📸 DESKTOP SCREENSHOT - 1920x1080')

    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')

    // Select Rinfresco Laurea to show menu
    const bookingTypeSelect = page.locator('select#booking_type')
    await bookingTypeSelect.selectOption('rinfresco_laurea')
    await page.waitForTimeout(1000)

    // Scroll to menu section
    const menuSection = page.locator('h2').filter({ hasText: /menu/i })
    if (await menuSection.count() > 0) {
      await menuSection.scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
    }

    // Find first menu card
    const menuCard = page.locator('label').filter({ hasText: /€/ }).first()
    if (await menuCard.count() > 0) {
      await menuCard.scrollIntoViewIfNeeded()

      // Measure metrics
      const cardBox = await menuCard.boundingBox()
      const titleElement = menuCard.locator('span').filter({ hasText: /^[^€]+$/ }).first()
      const priceElement = menuCard.locator('text=/€[0-9]+/')

      if (cardBox) {
        console.log('📐 Desktop Card Metrics:')
        console.log(`   Width: ${cardBox.width.toFixed(2)}px`)
        console.log(`   Height: ${cardBox.height.toFixed(2)}px`)
        console.log(`   Position: x=${cardBox.x.toFixed(2)}, y=${cardBox.y.toFixed(2)}`)
      }

      // Measure font sizes
      if (await titleElement.count() > 0) {
        const titleFontSize = await titleElement.evaluate(el =>
          parseFloat(window.getComputedStyle(el).fontSize)
        )
        console.log(`   Title font-size: ${titleFontSize}px`)
      }

      if (await priceElement.count() > 0) {
        const priceFontSize = await priceElement.evaluate(el =>
          parseFloat(window.getComputedStyle(el).fontSize)
        )
        console.log(`   Price font-size: ${priceFontSize}px`)
      }

      // Measure padding
      const padding = await menuCard.evaluate(el => {
        const style = window.getComputedStyle(el)
        return {
          top: parseFloat(style.paddingTop),
          right: parseFloat(style.paddingRight),
          bottom: parseFloat(style.paddingBottom),
          left: parseFloat(style.paddingLeft)
        }
      })
      console.log(`   Padding: top=${padding.top}px, right=${padding.right}px, bottom=${padding.bottom}px, left=${padding.left}px`)
    }

    // Screenshot
    await page.screenshot({
      path: 'e2e/screenshots/menu-cards-before-desktop.png',
      fullPage: false
    })
    console.log('✅ Screenshot saved: menu-cards-before-desktop.png\n')
  })

  test('Mobile 375x667 (iPhone SE) - screenshot menu cards layout', async ({ page }) => {
    console.log('\n📸 MOBILE SCREENSHOT - 375x667 (iPhone SE)')

    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')

    // Select Rinfresco Laurea
    const bookingTypeSelect = page.locator('select#booking_type')
    await bookingTypeSelect.selectOption('rinfresco_laurea')
    await page.waitForTimeout(1000)

    // Scroll to menu
    const menuSection = page.locator('h2').filter({ hasText: /menu/i })
    if (await menuSection.count() > 0) {
      await menuSection.scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
    }

    // Find menu card
    const menuCard = page.locator('label').filter({ hasText: /€/ }).first()
    if (await menuCard.count() > 0) {
      await menuCard.scrollIntoViewIfNeeded()

      // Measure metrics
      const cardBox = await menuCard.boundingBox()
      const titleElement = menuCard.locator('span').filter({ hasText: /^[^€]+$/ }).first()
      const priceElement = menuCard.locator('text=/€[0-9]+/')
      const descriptionElement = menuCard.locator('p')

      if (cardBox) {
        console.log('📐 Mobile 375px Card Metrics:')
        console.log(`   Width: ${cardBox.width.toFixed(2)}px`)
        console.log(`   Height: ${cardBox.height.toFixed(2)}px`)
        console.log(`   Right edge: ${(cardBox.x + cardBox.width).toFixed(2)}px (viewport: 375px)`)

        // ⚠️ Check overflow
        const overflows = (cardBox.x + cardBox.width) > 375
        if (overflows) {
          console.log(`   ⚠️ WARNING: Card overflows viewport by ${((cardBox.x + cardBox.width) - 375).toFixed(2)}px`)
        } else {
          console.log(`   ✅ No overflow (${(375 - (cardBox.x + cardBox.width)).toFixed(2)}px margin)`)
        }
      }

      // Font sizes
      if (await titleElement.count() > 0) {
        const titleFontSize = await titleElement.evaluate(el =>
          parseFloat(window.getComputedStyle(el).fontSize)
        )
        console.log(`   Title font-size: ${titleFontSize}px ${titleFontSize < 14 ? '⚠️ TOO SMALL' : '✅'}`)
      }

      if (await priceElement.count() > 0) {
        const priceFontSize = await priceElement.evaluate(el =>
          parseFloat(window.getComputedStyle(el).fontSize)
        )
        console.log(`   Price font-size: ${priceFontSize}px ${priceFontSize < 14 ? '⚠️ TOO SMALL' : '✅'}`)
      }

      if (await descriptionElement.count() > 0) {
        const descFontSize = await descriptionElement.evaluate(el =>
          parseFloat(window.getComputedStyle(el).fontSize)
        )
        const descVisible = await descriptionElement.isVisible()
        console.log(`   Description font-size: ${descFontSize}px ${descFontSize < 14 ? '⚠️ TOO SMALL' : '✅'}`)
        console.log(`   Description visible: ${descVisible ? '✅ YES' : '⚠️ NO'}`)
      }

      // Padding
      const padding = await menuCard.evaluate(el => {
        const style = window.getComputedStyle(el)
        return {
          top: parseFloat(style.paddingTop),
          right: parseFloat(style.paddingRight),
          bottom: parseFloat(style.paddingBottom),
          left: parseFloat(style.paddingLeft)
        }
      })
      const minPadding = Math.min(padding.top, padding.right, padding.bottom, padding.left)
      console.log(`   Padding: top=${padding.top}px, right=${padding.right}px, bottom=${padding.bottom}px, left=${padding.left}px`)
      console.log(`   Min padding: ${minPadding}px ${minPadding < 24 ? '⚠️ TOO SMALL' : '✅'}`)
    }

    // Screenshot
    await page.screenshot({
      path: 'e2e/screenshots/menu-cards-before-mobile-375.png',
      fullPage: false
    })
    console.log('✅ Screenshot saved: menu-cards-before-mobile-375.png\n')
  })

  test('Mobile 320x568 (iPhone 5/SE) - screenshot menu cards layout', async ({ page }) => {
    console.log('\n📸 MOBILE SMALL SCREENSHOT - 320x568 (iPhone 5/SE)')

    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/prenota')
    await page.waitForLoadState('networkidle')

    // Select Rinfresco Laurea
    const bookingTypeSelect = page.locator('select#booking_type')
    await bookingTypeSelect.selectOption('rinfresco_laurea')
    await page.waitForTimeout(1000)

    // Scroll to menu
    const menuSection = page.locator('h2').filter({ hasText: /menu/i })
    if (await menuSection.count() > 0) {
      await menuSection.scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
    }

    // Find menu card
    const menuCard = page.locator('label').filter({ hasText: /€/ }).first()
    if (await menuCard.count() > 0) {
      await menuCard.scrollIntoViewIfNeeded()

      // Measure metrics
      const cardBox = await menuCard.boundingBox()

      if (cardBox) {
        console.log('📐 Mobile 320px Card Metrics:')
        console.log(`   Width: ${cardBox.width.toFixed(2)}px`)
        console.log(`   Height: ${cardBox.height.toFixed(2)}px`)
        console.log(`   Right edge: ${(cardBox.x + cardBox.width).toFixed(2)}px (viewport: 320px)`)

        // ⚠️ CRITICAL Check overflow
        const overflows = (cardBox.x + cardBox.width) > 320
        if (overflows) {
          console.log(`   🔴 CRITICAL: Card overflows viewport by ${((cardBox.x + cardBox.width) - 320).toFixed(2)}px`)
        } else {
          console.log(`   ✅ No overflow (${(320 - (cardBox.x + cardBox.width)).toFixed(2)}px margin)`)
        }

        // Check if content is readable
        if (cardBox.width < 280) {
          console.log(`   ⚠️ Card width ${cardBox.width.toFixed(2)}px may be too narrow for content`)
        }
      }

      // Font sizes check
      const titleElement = menuCard.locator('span').filter({ hasText: /^[^€]+$/ }).first()
      if (await titleElement.count() > 0) {
        const titleFontSize = await titleElement.evaluate(el =>
          parseFloat(window.getComputedStyle(el).fontSize)
        )
        console.log(`   Title font-size: ${titleFontSize}px ${titleFontSize < 14 ? '🔴 TOO SMALL' : '✅'}`)
      }
    }

    // Screenshot
    await page.screenshot({
      path: 'e2e/screenshots/menu-cards-before-mobile-320.png',
      fullPage: false
    })
    console.log('✅ Screenshot saved: menu-cards-before-mobile-320.png\n')
  })

  test('Summary - Layout analysis across viewports', async ({ page }) => {
    console.log('\n📊 SUMMARY: Layout Analysis Complete')
    console.log('=' .repeat(60))
    console.log('Screenshots saved:')
    console.log('  - e2e/screenshots/menu-cards-before-desktop.png')
    console.log('  - e2e/screenshots/menu-cards-before-mobile-375.png')
    console.log('  - e2e/screenshots/menu-cards-before-mobile-320.png')
    console.log('')
    console.log('Next steps:')
    console.log('1. Review screenshots manually')
    console.log('2. Identify layout issues (overflow, truncation, spacing)')
    console.log('3. Implement responsive layout (Opzione B or C)')
    console.log('4. Run test-menu-cards-after-mobile.spec.ts for comparison')
    console.log('=' .repeat(60))
  })
})
