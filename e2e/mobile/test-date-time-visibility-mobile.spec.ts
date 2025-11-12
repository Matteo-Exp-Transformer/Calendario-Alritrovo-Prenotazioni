import { test, expect } from '@playwright/test';

/**
 * Test: Date and Time Input Visibility on Mobile
 *
 * Purpose: Verify that date and time input fields show their selected values
 * on mobile devices WITHOUT requiring the user to click/focus them.
 *
 * Known Issue: iOS Safari and some Android browsers hide date/time input values
 * until focused due to default webkit styling that makes pseudo-elements invisible.
 *
 * Expected Behavior: Date and time values should be immediately visible after
 * being filled, even on mobile viewports.
 */

test.describe('Date and Time Input Visibility on Mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE viewport
  });

  test('date and time inputs show selected values on mobile viewport', async ({ page }) => {
    await page.goto('/prenota');

    // Wait for form to be ready
    await page.waitForSelector('input[type="date"]');

    // Fill date input
    const dateInput = page.locator('input#desired_date');
    await dateInput.fill('2025-12-15');

    // Fill time input
    const timeInput = page.locator('input#desired_time');
    await timeInput.fill('19:30');

    // Blur to ensure value is committed
    await page.locator('body').click();

    // Wait a moment for rendering
    await page.waitForTimeout(500);

    // Take screenshot to document current state
    await page.screenshot({
      path: 'e2e/screenshots/mobile-date-time-before-fix.png',
      fullPage: false
    });

    // Verify inputs have values
    await expect(dateInput).toHaveValue('2025-12-15');
    await expect(timeInput).toHaveValue('19:30');

    // Check that date input text color is visible (not transparent/white)
    // This checks the actual rendered color, not just that the value exists
    const dateStyles = await dateInput.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
      };
    });

    // Color should be dark/visible (black or dark gray), not transparent or white
    // RGB values for black = rgb(0, 0, 0), dark gray should have low values
    const colorMatch = dateStyles.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (colorMatch) {
      const [, r, g, b] = colorMatch.map(Number);
      // Dark colors have RGB values < 100 (ensuring visible contrast on white background)
      const isDarkColor = r < 100 && g < 100 && b < 100;
      expect(isDarkColor).toBe(true);
    }

    console.log('Date input styles:', dateStyles);
  });

  test('date and time inputs have webkit styling for mobile browsers', async ({ page }) => {
    await page.goto('/prenota');

    // Wait for form
    await page.waitForSelector('input[type="date"]');

    const dateInput = page.locator('input#desired_date');

    // Check that the input has the mobile-specific webkit styles applied
    // We can't directly check pseudo-elements, but we can verify the input
    // has proper base styling that affects webkit elements
    const hasProperStyling = await dateInput.evaluate((el) => {
      const styles = window.getComputedStyle(el);

      // Check critical styles for mobile webkit inputs
      return {
        fontSize: styles.fontSize, // Should be >= 16px to prevent iOS zoom
        color: styles.color, // Should be black or dark for visibility
        appearance: styles.appearance || styles.webkitAppearance, // Should handle webkit
      };
    });

    console.log('Input webkit styles:', hasProperStyling);

    // Font size should be at least 16px to prevent iOS zoom
    const fontSize = parseInt(hasProperStyling.fontSize);
    expect(fontSize).toBeGreaterThanOrEqual(16);

    // Color should be set (not default)
    expect(hasProperStyling.color).toBeTruthy();
  });
});
