import { test, expect } from '@playwright/test';

test('verify calendar to disponibilita spacing - no white space', async ({ page }) => {
  // Navigate to admin page
  await page.goto('http://localhost:5174/admin');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Check if login is required
  const loginForm = await page.locator('input[type="email"]').first();
  if (await loginForm.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Login required, attempting to sign in...');

    // Fill in login credentials (from docs/agent-knowledge)
    await page.fill('input[type="email"]', 'admin@alritrovo.it');
    await page.fill('input[type="password"]', 'admin123');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL('**/admin', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  }

  // Wait for calendar to be visible
  await page.waitForSelector('.fc', { timeout: 10000 });
  console.log('Calendar is visible');

  // Wait for Disponibilità section to be visible
  await page.waitForSelector('text=Disponibilità', { timeout: 5000 });
  console.log('Disponibilità section is visible');

  // Take screenshot of the full page
  await page.screenshot({
    path: 'e2e/screenshots/calendar-spacing-verification.png',
    fullPage: true
  });
  console.log('Screenshot saved to e2e/screenshots/calendar-spacing-verification.png');

  // Take focused screenshot of the calendar and disponibilità area
  const calendarSection = await page.locator('.fc').first();
  await calendarSection.screenshot({
    path: 'e2e/screenshots/calendar-section-only.png'
  });
  console.log('Calendar section screenshot saved');

  // Check for white space by looking at the computed styles
  const calendarContainer = await page.locator('.fc').first();
  const containerBox = await calendarContainer.boundingBox();

  if (containerBox) {
    console.log(`Calendar container position: y=${containerBox.y}, height=${containerBox.height}, bottom=${containerBox.y + containerBox.height}`);
  }

  // Check the background color of the parent container
  const parentBg = await page.evaluate(() => {
    const calendar = document.querySelector('.fc');
    if (!calendar) return 'not found';

    let parent = calendar.parentElement;
    while (parent) {
      const bg = window.getComputedStyle(parent).backgroundColor;
      console.log(`Parent element: ${parent.tagName}.${parent.className}, background: ${bg}`);

      // Look for white backgrounds
      if (bg === 'rgb(255, 255, 255)' || bg === 'white') {
        return `WHITE FOUND at ${parent.tagName}.${parent.className}`;
      }

      parent = parent.parentElement;
    }
    return 'No white background in parent chain';
  });

  console.log('Parent background check:', parentBg);

  // Report findings
  expect(parentBg).not.toContain('WHITE FOUND');
});
