import { test, expect } from '@playwright/test';

/**
 * Test Suite: Archive Tab Card Alignment
 * Purpose: Verify Archive cards match BookingRequestCard styling
 * - Check gradient background and border styling
 * - Verify 2-column grid layout in header
 * - Ensure no duplicate status badges
 * - Check expanded content is clean and organized
 * - Verify text layers are not chaotic
 */

test.describe('Archive Tab - Card Styling Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Login with real credentials (matching existing test format)
    await page.fill('#email', process.env.ADMIN_EMAIL || '0cavuz0@gmail.com');
    await page.fill('#password', process.env.ADMIN_PASSWORD || 'Cavallaro');
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i });
    await submitButton.click();

    // Wait for dashboard to load
    await page.waitForURL('**/admin');
    await page.waitForLoadState('networkidle');
  });

  test('TC1: Archive cards have proper gradient styling and borders', async ({ page }) => {
    // Click on Archivio tab
    await page.click('text=Archivio');
    await page.waitForTimeout(1000);

    // Take screenshot of Archive tab
    await page.screenshot({
      path: 'screenshots/archive-tab-overview.png',
      fullPage: true
    });

    // Check if cards exist
    const cards = page.locator('[style*="linear-gradient"]').filter({ hasText: 'ARCHIVIATA' });
    const cardCount = await cards.count();

    if (cardCount === 0) {
      console.log('⚠️ No archived bookings found. Test cannot verify card styling.');
      test.skip();
      return;
    }

    console.log(`✅ Found ${cardCount} archived booking cards`);

    // Verify first card has proper styling
    const firstCard = cards.first();
    const cardStyle = await firstCard.getAttribute('style');

    // Check for gradient background
    expect(cardStyle).toContain('linear-gradient');
    expect(cardStyle).toContain('rgba(240, 244, 255');
    expect(cardStyle).toContain('rgba(224, 231, 255');
    expect(cardStyle).toContain('rgba(216, 220, 254');

    // Check for border
    expect(cardStyle).toContain('border');
    expect(cardStyle).toContain('rgba(129, 140, 248');

    console.log('✅ Archive cards have proper gradient and border styling');
  });

  test('TC2: Archive cards use 2-column grid layout', async ({ page }) => {
    // Click on Archivio tab
    await page.click('text=Archivio');
    await page.waitForTimeout(1000);

    const cards = page.locator('[style*="linear-gradient"]').filter({ hasText: 'ARCHIVIATA' });
    const cardCount = await cards.count();

    if (cardCount === 0) {
      console.log('⚠️ No archived bookings found.');
      test.skip();
      return;
    }

    // Check first card has grid layout
    const firstCard = cards.first();
    const gridContainer = firstCard.locator('.grid.grid-cols-2').first();

    // Verify grid container exists
    await expect(gridContainer).toBeVisible();

    // Take screenshot of first card
    await firstCard.screenshot({ path: 'screenshots/archive-card-collapsed.png' });

    console.log('✅ Archive cards use 2-column grid layout');
  });

  test('TC3: No duplicate status badges in Archive cards', async ({ page }) => {
    // Click on Archivio tab
    await page.click('text=Archivio');
    await page.waitForTimeout(1000);

    const cards = page.locator('[style*="linear-gradient"]').filter({ hasText: 'ARCHIVIATA' });
    const cardCount = await cards.count();

    if (cardCount === 0) {
      console.log('⚠️ No archived bookings found.');
      test.skip();
      return;
    }

    // Check first card for status badges
    const firstCard = cards.first();
    const statusBadges = firstCard.locator('text=ARCHIVIATA');
    const badgeCount = await statusBadges.count();

    // Should only have ONE status badge per card
    expect(badgeCount).toBe(1);

    console.log('✅ No duplicate status badges found');
  });

  test('TC4: Archive card expands and shows clean content', async ({ page }) => {
    // Click on Archivio tab
    await page.click('text=Archivio');
    await page.waitForTimeout(1000);

    const cards = page.locator('[style*="linear-gradient"]').filter({ hasText: 'ARCHIVIATA' });
    const cardCount = await cards.count();

    if (cardCount === 0) {
      console.log('⚠️ No archived bookings found.');
      test.skip();
      return;
    }

    const firstCard = cards.first();

    // Click to expand card
    await firstCard.click();
    await page.waitForTimeout(500);

    // Take screenshot of expanded card
    await firstCard.screenshot({ path: 'screenshots/archive-card-expanded.png' });

    // Verify expanded content has grid layout
    const expandedGrid = firstCard.locator('.grid.grid-cols-2').nth(1);
    await expect(expandedGrid).toBeVisible();

    // Verify "Visualizza nel Calendario" button exists
    const calendarButton = firstCard.locator('button:has-text("Visualizza nel Calendario")');
    await expect(calendarButton).toBeVisible();

    console.log('✅ Archive card expands with clean, organized content');
  });

  test('TC5: Compare Archive cards with Pending cards alignment', async ({ page }) => {
    // First, capture Pending tab cards
    await page.click('text=Prenotazioni Pendenti');
    await page.waitForTimeout(1000);

    const pendingCards = page.locator('[style*="linear-gradient"]').filter({ hasText: 'PENDING' });
    const pendingCount = await pendingCards.count();

    if (pendingCount > 0) {
      await pendingCards.first().screenshot({ path: 'screenshots/pending-card-reference.png' });
      console.log('✅ Captured Pending card for comparison');
    }

    // Now capture Archive tab cards
    await page.click('text=Archivio');
    await page.waitForTimeout(1000);

    const archiveCards = page.locator('[style*="linear-gradient"]').filter({ hasText: 'ARCHIVIATA' });
    const archiveCount = await archiveCards.count();

    if (archiveCount > 0) {
      await archiveCards.first().screenshot({ path: 'screenshots/archive-card-comparison.png' });
      console.log('✅ Captured Archive card for comparison');
    }

    // Take full page screenshot showing both tabs
    await page.screenshot({
      path: 'screenshots/archive-vs-pending-full.png',
      fullPage: true
    });

    console.log('✅ Screenshots captured for manual visual comparison');
  });

  test('TC6: Archive filter buttons work correctly', async ({ page }) => {
    // Click on Archivio tab
    await page.click('text=Archivio');
    await page.waitForTimeout(1000);

    // Check if filter buttons exist
    const filterButtons = page.locator('button').filter({ hasText: /Tutte|Drink\/Caraffe|Cena|Aperitivo/ });
    const filterCount = await filterButtons.count();

    expect(filterCount).toBeGreaterThan(0);
    console.log(`✅ Found ${filterCount} filter buttons`);

    // Test clicking different filters
    if (filterCount >= 2) {
      // Click second filter
      await filterButtons.nth(1).click();
      await page.waitForTimeout(500);

      // Take screenshot with filter applied
      await page.screenshot({
        path: 'screenshots/archive-with-filter.png',
        fullPage: true
      });

      console.log('✅ Filter buttons are functional');
    }
  });

  test('TC7: Icons are properly sized and not excessive', async ({ page }) => {
    // Click on Archivio tab
    await page.click('text=Archivio');
    await page.waitForTimeout(1000);

    const cards = page.locator('[style*="linear-gradient"]').filter({ hasText: 'ARCHIVIATA' });
    const cardCount = await cards.count();

    if (cardCount === 0) {
      console.log('⚠️ No archived bookings found.');
      test.skip();
      return;
    }

    const firstCard = cards.first();

    // Check icon sizes (should be w-4 h-4 or w-5 h-5, not excessive)
    const icons = firstCard.locator('svg');
    const iconCount = await icons.count();

    console.log(`✅ Card contains ${iconCount} icons`);

    // Verify icons are not too large (no w-8 h-8 or larger)
    for (let i = 0; i < iconCount; i++) {
      const icon = icons.nth(i);
      const iconClass = await icon.getAttribute('class') || '';

      // Should not have large size classes
      expect(iconClass).not.toContain('w-8');
      expect(iconClass).not.toContain('h-8');
      expect(iconClass).not.toContain('w-10');
      expect(iconClass).not.toContain('h-10');
    }

    console.log('✅ Icons are properly sized, not excessive');
  });
});
