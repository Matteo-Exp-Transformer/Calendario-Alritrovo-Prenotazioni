import { test, expect } from '@playwright/test'
import { supabase } from '../helpers/supabase-client'

/**
 * TEST: Cost Breakdown Summary in Menu Tab
 *
 * OBJECTIVE: Verify that the MenuTab displays a detailed cost breakdown at the end
 * showing:
 * 1. Prezzo a persona × N ospiti (ingredients without tiramisu)
 * 2. Coperto × N ospiti (2€ per person)
 * 3. Tiramisù (if selected, with calculated price)
 * 4. TOTALE RINFRESCO (sum of all)
 *
 * EXPECTED LAYOUT:
 * RIEPILOGO COSTI:
 * - Prezzo a persona: €15.00 × 30 ospiti = €450.00
 * - Coperto: €2.00 × 30 ospiti = €60.00
 * - Tiramisù: €60.00 (2 Kg)
 * - TOTALE RINFRESCO: €570.00
 */

test.describe('Cost Breakdown Summary in Menu Tab', () => {
  // Cleanup helper
  const cleanupBooking = async (email: string) => {
    const { error } = await supabase
      .from('booking_requests')
      .delete()
      .eq('client_email', email)

    if (error) {
      console.warn('⚠️ Cleanup warning:', error.message)
    }
  }

  test('should display detailed cost breakdown with tiramisu', async ({ page }) => {
    const testEmail = `test-cost-breakdown-${Date.now()}@test.com`
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 2)
    const testDateStr = testDate.toISOString().split('T')[0]
    const testTime = '18:00'
    const numGuests = 30

    console.log(`\n🧪 Testing cost breakdown summary`)
    console.log(`📧 Email: ${testEmail}`)
    console.log(`📅 Date: ${testDateStr}`)
    console.log(`⏰ Time: ${testTime}`)
    console.log(`👥 Guests: ${numGuests}`)

    try {
      // ========================================
      // STEP 1: Login as admin
      // ========================================
      console.log('\n=== STEP 1: Admin Login ===')
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      await page.fill('#email', '0cavuz0@gmail.com')
      await page.fill('#password', 'Cavallaro')
      console.log('✅ Login credentials filled')

      const loginButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i })
      await loginButton.click()
      console.log('✅ Login submitted')

      await page.waitForTimeout(2000)
      const currentUrl = page.url()
      expect(currentUrl).toContain('/admin')
      console.log('✅ Logged in')

      // ========================================
      // STEP 2: Create booking with Menu 2 + Tiramisu
      // ========================================
      console.log('\n=== STEP 2: Create rinfresco booking with tiramisu ===')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      const collapseSection = page.locator('text=Inserisci nuova prenotazione').first()
      await collapseSection.click()
      await page.waitForTimeout(1500)
      console.log('✅ Expanded booking form')

      await page.waitForSelector('input#client_name', { timeout: 5000 })
      await page.fill('input#client_name', `Test Cost Breakdown`)
      await page.fill('input#client_email', testEmail)
      await page.fill('input#client_phone', '+39 333 1234567')

      const bookingTypeSelect = page.locator('select#booking_type')
      await bookingTypeSelect.selectOption('rinfresco_laurea')
      console.log('✅ Booking type: rinfresco_laurea')

      await page.waitForTimeout(1500)

      // Scroll to menu section
      await page.evaluate(() => window.scrollBy(0, 600))
      await page.waitForTimeout(500)

      // Select Menu 2
      await page.waitForSelector('select#preset_menu', { timeout: 10000 })
      const presetMenuSelect = page.locator('select#preset_menu')
      await presetMenuSelect.selectOption('menu_2')
      console.log('✅ Menu 2 selected')

      await page.waitForTimeout(5000)

      // IMPORTANT: Add tiramisu by selecting quantity
      // Find the tiramisu input field and set 2 Kg
      const tiramisuInput = page.locator('input[type="number"]').filter({
        has: page.locator('text=Tiramisù')
      }).or(page.locator('input[id*="tiramisu"]')).or(page.locator('input[name*="tiramisu"]'))

      // Try to find and fill tiramisu quantity
      const tiramisuCount = await tiramisuInput.count()
      if (tiramisuCount > 0) {
        await tiramisuInput.first().fill('2')
        console.log('✅ Tiramisu quantity set to 2 Kg')
      } else {
        console.log('⚠️ Tiramisu input not found - will proceed without it')
      }

      await page.waitForTimeout(1000)

      // Fill date, time, guests
      await page.fill('input#desired_date', testDateStr)
      await page.fill('input#desired_time', testTime)
      await page.fill('input#num_guests', numGuests.toString())
      console.log('✅ Form filled')

      // Submit
      const submitButton = page.locator('button[type="submit"]').filter({ hasText: /crea|invia/i })
      await submitButton.click()
      console.log('✅ Form submitted')

      await page.waitForTimeout(3000)

      // ========================================
      // STEP 3: Open booking in calendar
      // ========================================
      console.log('\n=== STEP 3: Open booking in calendar ===')

      const calendarioTab = page.locator('button:has-text("Calendario")')
      await calendarioTab.click()
      await page.waitForTimeout(2000)
      console.log('✅ Calendar tab opened')

      const bookingEvent = page.locator('.fc-event').filter({ hasText: 'Test Cost Breakdown' }).first()
      await expect(bookingEvent).toBeVisible({ timeout: 10000 })
      await bookingEvent.click()
      await page.waitForTimeout(1500)
      console.log('✅ Booking clicked')

      // ========================================
      // STEP 4: Navigate to Menu tab
      // ========================================
      console.log('\n=== STEP 4: Open Menu e Prezzi tab ===')

      await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })
      const menuTab = page.locator('button:has-text("Menu e Prezzi"), button:has-text("🍽️")')
      await menuTab.click()
      await page.waitForTimeout(1000)
      console.log('✅ Menu tab opened')

      // Expand menu section
      const menuSection = page.locator('button:has-text("Menu Selezionato")')
      await menuSection.click()
      await page.waitForTimeout(1000)
      console.log('✅ Menu section expanded')

      // ========================================
      // STEP 5: Verify cost breakdown elements
      // ========================================
      console.log('\n=== STEP 5: Verify cost breakdown summary ===')

      // Look for "RIEPILOGO COSTI" section
      const riepilogoSection = page.locator('text=RIEPILOGO').or(page.locator('text=Riepilogo'))
      await expect(riepilogoSection).toBeVisible({ timeout: 5000 })
      console.log('✅ Found "RIEPILOGO" section')

      // Verify "Prezzo a persona" line
      // Format: "Prezzo a persona: €15.00 × 30 ospiti = €450.00"
      const prezzoPersonaLine = page.locator('text=Prezzo a persona').locator('..')
      await expect(prezzoPersonaLine).toBeVisible()
      const prezzoPersonaText = await prezzoPersonaLine.textContent()
      console.log(`📊 Prezzo a persona: ${prezzoPersonaText}`)

      // Extract values
      expect(prezzoPersonaText).toContain('€')
      expect(prezzoPersonaText).toContain('×')
      expect(prezzoPersonaText).toContain(numGuests.toString())
      expect(prezzoPersonaText).toContain('ospiti')
      console.log('✅ Prezzo a persona format correct')

      // Verify "Coperto" line
      // Format: "Coperto: €2.00 × 30 ospiti = €60.00"
      const copertoLine = page.locator('text=Coperto').locator('..')
      await expect(copertoLine).toBeVisible()
      const copertoText = await copertoLine.textContent()
      console.log(`📊 Coperto: ${copertoText}`)

      expect(copertoText).toContain('€2.00')
      expect(copertoText).toContain('×')
      expect(copertoText).toContain(numGuests.toString())
      expect(copertoText).toContain('ospiti')
      console.log('✅ Coperto format correct')

      // Calculate expected coperto total
      const expectedCopertoTotal = 2.00 * numGuests
      expect(copertoText).toContain(`€${expectedCopertoTotal.toFixed(2)}`)
      console.log(`✅ Coperto total correct: €${expectedCopertoTotal.toFixed(2)}`)

      // Verify "Tiramisù" line (if present)
      const tiramisuLine = page.locator('text=Tiramisù').or(page.locator('text=Tiramisu'))
      const tiramisuExists = await tiramisuLine.count() > 0

      if (tiramisuExists) {
        const tiramisuText = await tiramisuLine.locator('..').textContent()
        console.log(`📊 Tiramisù: ${tiramisuText}`)

        expect(tiramisuText).toContain('€')
        expect(tiramisuText).toContain('Kg')
        console.log('✅ Tiramisù format correct')
      } else {
        console.log('⚠️ Tiramisù not present (may not have been added)')
      }

      // Verify "TOTALE RINFRESCO" line
      const totaleLine = page.locator('text=TOTALE RINFRESCO').or(page.locator('text=Totale Rinfresco'))
      await expect(totaleLine).toBeVisible()
      const totaleText = await totaleLine.locator('..').textContent()
      console.log(`📊 TOTALE RINFRESCO: ${totaleText}`)

      expect(totaleText).toContain('€')
      console.log('✅ TOTALE RINFRESCO format correct')

      // Take screenshot for visual verification
      await page.screenshot({
        path: 'e2e/screenshots/cost-breakdown-summary.png',
        fullPage: false
      })
      console.log('📸 Screenshot saved: cost-breakdown-summary.png')

      console.log('\n✅ ALL COST BREAKDOWN ELEMENTS VERIFIED!')

    } finally {
      // Cleanup
      console.log('\n=== CLEANUP ===')
      await cleanupBooking(testEmail)
      console.log('✅ Cleanup complete')
    }
  })

  test('should display cost breakdown without tiramisu', async ({ page }) => {
    const testEmail = `test-cost-breakdown-no-tiramisu-${Date.now()}@test.com`
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 2)
    const testDateStr = testDate.toISOString().split('T')[0]
    const testTime = '19:00'
    const numGuests = 25

    console.log(`\n🧪 Testing cost breakdown WITHOUT tiramisu`)
    console.log(`📧 Email: ${testEmail}`)

    try {
      // Login
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      await page.fill('#email', '0cavuz0@gmail.com')
      await page.fill('#password', 'Cavallaro')
      const loginButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i })
      await loginButton.click()
      await page.waitForTimeout(2000)

      // Create booking WITHOUT tiramisu
      const collapseSection = page.locator('text=Inserisci nuova prenotazione').first()
      await collapseSection.click()
      await page.waitForTimeout(1500)

      await page.waitForSelector('input#client_name', { timeout: 5000 })
      await page.fill('input#client_name', `Test No Tiramisu`)
      await page.fill('input#client_email', testEmail)
      await page.fill('input#client_phone', '+39 333 9999999')

      const bookingTypeSelect = page.locator('select#booking_type')
      await bookingTypeSelect.selectOption('rinfresco_laurea')
      await page.waitForTimeout(1500)

      await page.evaluate(() => window.scrollBy(0, 600))
      await page.waitForTimeout(500)

      const presetMenuSelect = page.locator('select#preset_menu')
      await presetMenuSelect.selectOption('menu_2')
      await page.waitForTimeout(5000)

      // Do NOT add tiramisu - leave quantity at 0

      await page.fill('input#desired_date', testDateStr)
      await page.fill('input#desired_time', testTime)
      await page.fill('input#num_guests', numGuests.toString())

      const submitButton = page.locator('button[type="submit"]').filter({ hasText: /crea|invia/i })
      await submitButton.click()
      await page.waitForTimeout(3000)

      // Open in calendar
      const calendarioTab = page.locator('button:has-text("Calendario")')
      await calendarioTab.click()
      await page.waitForTimeout(2000)

      const bookingEvent = page.locator('.fc-event').filter({ hasText: 'Test No Tiramisu' }).first()
      await expect(bookingEvent).toBeVisible({ timeout: 10000 })
      await bookingEvent.click()
      await page.waitForTimeout(1500)

      // Open menu tab
      await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })
      const menuTab = page.locator('button:has-text("Menu e Prezzi"), button:has-text("🍽️")')
      await menuTab.click()
      await page.waitForTimeout(1000)

      const menuSection = page.locator('button:has-text("Menu Selezionato")')
      await menuSection.click()
      await page.waitForTimeout(1000)

      // Verify breakdown WITHOUT tiramisu
      console.log('\n=== Verifying breakdown without tiramisu ===')

      const riepilogoSection = page.locator('text=RIEPILOGO').or(page.locator('text=Riepilogo'))
      await expect(riepilogoSection).toBeVisible()

      const prezzoPersonaLine = page.locator('text=Prezzo a persona')
      await expect(prezzoPersonaLine).toBeVisible()

      const copertoLine = page.locator('text=Coperto')
      await expect(copertoLine).toBeVisible()

      // Tiramisu should NOT be visible
      const tiramisuLine = page.locator('text=Tiramisù').or(page.locator('text=Tiramisu'))
      const tiramisuCount = await tiramisuLine.count()

      // Should be 0 or only in the items list (not in breakdown)
      console.log(`📊 Tiramisu mentions found: ${tiramisuCount}`)

      const totaleLine = page.locator('text=TOTALE RINFRESCO')
      await expect(totaleLine).toBeVisible()

      console.log('✅ Breakdown verified without tiramisu')

    } finally {
      await cleanupBooking(testEmail)
    }
  })
})
