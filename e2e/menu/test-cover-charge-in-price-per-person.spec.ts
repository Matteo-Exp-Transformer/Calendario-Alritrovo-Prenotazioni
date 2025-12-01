import { test, expect } from '@playwright/test'
import { supabase } from '../helpers/supabase-client'

/**
 * TEST: Cover Charge in Price Per Person (Menu Tab)
 *
 * OBJECTIVE: Verify that the "Totale a persona" in the MenuTab of BookingDetailsModal
 * includes the 2€ cover charge for "rinfresco di laurea" bookings.
 *
 * EXPECTED BEHAVIOR:
 * - For "rinfresco di laurea": Totale a persona = base menu price + 2€ coperto
 * - For "tavolo": Totale a persona = base menu price (no cover charge)
 *
 * TEST APPROACH:
 * 1. Create a "rinfresco di laurea" booking with Menu 2
 * 2. Open the BookingDetailsModal
 * 3. Click on "Menu e Prezzi" tab
 * 4. Read the "Totale a persona" value
 * 5. Expand the menu section to see items
 * 6. Calculate the base price by summing item prices (excluding tiramisu)
 * 7. Verify that "Totale a persona" = base price + 2€
 */

test.describe('Cover Charge in Price Per Person', () => {
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

  test('should include 2€ cover charge in "Totale a persona" for rinfresco di laurea', async ({ page }) => {
    const testEmail = `test-cover-charge-${Date.now()}@test.com`
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 2) // Day after tomorrow
    const testDateStr = testDate.toISOString().split('T')[0] // YYYY-MM-DD
    const testTime = '18:00'

    console.log(`\n🧪 Testing cover charge in price per person`)
    console.log(`📧 Email: ${testEmail}`)
    console.log(`📅 Date: ${testDateStr}`)
    console.log(`⏰ Time: ${testTime}`)

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
      console.log('✅ Logged in and redirected to /admin')

      // ========================================
      // STEP 2: Create a rinfresco di laurea booking with Menu 2
      // ========================================
      console.log('\n=== STEP 2: Create rinfresco di laurea booking ===')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Expand "Inserisci nuova prenotazione" section
      const collapseSection = page.locator('text=Inserisci nuova prenotazione').first()
      await collapseSection.click()
      await page.waitForTimeout(1500)
      console.log('✅ Expanded booking form')

      // Fill form fields
      await page.waitForSelector('input#client_name', { timeout: 5000 })
      await page.fill('input#client_name', `Test Cover Charge ${testTime}`)
      await page.fill('input#client_email', testEmail)
      await page.fill('input#client_phone', '+39 333 1234567')

      // Select booking type: "rinfresco_laurea"
      const bookingTypeSelect = page.locator('select#booking_type')
      await bookingTypeSelect.selectOption('rinfresco_laurea')
      console.log('✅ Booking type selected: rinfresco_laurea')

      await page.waitForTimeout(1500)

      // Scroll down to see the menu section
      await page.evaluate(() => window.scrollBy(0, 600))
      await page.waitForTimeout(500)

      // Select Menu 2 (Rinfresco completo)
      await page.waitForSelector('select#preset_menu', { timeout: 10000 })
      const presetMenuSelect = page.locator('select#preset_menu')
      await presetMenuSelect.selectOption('menu_2')
      console.log('✅ Preset menu selected: menu_2')

      // Wait for form to update after menu selection
      await page.waitForTimeout(5000)

      // Fill date and time
      await page.fill('input#desired_date', testDateStr)
      await page.fill('input#desired_time', testTime)
      await page.fill('input#num_guests', '30')
      console.log('✅ Form filled with date, time, and guests')

      // Submit form
      const submitButton = page.locator('button[type="submit"]').filter({ hasText: /crea|invia/i })
      await submitButton.click()
      console.log('✅ Form submitted')

      // Wait for booking to be created
      await page.waitForTimeout(3000)

      // ========================================
      // STEP 3: Navigate to calendar and find the booking
      // ========================================
      console.log('\n=== STEP 3: Find booking in calendar ===')

      // Click on "Calendario" tab
      const calendarioTab = page.locator('button:has-text("Calendario")')
      await calendarioTab.click()
      await page.waitForTimeout(2000)
      console.log('✅ Navigated to calendar tab')

      // Find the booking event in the calendar
      // Look for an event that contains the client name
      const bookingEvent = page.locator('.fc-event').filter({ hasText: 'Test Cover Charge' }).first()
      await expect(bookingEvent).toBeVisible({ timeout: 10000 })
      console.log('✅ Found booking in calendar')

      // Click on the booking to open BookingDetailsModal
      await bookingEvent.click()
      await page.waitForTimeout(1500)
      console.log('✅ Clicked on booking event')

      // ========================================
      // STEP 4: Verify modal opened and navigate to Menu tab
      // ========================================
      console.log('\n=== STEP 4: Open Menu e Prezzi tab ===')

      // Wait for modal to open
      await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })
      console.log('✅ BookingDetailsModal opened')

      // Click on "Menu e Prezzi" tab (icon 🍽️)
      const menuTab = page.locator('button:has-text("Menu e Prezzi"), button:has-text("🍽️")')
      await menuTab.click()
      await page.waitForTimeout(1000)
      console.log('✅ Clicked on "Menu e Prezzi" tab')

      // ========================================
      // STEP 5: Read "Totale a persona" value
      // ========================================
      console.log('\n=== STEP 5: Read "Totale a persona" ===')

      // The "Totale a persona" is displayed in the summary section
      const totalPerPersonText = await page.locator('text=Totale a persona:').locator('..').textContent()
      console.log(`📊 Totale a persona text: ${totalPerPersonText}`)

      // Extract price value (format: "Totale a persona: €15.00")
      const totalPerPersonMatch = totalPerPersonText?.match(/€(\d+\.\d{2})/)
      expect(totalPerPersonMatch).toBeTruthy()
      const totalPerPerson = parseFloat(totalPerPersonMatch![1])
      console.log(`💰 Totale a persona value: €${totalPerPerson}`)

      // ========================================
      // STEP 6: Expand menu section and calculate base price
      // ========================================
      console.log('\n=== STEP 6: Calculate base price from menu items ===')

      // Click on the collapsible section to expand it
      const menuSection = page.locator('button:has-text("Menu Selezionato")')
      await menuSection.click()
      await page.waitForTimeout(1000)
      console.log('✅ Expanded "Menu Selezionato" section')

      // Read all item prices (excluding tiramisu)
      // Items are displayed as "• Item Name €X.XX"
      const itemElements = page.locator('li').filter({ hasText: /€\d+\.\d{2}/ })
      const itemCount = await itemElements.count()
      console.log(`📋 Found ${itemCount} menu items`)

      let basePrice = 0
      for (let i = 0; i < itemCount; i++) {
        const itemText = await itemElements.nth(i).textContent()
        console.log(`  Item ${i + 1}: ${itemText}`)

        // Skip tiramisu (calculated separately in total booking)
        if (itemText?.toLowerCase().includes('tiramis')) {
          console.log(`  ⏩ Skipping tiramisu (not included in per-person price)`)
          continue
        }

        // Extract price (format: "• Item Name €X.XX")
        const priceMatch = itemText?.match(/€(\d+\.\d{2})/)
        if (priceMatch) {
          const itemPrice = parseFloat(priceMatch[1])
          basePrice += itemPrice
          console.log(`  💶 Item price: €${itemPrice} (running total: €${basePrice})`)
        }
      }

      console.log(`\n📊 CALCULATED BASE PRICE: €${basePrice.toFixed(2)}`)

      // ========================================
      // STEP 7: Verify that "Totale a persona" includes cover charge
      // ========================================
      console.log('\n=== STEP 7: Verify cover charge included ===')

      const COVER_CHARGE = 2.0
      const expectedTotalPerPerson = basePrice + COVER_CHARGE

      console.log(`\n📊 VERIFICATION:`)
      console.log(`  Base price: €${basePrice.toFixed(2)}`)
      console.log(`  Cover charge: €${COVER_CHARGE.toFixed(2)}`)
      console.log(`  Expected total: €${expectedTotalPerPerson.toFixed(2)}`)
      console.log(`  Actual total: €${totalPerPerson.toFixed(2)}`)

      // THIS ASSERTION WILL FAIL (RED) because currently the system does NOT include cover charge
      expect(totalPerPerson).toBe(expectedTotalPerPerson)

      if (totalPerPerson === expectedTotalPerPerson) {
        console.log(`\n✅ TEST PASSED: Cover charge is correctly included!`)
      } else {
        console.log(`\n❌ TEST FAILED: Cover charge is NOT included!`)
        console.log(`   Expected: €${expectedTotalPerPerson.toFixed(2)}`)
        console.log(`   Got: €${totalPerPerson.toFixed(2)}`)
        console.log(`   Difference: €${(expectedTotalPerPerson - totalPerPerson).toFixed(2)}`)
      }

    } finally {
      // Cleanup
      console.log('\n=== CLEANUP ===')
      await cleanupBooking(testEmail)
      console.log('✅ Test booking cleaned up')
    }
  })
})
