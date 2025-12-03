import { test, expect } from '@playwright/test';

/**
 * Test per verificare che il padding della sezione "Riepilogo Scelte"
 * sia stato corretto usando inline styles invece di Tailwind classes
 */

test.describe('Riepilogo Scelte Padding Fix', () => {
  test('should have correct inline styles applied to content container', async ({ page }) => {
    // 1. Navigate to prenota page
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');

    // 2. Select a menu item to trigger "Riepilogo Scelte" to appear
    // Find first menu item checkbox and click it
    const firstMenuItem = page.locator('input[type="checkbox"]').first();
    await firstMenuItem.click();

    // Wait for Riepilogo section to appear
    await page.waitForSelector('text=Riepilogo Scelte', { state: 'visible' });

    // 3. Find the container div that should have inline styles
    // It's the div that wraps the buttons (chips)
    const riepilogoContentContainer = page.locator('text=Riepilogo Scelte')
      .locator('..')
      .locator('..'); // Go up to the card container

    const buttonContainer = riepilogoContentContainer.locator('div').nth(1); // Second div after header

    // 4. Verify inline styles are applied
    const paddingLeft = await buttonContainer.evaluate((el) =>
      window.getComputedStyle(el).paddingLeft
    );
    const paddingRight = await buttonContainer.evaluate((el) =>
      window.getComputedStyle(el).paddingRight
    );
    const paddingTop = await buttonContainer.evaluate((el) =>
      window.getComputedStyle(el).paddingTop
    );
    const paddingBottom = await buttonContainer.evaluate((el) =>
      window.getComputedStyle(el).paddingBottom
    );

    // 5. Assert expected values
    console.log('Padding values:', { paddingLeft, paddingRight, paddingTop, paddingBottom });

    expect(paddingLeft).toBe('24px');
    expect(paddingRight).toBe('24px');
    expect(paddingTop).toBe('20px');
    expect(paddingBottom).toBe('20px');

    // 6. Take screenshot for visual verification
    await page.screenshot({
      path: 'e2e/screenshots/riepilogo-padding-fixed.png',
      fullPage: true
    });
  });

  test('should have correct gap between chip buttons', async ({ page }) => {
    // 1. Navigate and select multiple items
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');

    // Select first 3 menu items to have multiple chips
    const menuItems = page.locator('input[type="checkbox"]');
    const count = Math.min(3, await menuItems.count());

    for (let i = 0; i < count; i++) {
      await menuItems.nth(i).click();
      await page.waitForTimeout(200); // Small delay between clicks
    }

    // Wait for Riepilogo section
    await page.waitForSelector('text=Riepilogo Scelte', { state: 'visible' });

    // 2. Find the flex wrapper with chip buttons
    const flexWrapper = page.locator('text=Riepilogo Scelte')
      .locator('..')
      .locator('..')
      .locator('div').nth(1)
      .locator('div').first();

    // 3. Verify gap style
    const gap = await flexWrapper.evaluate((el) =>
      window.getComputedStyle(el).gap
    );

    console.log('Gap value:', gap);
    expect(gap).toBe('16px');

    // 4. Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/riepilogo-gap-fixed.png',
      fullPage: true
    });
  });

  test('visual comparison: Riepilogo should have similar spacing to menu cards', async ({ page }) => {
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');

    // Select an item
    const firstMenuItem = page.locator('input[type="checkbox"]').first();
    await firstMenuItem.click();

    // Wait for both sections to be visible
    await page.waitForSelector('text=Riepilogo Scelte', { state: 'visible' });

    // Take full page screenshot for manual visual comparison
    await page.screenshot({
      path: 'e2e/screenshots/riepilogo-vs-cards-comparison.png',
      fullPage: true
    });

    // Get padding of a menu card for comparison
    const menuCard = page.locator('.menu-card-mobile').first();
    const cardPaddingTop = await menuCard.evaluate((el) =>
      window.getComputedStyle(el).paddingTop
    );

    // Get padding of Riepilogo content
    const riepilogoContent = page.locator('text=Riepilogo Scelte')
      .locator('..')
      .locator('..')
      .locator('div').nth(1);
    const riepilogoPaddingTop = await riepilogoContent.evaluate((el) =>
      window.getComputedStyle(el).paddingTop
    );

    console.log('Menu card paddingTop:', cardPaddingTop);
    console.log('Riepilogo paddingTop:', riepilogoPaddingTop);

    // Riepilogo should have more padding than menu cards (20px vs 6px)
    const riepilogoPaddingPx = parseInt(riepilogoPaddingTop);
    expect(riepilogoPaddingPx).toBeGreaterThanOrEqual(20);
  });
});
