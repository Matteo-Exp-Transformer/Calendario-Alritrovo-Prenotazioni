import { test, expect } from '@playwright/test'

test.describe('Mobile Layout Overflow Fix', () => {
  // Configure mobile viewport (iPhone SE)
  test.use({
    viewport: { width: 375, height: 667 },
  })

  test('Submit button and textarea should not overflow on mobile', async ({ page }) => {
    console.log('📱 Testing mobile overflow fix on 375x667 viewport')

    // Navigate to booking page
    await page.goto('http://localhost:5175/prenota')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Take BEFORE screenshot
    await page.screenshot({
      path: 'e2e/screenshots/mobile-overflow-before.png',
      fullPage: true
    })
    console.log('✅ Before screenshot saved')

    // Get viewport width
    const viewportWidth = 375

    // Test 1: Check submit button doesn't overflow
    console.log('\n🧪 Test 1: Checking submit button...')
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()

    const buttonBox = await submitButton.boundingBox()
    if (buttonBox) {
      const buttonRight = buttonBox.x + buttonBox.width
      console.log(`   Button width: ${buttonBox.width}px`)
      console.log(`   Button right edge: ${buttonRight}px`)
      console.log(`   Viewport width: ${viewportWidth}px`)

      // Button should not extend beyond viewport
      expect(buttonRight).toBeLessThanOrEqual(viewportWidth)
      console.log('   ✅ Submit button does NOT overflow')
    }

    // Test 2: Check textarea doesn't overflow
    console.log('\n🧪 Test 2: Checking textarea...')
    const textarea = page.locator('textarea[id="special_requests"]')
    await expect(textarea).toBeVisible()

    const textareaBox = await textarea.boundingBox()
    if (textareaBox) {
      const textareaRight = textareaBox.x + textareaBox.width
      console.log(`   Textarea width: ${textareaBox.width}px`)
      console.log(`   Textarea right edge: ${textareaRight}px`)
      console.log(`   Viewport width: ${viewportWidth}px`)

      // Textarea should not extend beyond viewport
      expect(textareaRight).toBeLessThanOrEqual(viewportWidth)
      console.log('   ✅ Textarea does NOT overflow')
    }

    // Test 3: Check form container doesn't overflow
    console.log('\n🧪 Test 3: Checking form container...')
    const form = page.locator('form')
    await expect(form).toBeVisible()

    const formBox = await form.boundingBox()
    if (formBox) {
      const formRight = formBox.x + formBox.width
      console.log(`   Form width: ${formBox.width}px`)
      console.log(`   Form right edge: ${formRight}px`)
      console.log(`   Viewport width: ${viewportWidth}px`)

      // Form should not extend beyond viewport
      expect(formRight).toBeLessThanOrEqual(viewportWidth)
      console.log('   ✅ Form container does NOT overflow')
    }

    // Scroll to submit button for visibility
    await submitButton.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Take screenshot of submit button area
    await page.screenshot({
      path: 'e2e/screenshots/mobile-submit-button-area.png',
      fullPage: false
    })
    console.log('✅ Submit button area screenshot saved')

    console.log('\n✅ ALL MOBILE OVERFLOW TESTS PASSED')
  })

  test('Mobile viewport elements should be properly sized', async ({ page }) => {
    console.log('📱 Testing element sizing on mobile')

    await page.goto('http://localhost:5175/prenota')
    await page.waitForLoadState('networkidle')

    // Check horizontal scrollbar doesn't appear
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
    console.log('✅ No horizontal scrollbar detected')

    // Take full page screenshot
    await page.screenshot({
      path: 'e2e/screenshots/mobile-full-page.png',
      fullPage: true
    })
    console.log('✅ Full page screenshot saved')
  })
})
