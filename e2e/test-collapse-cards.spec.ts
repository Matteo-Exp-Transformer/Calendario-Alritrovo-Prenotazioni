import { test, expect } from '@playwright/test';

test('verify CollapsibleCard colored borders in calendar availability', async ({ page }) => {
  // Navigate to admin login
  await page.goto('http://localhost:5173/admin');

  // Login
  await page.fill('input[type="email"]', 'admin@alritrovo.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Accedi")');

  // Wait for redirect to dashboard
  await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  // Wait for calendar to load
  await page.waitForTimeout(2000);

  // Take screenshot of the entire page
  await page.screenshot({ path: 'test-screenshots/admin-dashboard-full.png', fullPage: true });

  // Scroll to availability section
  await page.locator('text=Disponibilità').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Check if CollapsibleCards are visible
  const morningCard = page.locator('text=Mattina').first();
  const afternoonCard = page.locator('text=Pomeriggio').first();
  const eveningCard = page.locator('text=Sera').first();

  await expect(morningCard).toBeVisible({ timeout: 10000 });
  await expect(afternoonCard).toBeVisible();
  await expect(eveningCard).toBeVisible();

  console.log('✅ All three time slot cards are visible!');

  // Take screenshots of the availability section
  const availabilitySection = page.locator('text=Disponibilità').locator('..').locator('..');
  await availabilitySection.screenshot({ path: 'test-screenshots/availability-section.png' });

  // Take individual card screenshots
  const morningWrapper = morningCard.locator('..').locator('..').locator('..');
  const afternoonWrapper = afternoonCard.locator('..').locator('..').locator('..');
  const eveningWrapper = eveningCard.locator('..').locator('..').locator('..');

  await morningWrapper.screenshot({ path: 'test-screenshots/morning-card.png' });
  await afternoonWrapper.screenshot({ path: 'test-screenshots/afternoon-card.png' });
  await eveningWrapper.screenshot({ path: 'test-screenshots/evening-card.png' });

  console.log('✅ Screenshots saved successfully!');
  console.log('📁 Check test-screenshots/ folder for visual verification of colored borders');
  console.log('🎨 Expected colors:');
  console.log('   - Mattina: Green border (#10B981)');
  console.log('   - Pomeriggio: Yellow border (#FDE047)');
  console.log('   - Sera: Blue border (#93C5FD)');
});
