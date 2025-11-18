import { test, expect } from '@playwright/test';

test('Verify BookingDetailsModal is visible and functional after fix', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('#email', '0cavuz0@gmail.com');
  await page.fill('#password', 'Cavallaro');
  await page.locator('button[type="submit"]').filter({ hasText: /accedi/i }).click();
  await page.waitForURL('**/admin', { timeout: 10000 });
  console.log('✅ Logged in');

  // Navigate to Calendario tab
  await page.locator('button').filter({ hasText: 'Calendario' }).click();
  await page.waitForSelector('.fc-view', { timeout: 5000 });
  console.log('✅ On Calendario tab');

  // Find and click a booking event
  const bookingEvent = page.locator('.fc-event').first();
  await expect(bookingEvent).toBeVisible();
  await bookingEvent.click();
  await page.waitForTimeout(500);

  // VERIFICATION 1: Modal is visible
  const modalHeader = page.locator('text=Dettagli Prenotazione');
  await expect(modalHeader).toBeVisible({ timeout: 5000 });
  console.log('✅ Modal is visible');

  // Take screenshot
  await page.screenshot({ path: 'e2e/screenshots/verify-modal-visible.png', fullPage: true });

  // VERIFICATION 2: Modal backdrop is visible
  const backdrop = page.locator('[style*="position: fixed"][style*="z-index: 99999"]').first();
  await expect(backdrop).toBeVisible();
  console.log('✅ Backdrop is visible');

  // VERIFICATION 3: Modal content is visible (check for tabs)
  const detailsTab = page.locator('button').filter({ hasText: 'Dettagli' });
  await expect(detailsTab).toBeVisible();
  console.log('✅ Modal content (tabs) visible');

  // VERIFICATION 4: Check buttons are visible
  const editButton = page.locator('button').filter({ hasText: 'Modifica' });
  const deleteButton = page.locator('button').filter({ hasText: 'Elimina' });
  await expect(editButton).toBeVisible();
  await expect(deleteButton).toBeVisible();
  console.log('✅ Action buttons visible');

  // VERIFICATION 5: Close button works
  const closeButton = page.locator('button[aria-label="Chiudi dettagli prenotazione"]');
  await expect(closeButton).toBeVisible();
  await closeButton.click();
  await page.waitForTimeout(500);

  // Modal should be closed
  await expect(modalHeader).not.toBeVisible();
  console.log('✅ Close button works');

  // VERIFICATION 6: Click outside to close
  await bookingEvent.click();
  await page.waitForTimeout(500);
  await expect(modalHeader).toBeVisible();
  console.log('✅ Modal reopened');

  // Click on backdrop (outside modal content)
  await page.mouse.click(100, 100); // Click on left side (backdrop area)
  await page.waitForTimeout(500);

  // Modal should be closed
  await expect(modalHeader).not.toBeVisible();
  console.log('✅ Click outside closes modal');

  console.log('🎉 All verifications passed!');
});
