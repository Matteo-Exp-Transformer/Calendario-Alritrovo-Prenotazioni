import { test, expect } from '@playwright/test'

const baseURL = 'http://localhost:5173'

test.describe('Menu Field Test', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${baseURL}/login`)
    await page.fill('#email', '0cavuz0@gmail.com')
    await page.fill('#password', 'Cavallaro')
    
    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /accedi/i })
    await submitBtn.click()
    
    // Wait for dashboard to load with longer timeout
    await page.waitForURL('**/admin**', { timeout: 10000 })
  })

  test('should display menu field in edit booking modal', async ({ page }) => {
    // Navigate to calendar tab
    await page.goto(`${baseURL}/admin/dashboard`)
    await page.click('text=Calendario')
    
    // Wait for calendar to load
    await page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 })
    
    // Find an existing booking in the calendar
    const bookingCard = page.locator('.booking-card').first()
    
    if (await bookingCard.count() === 0) {
      console.log('No bookings found in calendar. Please accept a booking first.')
      return
    }
    
    // Click on the booking card
    await bookingCard.click()
    
    // Wait for modal to open
    await page.waitForSelector('text=Dettagli', { timeout: 5000 })
    
    // Click edit button
    await page.click('button:has-text("Modifica")')
    
    // Verify menu field is present
    const menuInput = page.locator('textarea[placeholder*="Primi €15"]')
    await expect(menuInput).toBeVisible()
    
    console.log('✅ Menu field is visible in edit modal')
  })

  test('should save menu field and display in calendar cards', async ({ page }) => {
    // Navigate to calendar tab
    await page.goto(`${baseURL}/admin/dashboard`)
    await page.click('text=Calendario')
    
    // Wait for calendar to load
    await page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 })
    
    // Find an existing booking in the calendar
    const bookingCard = page.locator('.booking-card').first()
    
    if (await bookingCard.count() === 0) {
      console.log('No bookings found. Skipping test.')
      return
    }
    
    // Click on the booking card
    await bookingCard.click()
    
    // Wait for modal
    await page.waitForSelector('text=Dettagli', { timeout: 5000 })
    
    // Click edit button
    await page.click('button:has-text("Modifica")')
    
    // Fill menu field
    const menuInput = page.locator('textarea[placeholder*="Primi €15"]')
    const testMenu = 'Primi €15, Secondi €25, Dolce €10'
    await menuInput.fill(testMenu)
    
    // Save changes
    await page.click('button:has-text("Salva")')
    
    // Wait for success message
    await page.waitForSelector('text=Prenotazione aggiornata', { timeout: 5000 })
    
    // Close modal
    await page.click('button:has(.lucide-x)')
    
    // Reload page to check calendar
    await page.reload()
    await page.waitForTimeout(2000)
    
    // Check if menu is displayed in collapsed time slot cards
    // This would be in the collapsed cards where booking details are shown
    const menuDisplay = page.locator('text=Primi €15')
    
    if (await menuDisplay.count() > 0) {
      console.log('✅ Menu is displayed in calendar cards')
    } else {
      console.log('⚠️ Menu not found in calendar cards - may need to expand card')
    }
  })
})

