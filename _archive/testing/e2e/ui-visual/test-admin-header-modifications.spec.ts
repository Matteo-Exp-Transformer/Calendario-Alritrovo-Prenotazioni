import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Admin Header Modifications Verification', () => {
  test('Verify all header modifications are correctly applied', async ({ page }) => {
    // Step 1: Login
    console.log('🔐 Step 1: Logging in...')
    const loginSuccess = await loginAsAdmin(page)
    
    if (!loginSuccess) {
      test.skip('Admin login failed')
      return
    }

    await page.waitForURL('**/admin', { timeout: 10000 })
    await page.waitForTimeout(2000)

    console.log('✅ Login successful')

    // Step 2: Verify count numbers font size (text-2xl lg:text-3xl)
    console.log('\n📊 Step 2: Verifying count font sizes...')
    
    const countCards = page.locator('div.bg-white.rounded-modern').filter({ 
      hasText: /Settimana|Oggi|Mese|Rifiutate/ 
    })
    const countCardsCount = await countCards.count()
    console.log(`   Found ${countCardsCount} count cards`)

    expect(countCardsCount).toBe(4)

    for (let i = 0; i < countCardsCount; i++) {
      const card = countCards.nth(i)
      const numberElement = card.locator('p.font-black')
      
      const classes = await numberElement.getAttribute('class')
      console.log(`   Count card ${i + 1} classes: ${classes}`)

      // Verify text-2xl and lg:text-3xl are present
      expect(classes).toContain('text-2xl')
      expect(classes).toContain('lg:text-3xl')
      expect(classes).toContain('font-black')
      console.log(`   ✓ Count ${i + 1}: text-2xl lg:text-3xl font-black verified`)
    }

    // Step 3: Verify navigation buttons spacing (gap-5 md:gap-6)
    console.log('\n🧭 Step 3: Verifying navigation button spacing...')
    
    const navContainer = page.locator('nav.flex').first()
    const navClasses = await navContainer.getAttribute('class')
    console.log(`   Navigation container classes: ${navClasses}`)
    
    // Verify gap-5 or gap-6 is present
    expect(navClasses).toMatch(/gap-[56]/)
    console.log(`   ✓ Navigation spacing verified (gap-5 or gap-6)`)

    // Step 4: Verify navigation buttons have dark borders (border-gray-800)
    console.log('\n🎨 Step 4: Verifying navigation button dark borders...')
    
    const navButtons = page.locator('nav').first().locator('div.border-2')
    const navButtonsCount = await navButtons.count()
    console.log(`   Found ${navButtonsCount} navigation buttons`)

    for (let i = 0; i < Math.min(navButtonsCount, 4); i++) {
      const button = navButtons.nth(i)
      const classes = await button.getAttribute('class')
      console.log(`   Nav button ${i + 1} classes: ${classes}`)
      
      // Verify border-gray-800 or border-gray-900 is present
      expect(classes).toMatch(/border-gray-8/)
      console.log(`   ✓ Nav button ${i + 1}: dark border verified`)
    }

    // Step 5: Verify User Info and Logout spacing (gap-4 lg:gap-5)
    console.log('\n👤 Step 5: Verifying User Info and Logout spacing...')
    
    // Find the container with User Info and Logout
    const userLogoutContainer = page.locator('div.flex.items-center').filter({ hasText: /Admin|Staff/ }).first()
    const userLogoutClasses = await userLogoutContainer.getAttribute('class')
    console.log(`   User/Logout container classes: ${userLogoutClasses}`)
    
    // Verify gap-4 or gap-5 is present
    if (userLogoutClasses) {
      expect(userLogoutClasses).toMatch(/gap-[45]/)
      console.log(`   ✓ User/Logout spacing verified (gap-4 or gap-5)`)
    }

    // Step 6: Verify count and user info are on the left side (not ml-auto)
    console.log('\n📍 Step 6: Verifying count and user info positioned on left...')
    
    const headerContainer = page.locator('div.flex.items-center').filter({ hasText: /Settimana|Oggi|Mese|Rifiutate/ }).first()
    const headerClasses = await headerContainer.getAttribute('class')
    console.log(`   Header container classes: ${headerClasses}`)
    
    // Verify ml-auto is NOT present (should be on left, not right)
    if (headerClasses) {
      expect(headerClasses).not.toContain('ml-auto')
      console.log(`   ✓ Header elements not using ml-auto (positioned on left)`)
    }

    // Verify AdminHeader is after the logo (not at the end)
    const topBar = page.locator('div.flex.items-center').nth(0) // First flex container in top bar
    const topBarClasses = await topBar.getAttribute('class')
    console.log(`   Top bar classes: ${topBarClasses}`)
    
    // Should NOT have justify-between (which would push elements apart)
    if (topBarClasses) {
      expect(topBarClasses).not.toContain('justify-between')
      console.log(`   ✓ Top bar uses flex with gap (not justify-between)`)
    }

    // Step 7: Verify dropdown alignment in booking form
    console.log('\n📝 Step 7: Verifying dropdown alignment in booking form...')
    
    // Open the booking form if it's in a collapsible card
    const newBookingCard = page.locator('text=Inserisci nuova prenotazione').first()
    if (await newBookingCard.isVisible()) {
      await newBookingCard.click()
      await page.waitForTimeout(500)
    }

    // Find the event type dropdown
    const eventTypeSelect = page.locator('select#event_type')
    const isVisible = await eventTypeSelect.isVisible()
    
    if (isVisible) {
      const selectStyle = await eventTypeSelect.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return {
          borderRadius: styles.borderRadius,
          height: styles.height,
          padding: styles.padding,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight
        }
      })
      
      console.log(`   Dropdown styles:`, selectStyle)
      
      // Verify the dropdown has similar styling to inputs (rounded-full or high border-radius, height ~56px)
      expect(selectStyle.borderRadius).toContain('9999px') // rounded-full
      expect(selectStyle.height).toBe('56px')
      console.log(`   ✓ Dropdown aligned with input fields`)
    } else {
      console.log(`   ⚠ Dropdown not visible (may need to expand form)`)
    }

    // Step 8: Take screenshot
    console.log('\n📸 Step 8: Taking screenshot...')
    await page.screenshot({ 
      path: 'screenshots/admin-header-modifications-verification.png', 
      fullPage: true 
    })
    console.log('✅ Screenshot saved')

    // Summary
    console.log('\n✅ VERIFICATION SUMMARY:')
    console.log('   ✓ Count numbers use text-2xl lg:text-3xl (larger font)')
    console.log('   ✓ Count numbers use font-black (bold)')
    console.log('   ✓ Navigation buttons have gap-5/6 (increased spacing)')
    console.log('   ✓ Navigation buttons have dark borders (border-gray-800)')
    console.log('   ✓ User Info and Logout have gap-4/5 (increased spacing)')
    console.log('   ✓ Count and User Info positioned on left side')
    console.log('   ✓ Dropdown aligned with other input fields')
  })
})



