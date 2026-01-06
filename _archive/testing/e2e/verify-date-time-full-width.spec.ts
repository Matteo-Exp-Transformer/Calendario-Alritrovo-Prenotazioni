import { test, expect } from '@playwright/test';

test.describe('Date and Time Input Full-Width Mobile Responsive Design', () => {
  test('should expand to full width on screens < 510px', async ({ page }) => {
    // Navigate to booking page
    await page.goto('http://localhost:5176/prenota');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Test at 375px width (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Wait for CSS to apply

    // Take screenshot at 375px
    await page.screenshot({
      path: 'e2e/screenshots/date-time-full-width-375px.png',
      fullPage: true
    });

    // Test at 480px width
    await page.setViewportSize({ width: 480, height: 800 });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'e2e/screenshots/date-time-full-width-480px.png',
      fullPage: true
    });

    // Test at 640px width (tablet - should NOT expand)
    await page.setViewportSize({ width: 640, height: 800 });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'e2e/screenshots/date-time-full-width-640px.png',
      fullPage: true
    });

    // Test at 1024px width (desktop - should maintain 600px max-width)
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'e2e/screenshots/date-time-full-width-1024px.png',
      fullPage: true
    });

    // Verify date input exists and is visible
    const dateInput = page.locator('.date-input-container');
    await expect(dateInput).toBeVisible();

    // Verify time input exists and is visible
    const timeInput = page.locator('.time-input-container');
    await expect(timeInput).toBeVisible();

    // Set viewport back to 375px for detailed checks
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Check computed styles at 375px
    const dateBox = await dateInput.boundingBox();
    const timeBox = await timeInput.boundingBox();

    console.log('Date input width at 375px:', dateBox?.width);
    console.log('Time input width at 375px:', timeBox?.width);

    // At 375px, inputs should be close to full width (accounting for padding)
    // Expected: ~359px (375px - 2*8px padding)
    if (dateBox) {
      expect(dateBox.width).toBeGreaterThan(350);
      expect(dateBox.width).toBeLessThan(380);
    }

    if (timeBox) {
      expect(timeBox.width).toBeGreaterThan(350);
      expect(timeBox.width).toBeLessThan(380);
    }
  });

  test('should maintain 600px max-width on desktop', async ({ page }) => {
    await page.goto('http://localhost:5176/prenota');
    await page.waitForLoadState('networkidle');

    // Set desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);

    const dateInput = page.locator('.date-input-container');
    const timeInput = page.locator('.time-input-container');

    const dateBox = await dateInput.boundingBox();
    const timeBox = await timeInput.boundingBox();

    console.log('Date input width at 1440px:', dateBox?.width);
    console.log('Time input width at 1440px:', timeBox?.width);

    // On desktop, should be capped at 600px max-width
    // Note: boundingBox includes padding (16px each side) and borders (1px each side)
    // So max visible width is ~634px (600px content + 32px padding + 2px border)
    if (dateBox) {
      expect(dateBox.width).toBeLessThanOrEqual(640);
      expect(dateBox.width).toBeGreaterThanOrEqual(630);
    }

    if (timeBox) {
      expect(timeBox.width).toBeLessThanOrEqual(640);
      expect(timeBox.width).toBeGreaterThanOrEqual(630);
    }
  });

  test('should have reduced border-radius (12px) on small screens', async ({ page }) => {
    await page.goto('http://localhost:5176/prenota');
    await page.waitForLoadState('networkidle');

    // Test at 375px
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const dateInput = page.locator('.date-input-container');
    const timeInput = page.locator('.time-input-container');

    // Check border-radius via computed style
    const dateStyle = await dateInput.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });

    const timeStyle = await timeInput.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });

    console.log('Date input border-radius at 375px:', dateStyle);
    console.log('Time input border-radius at 375px:', timeStyle);

    // Should be 12px, not 9999px
    expect(dateStyle).toBe('12px');
    expect(timeStyle).toBe('12px');
  });
});
