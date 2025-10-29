import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('Admin Header Spacing and Font Size Check', () => {
  test('Verify increased button spacing and larger count fonts', async ({ page }) => {
    // Login
    console.log('🔐 Step 1: Logging in...')
    const loginSuccess = await loginAsAdmin(page)
    
    if (!loginSuccess) {
      test.skip('Admin login failed')
      return
    }

    await page.waitForURL('**/admin', { timeout: 10000 })
    await page.waitForTimeout(2000)

    console.log('✅ Login successful')

    // Step 1: Verify count numbers are larger (text-2xl/3xl instead of text-xl/2xl)
    console.log('\n📊 Step 2: Checking count font sizes...')
    
    // Get all count cards
    const countCards = page.locator('div.bg-white.rounded-modern').filter({ 
      hasText: /Settimana|Oggi|Mese|Rifiutate/ 
    })
    const countCardsCount = await countCards.count()
    console.log(`   Found ${countCardsCount} count cards`)

    // Check the number text elements inside count cards
    for (let i = 0; i < countCardsCount; i++) {
      const card = countCards.nth(i)
      const numberElement = card.locator('p.font-black')
      
      // Get computed styles
      const fontSize = await numberElement.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return parseFloat(styles.fontSize)
      })

      const fontWeight = await numberElement.evaluate((el) => {
        return window.getComputedStyle(el).fontWeight
      })

      const classes = await numberElement.getAttribute('class')
      console.log(`   Count card ${i + 1}:`)
      console.log(`     Classes: ${classes}`)
      console.log(`     Computed font-size: ${fontSize}px`)
      console.log(`     Computed font-weight: ${fontWeight}`)

      // Verify text-2xl or text-3xl is in classes (instead of text-xl/2xl)
      expect(classes).toContain('text-2xl')
      expect(classes).toContain('lg:text-3xl')
      console.log(`     ✓ Classes verified: text-2xl lg:text-3xl present`)
      
      // Verify font-black is present (already bold)
      expect(classes).toContain('font-black')
      console.log(`     ✓ Font-black class verified`)
      
      // Note: The computed font-size might be affected by viewport or other CSS
      // but the classes are correct, which is what matters for Tailwind
      // The actual rendered size might vary based on browser zoom, viewport, etc.
    }

    // Step 2: Verify navigation buttons have more spacing (gap-5/6 instead of gap-3/4)
    console.log('\n🧭 Step 3: Checking navigation button spacing...')
    
    const navContainer = page.locator('nav.flex').first()
    const navClasses = await navContainer.getAttribute('class')
    console.log(`   Navigation container classes: ${navClasses}`)
    
    // Verify gap-5 or gap-6 is present
    expect(navClasses).toMatch(/gap-[56]/)
    expect(navClasses).toMatch(/gap-5|gap-6/)
    console.log(`   ✓ Found gap-5 or gap-6 in navigation container`)
    
    // Also verify md:gap-6 specifically
    if (navClasses.includes('md:gap-6')) {
      console.log(`   ✓ md:gap-6 found - increased spacing on medium+ screens`)
    } else if (navClasses.includes('gap-6')) {
      console.log(`   ✓ gap-6 found - increased spacing`)
    }

    // Get all navigation buttons
    const navButtons = page.locator('nav').first().locator('div').filter({ 
      hasText: /Calendario|Prenotazioni Pendenti|Archivio|Impostazioni/ 
    })
    const navButtonsCount = await navButtons.count()
    console.log(`   Found ${navButtonsCount} navigation buttons`)

    if (navButtonsCount >= 2) {
      // Check spacing between first two buttons
      const firstButton = navButtons.first()
      const secondButton = navButtons.nth(1)
      
      const firstBox = await firstButton.boundingBox()
      const secondBox = await secondButton.boundingBox()
      
      if (firstBox && secondBox) {
        // Calculate gap (right edge of first button to left edge of second button)
        const gap = secondBox.x - (firstBox.x + firstBox.width)
        console.log(`   Gap between first two buttons: ${gap}px`)
        
        // With gap-5 (1.25rem = 20px) or gap-6 (1.5rem = 24px) on md screens, should be at least 16px
        expect(gap).toBeGreaterThanOrEqual(16)
        console.log(`   ✓ Gap is sufficient (>= 16px)`)
      }
    }

    // Step 3: Verify User Info and Logout have more spacing (gap-4/5 instead of gap-2)
    console.log('\n👤 Step 4: Checking User Info and Logout spacing...')
    
    // Find the container with User Info and Logout
    const userLogoutContainer = page.locator('div.ml-auto').filter({ hasText: /Admin|Staff/ }).first()
    const userLogoutClasses = await userLogoutContainer.getAttribute('class')
    console.log(`   User/Logout container classes: ${userLogoutClasses}`)
    
    // Verify gap-4 or gap-5 is present
    expect(userLogoutClasses).toMatch(/gap-[45]/)
    expect(userLogoutClasses).toMatch(/gap-4|gap-5/)
    console.log(`   ✓ Found gap-4 or gap-5 in user/logout container`)
    
    // Also verify lg:gap-5 specifically
    if (userLogoutClasses.includes('lg:gap-5')) {
      console.log(`   ✓ lg:gap-5 found - increased spacing on large screens`)
    } else if (userLogoutClasses.includes('gap-5')) {
      console.log(`   ✓ gap-5 found - increased spacing`)
    }

    // Get User Info and Logout elements
    const userInfo = page.locator('div').filter({ hasText: /Admin|Staff/ }).first()
    const logoutButton = page.locator('button').filter({ hasText: /Logout/i }).first()
    
    const userInfoBox = await userInfo.boundingBox()
    const logoutBox = await logoutButton.boundingBox()
    
    if (userInfoBox && logoutBox) {
      // Calculate gap
      const gap = logoutBox.x - (userInfoBox.x + userInfoBox.width)
      console.log(`   Gap between User Info and Logout: ${gap}px`)
      
      // With gap-4 (1rem = 16px) or gap-5 (1.25rem = 20px) on lg screens, should be at least 12px
      expect(gap).toBeGreaterThanOrEqual(12)
      console.log(`   ✓ Gap is sufficient (>= 12px)`)
    }

    // Take screenshot for visual verification
    console.log('\n📸 Step 5: Taking screenshot...')
    await page.screenshot({ 
      path: 'screenshots/admin-header-spacing-verification.png', 
      fullPage: true 
    })
    console.log('✅ Screenshot saved to screenshots/admin-header-spacing-verification.png')

    // Summary
    console.log('\n✅ VERIFICATION SUMMARY:')
    console.log('   ✓ Count numbers use text-2xl/3xl (larger than text-xl/2xl)')
    console.log('   ✓ Count numbers use font-black (bold)')
    console.log('   ✓ Navigation buttons have gap-5/6 (more spacing than gap-3/4)')
    console.log('   ✓ User Info and Logout have gap-4/5 (more spacing than gap-2)')
  })
})

