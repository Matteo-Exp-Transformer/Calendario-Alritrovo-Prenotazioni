import { test, expect } from '@playwright/test';

test('Visual verification of Riepilogo Scelte padding increase (py-12)', async ({ page }) => {
  // 1. Navigate to booking page
  await page.goto('http://localhost:5175/prenota');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // 2. Select "Rinfresco di Laurea" from dropdown to show menu
  const dropdown = page.locator('select, [role="combobox"]').first();
  await dropdown.click();
  await page.waitForTimeout(500);

  // Try to select the option
  const rinfrescoOption = page.locator('text=Rinfresco di Laurea');
  if (await rinfrescoOption.isVisible()) {
    await rinfrescoOption.click();
  } else {
    // If it's a select element, use selectOption
    await page.selectOption('select', { label: 'Rinfresco di Laurea' });
  }
  await page.waitForTimeout(2000);

  // 3. Scroll down to find menu items
  await page.evaluate(() => {
    window.scrollTo(0, 1500);
  });
  await page.waitForTimeout(1000);

  // 4. Click on menu items to populate Riepilogo Scelte
  // Look for any clickable menu items
  const menuItems = page.locator('div').filter({ hasText: /Cannoli|Pizza|Panelle|Farinata/ });
  const firstItem = menuItems.first();

  if (await firstItem.isVisible()) {
    await firstItem.click();
    await page.waitForTimeout(500);
  }

  // Click another item
  const secondItem = menuItems.nth(1);
  if (await secondItem.isVisible()) {
    await secondItem.click();
    await page.waitForTimeout(500);
  }

  // 5. Take full page screenshot to capture everything
  await page.screenshot({
    path: 'e2e/screenshots/riepilogo-padding-test-py12.png',
    fullPage: true
  });

  console.log('Screenshot saved to: e2e/screenshots/riepilogo-padding-test-py12.png');
  console.log('Visual verification complete.');
});
