import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// Ensure screenshots directory exists
const screenshotsDir = 'e2e/screenshots/responsive-button-test';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const browser = await chromium.launch();

// Test viewports
const viewports = [
  { name: 'mobile-iphone-se', width: 375, height: 667 },
  { name: 'tablet-ipad', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 }
];

for (const viewport of viewports) {
  try {
    console.log(`\nTaking full-page screenshot for ${viewport.name}...`);

    // Create new context and page for each viewport
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });
    const page = await context.newPage();

    // Navigate to login page
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

    // Fill login form with admin credentials
    await page.fill('#email', '0cavuz0@gmail.com');
    await page.fill('#password', 'Cavallaro');

    // Submit login
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i });
    await submitButton.click();

    // Wait for redirect to admin
    await page.waitForTimeout(3000);

    // Wait for page to fully load
    await page.waitForTimeout(1500);

    // Find and click the header to expand
    const headerDiv = page.locator('[role="button"]').filter({ has: page.locator('text=Inserisci nuova prenotazione') }).first();
    if (await headerDiv.count() > 0) {
      await headerDiv.click({ timeout: 5000 });
      await page.waitForTimeout(1200);
    }

    // Take full page screenshot
    const screenshotPath = path.join(screenshotsDir, `${viewport.name}-fullpage.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✓ Full-page screenshot saved to ${screenshotPath}`);

    await context.close();

  } catch (error) {
    console.error(`✗ Error for ${viewport.name}:`, error.message);
  }
}

await browser.close();
