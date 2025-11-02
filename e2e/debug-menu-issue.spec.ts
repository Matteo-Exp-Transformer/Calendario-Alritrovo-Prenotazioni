import { test, expect } from '@playwright/test'

test.describe('Debug Menu Issue - Prenota Page', () => {
  test('investigate why menu is not appearing', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text())
    })

    // Track network requests
    const apiCalls: Array<{ url: string; status: number }> = []
    page.on('response', response => {
      const url = response.url()
      if (url.includes('menu') || url.includes('supabase')) {
        apiCalls.push({ url, status: response.status() })
        console.log(`[NETWORK]: ${response.status()} ${url}`)
      }
    })

    // 1. Navigate to prenota page
    console.log('🔍 Step 1: Navigating to prenota page...')
    await page.goto('http://localhost:5174/prenota')
    await page.waitForLoadState('networkidle')

    // Take initial screenshot
    await page.screenshot({
      path: 'e2e/screenshots/debug-01-initial-prenota.png',
      fullPage: true
    })
    console.log('📸 Screenshot saved: debug-01-initial-prenota.png')

    // 2. Fill required fields
    console.log('🔍 Step 2: Filling form fields...')
    await page.fill('input[id="client_name"]', 'Test User')
    await page.fill('input[id="client_phone"]', '351 123 4567')

    // 3. Select Rinfresco di Laurea booking type
    console.log('🔍 Step 3: Selecting Rinfresco di Laurea...')
    await page.locator('text="Dettagli Prenotazione"').scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    await page.locator('input[type="radio"][value="rinfresco_laurea"]').check({ force: true })
    console.log('✓ Radio button checked')

    // Wait for potential API calls
    await page.waitForTimeout(3000)

    // Take screenshot after selection
    await page.screenshot({
      path: 'e2e/screenshots/debug-02-after-rinfresco-selected.png',
      fullPage: true
    })
    console.log('📸 Screenshot saved: debug-02-after-rinfresco-selected.png')

    // 4. Check if radio is actually checked
    const isChecked = await page.locator('input[type="radio"][value="rinfresco_laurea"]').isChecked()
    console.log(`✓ Radio checked status: ${isChecked}`)
    expect(isChecked).toBe(true)

    // 5. Look for menu section
    console.log('🔍 Step 4: Checking for menu sections...')

    const menuSelectionExists = await page.locator('text="Selezione Menu"').count()
    console.log(`Menu Selection heading: ${menuSelectionExists > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`)

    const bevandeSectionExists = await page.locator('h3:has-text("Bevande")').count()
    console.log(`Bevande section: ${bevandeSectionExists > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`)

    const primiSectionExists = await page.locator('h3:has-text("Primi Piatti")').count()
    console.log(`Primi Piatti section: ${primiSectionExists > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`)

    const secondiSectionExists = await page.locator('h3:has-text("Secondi Piatti")').count()
    console.log(`Secondi Piatti section: ${secondiSectionExists > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`)

    // 6. Check for error messages
    console.log('🔍 Step 5: Checking for error messages...')
    const errorMessages = await page.locator('text=/errore|error/i').count()
    if (errorMessages > 0) {
      const errors = await page.locator('text=/errore|error/i').allTextContents()
      console.log('⚠️  Error messages found:', errors)
    } else {
      console.log('✓ No error messages visible')
    }

    // 7. Check network calls
    console.log('🔍 Step 6: Network calls summary:')
    if (apiCalls.length === 0) {
      console.log('❌ No API calls to menu or Supabase detected')
    } else {
      apiCalls.forEach(call => {
        console.log(`  - ${call.status} ${call.url}`)
      })
    }

    // 8. Get all visible text in the form
    const formContent = await page.locator('form').textContent()
    console.log('📄 Form visible text (first 500 chars):', formContent?.substring(0, 500))

    // 9. Check browser console errors
    console.log('🔍 Step 7: Checking browser console (see above for any errors)')

    // 10. Take final screenshot
    await page.screenshot({
      path: 'e2e/screenshots/debug-03-final-state.png',
      fullPage: true
    })
    console.log('📸 Screenshot saved: debug-03-final-state.png')

    // Summary
    console.log('\n═══════════════════════════════════════')
    console.log('INVESTIGATION SUMMARY')
    console.log('═══════════════════════════════════════')
    console.log(`Radio checked: ${isChecked ? '✅' : '❌'}`)
    console.log(`Menu heading visible: ${menuSelectionExists > 0 ? '✅' : '❌'}`)
    console.log(`Bevande section: ${bevandeSectionExists > 0 ? '✅' : '❌'}`)
    console.log(`Primi section: ${primiSectionExists > 0 ? '✅' : '❌'}`)
    console.log(`Secondi section: ${secondiSectionExists > 0 ? '✅' : '❌'}`)
    console.log(`API calls made: ${apiCalls.length}`)
    console.log(`Error messages: ${errorMessages}`)
    console.log('═══════════════════════════════════════\n')

    // Don't fail the test - this is for investigation
  })

  test('check database menu_items table', async ({ page }) => {
    console.log('🔍 Checking database for menu items...')

    // We'll need to query Supabase directly
    // For now, navigate to admin and try to see if menu loads there
    await page.goto('http://localhost:5174/admin')
    await page.waitForLoadState('networkidle')

    // Check if we can see any menu-related data
    const pageContent = await page.textContent('body')
    console.log('Admin page loaded, looking for menu references...')

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/debug-04-admin-page.png',
      fullPage: true
    })
  })
})
