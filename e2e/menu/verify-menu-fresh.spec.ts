import { test, expect } from '@playwright/test';

test('verify menu items after server restart - FRESH', async ({ page }) => {
  console.log('Starting FRESH verification after server restart...');

  // 1. Navigate to booking page
  await page.goto('http://localhost:5175/prenota');
  console.log('Navigated to booking page');

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 2. Fill form to show "Rinfresco di Laurea" menu
  console.log('Looking for booking type selector...');

  // Select "Rinfresco di Laurea"
  const bookingTypeSelect = page.locator('#booking_type');
  await bookingTypeSelect.waitFor({ state: 'visible', timeout: 10000 });
  await bookingTypeSelect.scrollIntoViewIfNeeded();
  await bookingTypeSelect.selectOption('rinfresco_laurea');
  console.log('✅ Selected Rinfresco di Laurea');

  // Wait for page to react to selection
  await page.waitForTimeout(1000);

  console.log('Filling form fields...');
  await page.fill('#client_name', 'Test Verification');
  await page.fill('#client_phone', '3331234567');
  await page.fill('#desired_date', '2025-12-15');
  await page.fill('#desired_time', '19:00');
  await page.fill('#num_guests', '10');

  // 3. Wait for menu to fully load
  console.log('Waiting for menu to load...');
  await page.waitForTimeout(3000); // Give time for menu to appear

  // Check if menu is visible
  const menuVisible = await page.locator('text=Menu disponibili per').isVisible().catch(() => false);
  console.log('Menu visible:', menuVisible);

  // 4. Take screenshot
  const screenshotPath = 'e2e/screenshots/menu-verification-fresh.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot saved to:', screenshotPath);

  // 5. Count items in each category
  console.log('\n=== COUNTING MENU ITEMS ===');

  const categories = [
    { name: 'Bevande', expectedCount: 3 },
    { name: 'Antipasti', expectedCount: 6 },
    { name: 'Fritti', expectedCount: 11 },
    { name: 'Primi Piatti', expectedCount: 4 },
    { name: 'Secondi Piatti', expectedCount: 6 }
  ];

  let totalItems = 0;
  const results: any[] = [];

  for (const category of categories) {
    // Find category section
    const categoryHeader = page.locator(`text=/^${category.name}$/i`).first();
    const categoryExists = await categoryHeader.isVisible().catch(() => false);

    if (!categoryExists) {
      console.log(`❌ Category "${category.name}" NOT FOUND`);
      results.push({ category: category.name, count: 0, expected: category.expectedCount, status: '❌ NOT FOUND' });
      continue;
    }

    // Count items in this category
    // Look for list items within the category section
    const categorySection = categoryHeader.locator('xpath=ancestor::div[contains(@class, "space-y")]').first();
    const items = categorySection.locator('li, div[class*="flex"]').filter({ hasText: /\w+/ });
    const count = await items.count();

    totalItems += count;
    const status = count === category.expectedCount ? '✅' : '❌';
    console.log(`${status} ${category.name}: ${count} items (expected: ${category.expectedCount})`);
    results.push({ category: category.name, count, expected: category.expectedCount, status });
  }

  console.log(`\n📊 TOTAL ITEMS: ${totalItems} (expected: 30)`);

  // 6. Verify Panelle appears exactly once
  console.log('\n=== CHECKING FOR DUPLICATES ===');
  const panelleItems = page.locator('text=/Panelle/i');
  const panelleCount = await panelleItems.count();
  console.log(`Panelle appears: ${panelleCount} time(s) (expected: 1)`);

  if (panelleCount === 1) {
    console.log('✅ No duplicates - Panelle appears exactly once');
  } else {
    console.log('❌ DUPLICATE FOUND - Panelle appears more than once!');
  }

  // Print summary
  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log('Screenshot:', screenshotPath);
  console.log('Total items:', totalItems, '/ 30');
  console.log('Panelle count:', panelleCount, '/ 1');
  console.log('\nCategory breakdown:');
  results.forEach(r => {
    console.log(`  ${r.status} ${r.category}: ${r.count}/${r.expected}`);
  });

  const allCorrect = totalItems === 30 && panelleCount === 1;
  console.log('\n' + (allCorrect ? '✅ VERIFICATION PASSED' : '❌ VERIFICATION FAILED'));
});

