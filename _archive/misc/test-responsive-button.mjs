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

const results = [];

for (const viewport of viewports) {
  try {
    console.log(`\n=== Testing ${viewport.name} (${viewport.width}x${viewport.height}) ===`);

    // Create new context and page for each viewport
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });
    const page = await context.newPage();

    // Navigate to login page
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    console.log('✓ Navigated to login page');

    // Fill login form with admin credentials
    await page.fill('#email', '0cavuz0@gmail.com');
    await page.fill('#password', 'Cavallaro');
    console.log('✓ Credentials filled');

    // Submit login
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i });
    await submitButton.click();
    console.log('✓ Login submitted');

    // Wait for redirect to admin
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log(`✓ Current URL: ${currentUrl}`);

    if (!currentUrl.includes('/admin')) {
      throw new Error('Login failed - not redirected to admin page');
    }

    // Wait for page to fully load
    await page.waitForTimeout(1500);

    // Find the CollapsibleCard header div (role="button" that contains the title)
    const headerDiv = page.locator('[role="button"]').filter({ has: page.locator('text=Inserisci nuova prenotazione') }).first();

    if (await headerDiv.count() > 0) {
      console.log('✓ Found CollapsibleCard header');

      // Click to expand
      await headerDiv.click({ timeout: 5000 });
      await page.waitForTimeout(1200);
      console.log('✓ Expanded CollapsibleCard');
    } else {
      console.log('⚠ CollapsibleCard header not found');
    }

    // Now find the submit button - search for "Crea Prenotazione"
    const creaPrenotazioneButton = page.locator('button').filter({ hasText: /Crea Prenotazione/ }).first();

    if (await creaPrenotazioneButton.count() > 0) {
      console.log('✓ Found "Crea Prenotazione" button');

      // Get button dimensions and position
      const boundingBox = await creaPrenotazioneButton.boundingBox();
      if (boundingBox) {
        console.log(`  - Position: x=${boundingBox.x}, y=${boundingBox.y}`);
        console.log(`  - Size: ${boundingBox.width}x${boundingBox.height}`);
        console.log(`  - Viewport width: ${viewport.width}`);

        // Calculate percentage width
        const percentageWidth = ((boundingBox.width / viewport.width) * 100).toFixed(1);
        console.log(`  - Percentage of viewport: ${percentageWidth}%`);

        // Get computed styles
        const computedStyle = await creaPrenotazioneButton.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            display: style.display,
            width: style.width,
            padding: style.padding,
            margin: style.margin,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight
          };
        });
        console.log(`  - Computed styles:`, JSON.stringify(computedStyle, null, 2));

        results.push({
          viewport: viewport.name,
          dimensions: `${boundingBox.width}x${boundingBox.height}`,
          position: `x=${boundingBox.x}, y=${boundingBox.y}`,
          percentageWidth: percentageWidth,
          visible: true,
          computedStyle: computedStyle
        });
      }
    } else {
      console.log('✗ Submit button not found');
      results.push({
        viewport: viewport.name,
        visible: false,
        error: 'Button not found'
      });
    }

    // Take screenshot of the expanded form area
    const screenshotPath = path.join(screenshotsDir, `${viewport.name}-button.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`✓ Screenshot saved to ${screenshotPath}`);

    await context.close();

  } catch (error) {
    console.error(`✗ Error testing ${viewport.name}:`, error.message);
    results.push({
      viewport: viewport.name,
      error: error.message
    });
  }
}

// Save results summary
const resultsSummary = JSON.stringify(results, null, 2);
fs.writeFileSync(path.join(screenshotsDir, 'results.json'), resultsSummary);
console.log('\n=== RESULTS ===');
console.log(resultsSummary);

await browser.close();
