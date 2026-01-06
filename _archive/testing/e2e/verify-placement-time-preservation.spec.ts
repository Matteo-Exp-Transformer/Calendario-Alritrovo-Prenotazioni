import { test, expect } from '@playwright/test'

test('placement change should not affect booking times', async ({ page }) => {
  await page.goto('http://localhost:5175/admin')
  await page.fill('input[type="email"]', 'admin@test.com')
  await page.fill('input[type="password"]', 'testpass')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/admin')

  const firstBooking = page.locator('.booking-card').first()
  await firstBooking.click()

  await page.click('button:has-text("Modifica")')

  const startTimeInput = page.locator('input[type="time"]').first()
  const endTimeInput = page.locator('input[type="time"]').nth(1)
  const originalStartTime = await startTimeInput.inputValue()
  const originalEndTime = await endTimeInput.inputValue()

  // Cambia placement
  await page.click('[data-radix-select-trigger]')
  await page.click('text=Sala A')
  await page.waitForTimeout(500)

  const newStartTime = await startTimeInput.inputValue()
  const newEndTime = await endTimeInput.inputValue()
  expect(newStartTime).toBe(originalStartTime)
  expect(newEndTime).toBe(originalEndTime)
})
