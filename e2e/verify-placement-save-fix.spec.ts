import { test, expect } from '@playwright/test'

/**
 * Test to verify that the placement field is correctly saved
 * when modifying a booking through BookingDetailsModal
 *
 * Bug: Previously, the placement field was not being saved because
 * it was missing from the updateData object in useUpdateBooking mutation
 *
 * Fix: Added placement field to updateData in useBookingMutations.ts
 */

test.describe('Placement Field Save Fix', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5175/admin/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Wait for navigation to admin dashboard
    await page.waitForURL('**/admin/dashboard')
    await page.waitForTimeout(2000) // Wait for bookings to load
  })

  test('should save placement field when editing a booking', async ({ page }) => {
    // Find a booking on the calendar and click it to open details modal
    const firstEvent = page.locator('.fc-event').first()
    await expect(firstEvent).toBeVisible({ timeout: 10000 })
    await firstEvent.click()

    // Wait for modal to open
    await expect(page.locator('text=Dettagli Prenotazione')).toBeVisible({ timeout: 5000 })

    // Click "Modifica" button to enter edit mode
    await page.click('button:has-text("Modifica")')

    // Wait for edit mode
    await expect(page.locator('button:has-text("Salva")')).toBeVisible()

    // Find and interact with placement dropdown
    // The Select component from Radix UI uses a trigger button
    const placementTrigger = page.locator('[role="combobox"]').filter({ hasText: /Seleziona sala|Sala A|Sala B|Deorr|Nessuna preferenza/i })
    await expect(placementTrigger).toBeVisible()

    // Click to open dropdown
    await placementTrigger.click()

    // Wait for options to appear
    await page.waitForTimeout(500)

    // Select "Sala A"
    await page.click('[role="option"]:has-text("Sala A")')

    // Wait for selection to be applied
    await page.waitForTimeout(500)

    // Save the changes
    await page.click('button:has-text("Salva")')

    // Wait for save to complete
    await expect(page.locator('text=Prenotazione modificata con successo')).toBeVisible({ timeout: 10000 })

    // Wait for modal to exit edit mode
    await page.waitForTimeout(1000)

    // Close and reopen modal to verify persistence
    // Click X button to close modal
    await page.click('[aria-label="Chiudi"]')

    // Wait for modal to close
    await page.waitForTimeout(1000)

    // Reopen the same booking
    await firstEvent.click()

    // Wait for modal to reopen
    await expect(page.locator('text=Dettagli Prenotazione')).toBeVisible()

    // Verify that placement shows "Sala A"
    await expect(page.locator('text=Posizionamento')).toBeVisible()
    await expect(page.locator('text=Sala A')).toBeVisible()

    console.log('✅ Placement field correctly saved and persisted!')
  })

  test('should clear placement field when setting to "Nessuna preferenza"', async ({ page }) => {
    // Find a booking and open it
    const firstEvent = page.locator('.fc-event').first()
    await expect(firstEvent).toBeVisible({ timeout: 10000 })
    await firstEvent.click()

    // Enter edit mode
    await page.click('button:has-text("Modifica")')
    await expect(page.locator('button:has-text("Salva")')).toBeVisible()

    // Set placement to "Sala B" first
    const placementTrigger = page.locator('[role="combobox"]').filter({ hasText: /Seleziona sala|Sala A|Sala B|Deorr|Nessuna preferenza/i })
    await placementTrigger.click()
    await page.waitForTimeout(500)
    await page.click('[role="option"]:has-text("Sala B")')
    await page.waitForTimeout(500)

    // Save
    await page.click('button:has-text("Salva")')
    await expect(page.locator('text=Prenotazione modificata con successo')).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Now clear it by selecting "Nessuna preferenza"
    await page.click('button:has-text("Modifica")')
    await placementTrigger.click()
    await page.waitForTimeout(500)
    await page.click('[role="option"]:has-text("Nessuna preferenza")')
    await page.waitForTimeout(500)

    // Save again
    await page.click('button:has-text("Salva")')
    await expect(page.locator('text=Prenotazione modificata con successo')).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Close and reopen
    await page.click('[aria-label="Chiudi"]')
    await page.waitForTimeout(1000)
    await firstEvent.click()

    // Verify that placement shows "Non specificato" (cleared)
    await expect(page.locator('text=Posizionamento')).toBeVisible()
    await expect(page.locator('text=Non specificato')).toBeVisible()

    console.log('✅ Placement field correctly cleared!')
  })
})
