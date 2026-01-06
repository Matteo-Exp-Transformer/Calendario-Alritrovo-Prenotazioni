import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

/**
 * E2E Tests for BookingDetailsModal - Text Selection Bug Fix
 *
 * Bug: Modal closes when selecting text in input fields/textareas
 * if mouse is released outside the modal bounds.
 *
 * Fix: Track mouse down inside modal to distinguish between:
 * - Intentional backdrop clicks (should close)
 * - Text selection drags ending outside modal (should NOT close)
 */

test.describe('BookingDetailsModal - Text Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    const loginSuccess = await loginAsAdmin(page)
    if (!loginSuccess) {
      console.log('❌ Login failed - skipping test')
      test.skip()
      return
    }

    // Navigate to Calendario tab
    const calendarTab = page.locator('button:has-text("Calendario")').first()
    await calendarTab.waitFor({ state: 'visible', timeout: 10000 })
    await calendarTab.click()
    await page.waitForTimeout(2000)

    // Wait for calendar to load
    await page.waitForSelector('.fc-daygrid-day', { timeout: 10000 })

    // Click on a booking to open the modal (assuming there's at least one booking)
    const firstEvent = page.locator('.fc-event').first()
    await firstEvent.waitFor({ state: 'visible', timeout: 10000 })
    await firstEvent.click()

    // Wait for modal to open
    await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })

    // Enter edit mode
    await page.click('button:has-text("Modifica")')
    await page.waitForSelector('button:has-text("Salva")', { timeout: 3000 })
  })

  test('Should not close modal when selecting text in Nome input field', async ({ page }) => {
    const nomeInput = page.locator('input[type="text"]').filter({ hasText: /^$/ }).first()
    await nomeInput.waitFor({ state: 'visible' })

    // Get input bounding box
    const inputBox = await nomeInput.boundingBox()
    if (!inputBox) throw new Error('Nome input not found')

    // Simulate text selection: mouse down inside input, drag, mouse up outside modal (far right)
    await page.mouse.move(inputBox.x + 10, inputBox.y + inputBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(inputBox.x + inputBox.width - 10, inputBox.y + inputBox.height / 2)
    // Move mouse far outside modal to the right (simulating releasing outside modal bounds)
    await page.mouse.move(inputBox.x + inputBox.width + 500, inputBox.y + inputBox.height / 2)
    await page.mouse.up()

    // Wait a bit to ensure any click handlers have fired
    await page.waitForTimeout(500)

    // Modal should still be open
    await expect(page.locator('text=Dettagli Prenotazione')).toBeVisible()
    await expect(page.locator('button:has-text("Salva")')).toBeVisible()
  })

  test('Should not close modal when selecting text in Note Speciali textarea', async ({ page }) => {
    // First, ensure we're viewing a 'tavolo' booking type that has "Note Speciali"
    const bookingTypeSelect = page.locator('select').first()

    // Check if select is visible (we're in edit mode)
    const isSelectVisible = await bookingTypeSelect.isVisible().catch(() => false)

    if (!isSelectVisible) {
      console.log('⚠️ Not in edit mode or no select found - skipping test')
      test.skip()
      return
    }

    await bookingTypeSelect.waitFor({ state: 'visible', timeout: 3000 })

    // Select 'tavolo' to ensure "Note Speciali" textarea is visible
    await bookingTypeSelect.selectOption('tavolo')
    await page.waitForTimeout(500)

    // Find the textarea for "Note Speciali"
    const textarea = page.locator('textarea').first()
    const isTextareaVisible = await textarea.isVisible().catch(() => false)

    if (!isTextareaVisible) {
      console.log('⚠️ Textarea not visible - booking might not be tavolo type - skipping test')
      test.skip()
      return
    }

    await textarea.waitFor({ state: 'visible', timeout: 3000 })

    // Type some text first to have content to select
    await textarea.fill('Questa è una nota speciale per testare la selezione del testo.')

    // Get textarea bounding box
    const textareaBox = await textarea.boundingBox()
    if (!textareaBox) throw new Error('Textarea not found')

    // Simulate text selection: mouse down inside textarea, drag, mouse up outside modal
    await page.mouse.move(textareaBox.x + 10, textareaBox.y + 10)
    await page.mouse.down()
    await page.mouse.move(textareaBox.x + textareaBox.width - 10, textareaBox.y + 10)
    // Move mouse far outside modal to the right
    await page.mouse.move(textareaBox.x + textareaBox.width + 500, textareaBox.y + 10)
    await page.mouse.up()

    // Wait a bit to ensure any click handlers have fired
    await page.waitForTimeout(500)

    // Modal should still be open
    await expect(page.locator('text=Dettagli Prenotazione')).toBeVisible()
    await expect(page.locator('button:has-text("Salva")')).toBeVisible()
  })

  test('Should close modal when clicking backdrop directly (without prior modal interaction)', async ({ page }) => {
    // First, cancel edit mode to return to view mode
    await page.click('button:has-text("Annulla")')
    await page.waitForTimeout(300)

    // Get modal bounding box to know where backdrop is
    const modal = page.locator('div[style*="position: absolute"]').filter({ hasText: 'Dettagli Prenotazione' })
    const modalBox = await modal.boundingBox()
    if (!modalBox) throw new Error('Modal not found')

    // Click on backdrop (far to the left of the modal, which slides in from right)
    // Modal is positioned on the right side, so clicking on the left should hit backdrop
    await page.mouse.click(50, modalBox.y + modalBox.height / 2)

    // Wait a bit for modal close animation
    await page.waitForTimeout(500)

    // Modal should be closed
    await expect(page.locator('text=Dettagli Prenotazione')).not.toBeVisible()
  })

  test('Should not close modal when clicking inside modal content area', async ({ page }) => {
    // Click somewhere inside the modal content (on a label or empty space)
    const detailsHeading = page.locator('text=Informazioni Cliente')
    await detailsHeading.waitFor({ state: 'visible' })
    await detailsHeading.click()

    // Wait a bit to ensure any handlers have fired
    await page.waitForTimeout(500)

    // Modal should still be open
    await expect(page.locator('text=Dettagli Prenotazione')).toBeVisible()
    await expect(page.locator('button:has-text("Salva")')).toBeVisible()
  })
})
