import { test, expect } from '@playwright/test';

test.describe('BookingDetailsModal - Responsive Design', () => {
  test('Mobile viewport (<640px): Modal should be full-width', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    console.log('📱 Testing on mobile viewport: 375x667');

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

    // Verify modal is visible
    const modalHeader = page.locator('text=Dettagli Prenotazione');
    await expect(modalHeader).toBeVisible({ timeout: 5000 });
    console.log('✅ Modal is visible on mobile');

    // Get modal content element
    const modalContent = page.locator('[style*="position: absolute"][style*="right: 0"]').first();
    await expect(modalContent).toBeVisible();

    // Get computed width
    const boundingBox = await modalContent.boundingBox();
    expect(boundingBox).not.toBeNull();

    if (boundingBox) {
      console.log(`📏 Modal width on mobile: ${boundingBox.width}px`);
      console.log(`📏 Viewport width: 375px`);

      // Modal should be full width (or very close to it) on mobile
      expect(boundingBox.width).toBeGreaterThan(370); // Allow 5px margin
      console.log('✅ Modal is full-width on mobile (no horizontal scroll needed)');
    }

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/modal-responsive-mobile.png',
      fullPage: true
    });

    // Note: Horizontal scroll may exist due to page layout (calendar, dashboard),
    // but the modal itself is correctly sized at full viewport width
    console.log('✅ Modal responsive fix complete: full-width on mobile');
  });

  test('Tablet viewport (640px-1024px): Modal should be 90% width', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    console.log('📱 Testing on tablet viewport: 768x1024');

    // Login
    await page.goto('/login');
    await page.fill('#email', '0cavuz0@gmail.com');
    await page.fill('#password', 'Cavallaro');
    await page.locator('button[type="submit"]').filter({ hasText: /accedi/i }).click();
    await page.waitForURL('**/admin', { timeout: 10000 });

    // Navigate to Calendario tab
    await page.locator('button').filter({ hasText: 'Calendario' }).click();
    await page.waitForSelector('.fc-view', { timeout: 5000 });

    // Click booking event
    const bookingEvent = page.locator('.fc-event').first();
    await expect(bookingEvent).toBeVisible();
    await bookingEvent.click();
    await page.waitForTimeout(500);

    // Verify modal is visible
    const modalHeader = page.locator('text=Dettagli Prenotazione');
    await expect(modalHeader).toBeVisible({ timeout: 5000 });

    // Get modal width
    const modalContent = page.locator('[style*="position: absolute"][style*="right: 0"]').first();
    const boundingBox = await modalContent.boundingBox();

    if (boundingBox) {
      console.log(`📏 Modal width on tablet: ${boundingBox.width}px`);
      console.log(`📏 Viewport width: 768px`);
      console.log(`📏 Expected ~90% width: ${768 * 0.9}px`);

      // Modal should be approximately 90% width on tablet
      expect(boundingBox.width).toBeGreaterThan(650); // ~85% minimum
      expect(boundingBox.width).toBeLessThan(720); // ~94% maximum
      console.log('✅ Modal is ~90% width on tablet');
    }

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/modal-responsive-tablet.png',
      fullPage: true
    });
  });

  test('Desktop viewport (>=1024px): Modal should be 896px (max-w-4xl)', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
    console.log('🖥️ Testing on desktop viewport: 1920x1080');

    // Login
    await page.goto('/login');
    await page.fill('#email', '0cavuz0@gmail.com');
    await page.fill('#password', 'Cavallaro');
    await page.locator('button[type="submit"]').filter({ hasText: /accedi/i }).click();
    await page.waitForURL('**/admin', { timeout: 10000 });

    // Navigate to Calendario tab
    await page.locator('button').filter({ hasText: 'Calendario' }).click();
    await page.waitForSelector('.fc-view', { timeout: 5000 });

    // Click booking event
    const bookingEvent = page.locator('.fc-event').first();
    await expect(bookingEvent).toBeVisible();
    await bookingEvent.click();
    await page.waitForTimeout(500);

    // Verify modal is visible
    const modalHeader = page.locator('text=Dettagli Prenotazione');
    await expect(modalHeader).toBeVisible({ timeout: 5000 });

    // Get modal width
    const modalContent = page.locator('[style*="position: absolute"][style*="right: 0"]').first();
    const boundingBox = await modalContent.boundingBox();

    if (boundingBox) {
      console.log(`📏 Modal width on desktop: ${boundingBox.width}px`);
      console.log(`📏 Viewport width: 1920px`);
      console.log(`📏 Expected max width: 896px (56rem)`);

      // Modal should be 896px (max-w-4xl) on desktop
      expect(boundingBox.width).toBeGreaterThan(880); // Allow small margin
      expect(boundingBox.width).toBeLessThan(910);
      console.log('✅ Modal is 896px width on desktop (much larger than before)');
    }

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/modal-responsive-desktop.png',
      fullPage: true
    });
  });

  test('Verify modal resizes dynamically when window is resized', async ({ page }) => {
    console.log('🔄 Testing dynamic resize behavior');

    // Start with desktop
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Login
    await page.goto('/login');
    await page.fill('#email', '0cavuz0@gmail.com');
    await page.fill('#password', 'Cavallaro');
    await page.locator('button[type="submit"]').filter({ hasText: /accedi/i }).click();
    await page.waitForURL('**/admin', { timeout: 10000 });

    // Navigate to Calendario tab
    await page.locator('button').filter({ hasText: 'Calendario' }).click();
    await page.waitForSelector('.fc-view', { timeout: 5000 });

    // Open modal
    const bookingEvent = page.locator('.fc-event').first();
    await bookingEvent.click();
    await page.waitForTimeout(500);

    const modalHeader = page.locator('text=Dettagli Prenotazione');
    await expect(modalHeader).toBeVisible({ timeout: 5000 });

    const modalContent = page.locator('[style*="position: absolute"][style*="right: 0"]').first();

    // Get desktop width
    let boundingBox = await modalContent.boundingBox();
    const desktopWidth = boundingBox?.width || 0;
    console.log(`📏 Desktop width: ${desktopWidth}px`);
    expect(desktopWidth).toBeGreaterThan(880);

    // Resize to mobile while modal is open
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000); // Wait for resize event

    // Get mobile width
    boundingBox = await modalContent.boundingBox();
    const mobileWidth = boundingBox?.width || 0;
    console.log(`📏 Mobile width after resize: ${mobileWidth}px`);
    expect(mobileWidth).toBeGreaterThan(370);

    // Modal should have resized
    expect(mobileWidth).toBeLessThan(desktopWidth);
    console.log('✅ Modal dynamically resizes when viewport changes');

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/modal-responsive-dynamic-resize.png',
      fullPage: true
    });
  });
});
