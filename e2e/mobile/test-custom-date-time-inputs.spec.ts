import { test, expect } from '@playwright/test';

/**
 * Test: Custom Date and Time Inputs for Mobile Reliability
 *
 * Purpose: Verify that date and time inputs use custom select-based components
 * instead of native <input type="date"> and <input type="time">.
 *
 * Problem: Native date/time inputs use platform-specific pickers on mobile that:
 * - Hide values until focused (iOS Safari, Android Chrome)
 * - Cannot be styled with CSS webkit pseudo-elements
 * - Provide inconsistent UX across devices
 *
 * Solution: Custom components using <select> dropdowns:
 * - Values always visible (dropdown text)
 * - Full control over styling and behavior
 * - Consistent UX across all devices
 */

test.describe('Custom Date and Time Inputs for Mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE viewport
  });

  test('time input uses custom TimeInput component with select dropdowns', async ({ page }) => {
    await page.goto('/prenota');

    // Wait for form to load
    await page.waitForSelector('#client_name');

    // Verify TimeInput component is being used (has select dropdowns, not native input)
    const timeContainer = page.locator('#desired_time');

    // TimeInput has two select elements (hour and minute)
    const hourSelect = timeContainer.locator('select').first();
    const minuteSelect = timeContainer.locator('select').last();

    await expect(hourSelect).toBeVisible();
    await expect(minuteSelect).toBeVisible();

    // Select hour and minute
    await hourSelect.selectOption('19');
    await minuteSelect.selectOption('30');

    // Verify values are immediately visible without needing to focus
    await expect(hourSelect).toHaveValue('19');
    await expect(minuteSelect).toHaveValue('30');

    // Take screenshot showing visible dropdown values
    await page.screenshot({
      path: 'e2e/screenshots/mobile-custom-time-input.png',
      fullPage: false
    });
  });

  test('date input uses custom DateInput component with select dropdowns', async ({ page }) => {
    await page.goto('/prenota');

    // Wait for form to load
    await page.waitForSelector('#client_name');

    // Verify DateInput component is being used (has select dropdowns, not native input)
    const dateContainer = page.locator('#desired_date');

    // DateInput should have three select elements (day, month, year)
    const daySelect = dateContainer.locator('select[aria-label="Giorno"], select').first();
    const monthSelect = dateContainer.locator('select[aria-label="Mese"]');
    const yearSelect = dateContainer.locator('select[aria-label="Anno"]');

    await expect(daySelect).toBeVisible();
    await expect(monthSelect).toBeVisible();
    await expect(yearSelect).toBeVisible();

    // Select date: 15 December 2025
    await daySelect.selectOption('15');
    await monthSelect.selectOption('12');
    await yearSelect.selectOption('2025');

    // Verify values are immediately visible without needing to focus
    await expect(daySelect).toHaveValue('15');
    await expect(monthSelect).toHaveValue('12');
    await expect(yearSelect).toHaveValue('2025');

    // Take screenshot showing visible dropdown values
    await page.screenshot({
      path: 'e2e/screenshots/mobile-custom-date-input.png',
      fullPage: false
    });
  });

  test('native date and time inputs are NOT used', async ({ page }) => {
    await page.goto('/prenota');

    // Wait for form to load
    await page.waitForSelector('#client_name');

    // Verify no native date/time inputs are present
    const nativeDateInput = page.locator('input[type="date"]');
    const nativeTimeInput = page.locator('input[type="time"]');

    await expect(nativeDateInput).toHaveCount(0);
    await expect(nativeTimeInput).toHaveCount(0);
  });
});
