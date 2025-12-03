import { test, expect } from '@playwright/test';

test('inspect CollapsibleCard CSS in admin dashboard', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:5176/login');

  // Fill login form with admin credentials
  await page.fill('input[type="email"]', 'admin@alritrovo.it');
  await page.fill('input[type="password"]', 'alritrovo2024');

  // Click login button and wait for navigation
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }),
    page.click('button[type="submit"]')
  ]);

  // Wait for load
  await page.waitForLoadState('networkidle');

  // Wait a bit for everything to render
  await page.waitForTimeout(1000);

  // Take screenshot of the entire page
  await page.screenshot({
    path: 'e2e/screenshots/collapsible-card-full-page.png',
    fullPage: true
  });

  // Find the CollapsibleCard - it should be visible at the top of the main content
  const headerElement = page.locator('button').filter({ hasText: 'Inserisci nuova prenotazione' }).first();

  // Wait for it to be visible
  await headerElement.waitFor({ state: 'visible', timeout: 10000 });

  // Take screenshot of just the header area
  await headerElement.screenshot({
    path: 'e2e/screenshots/collapsible-card-header.png'
  });

  // Click to expand if collapsed
  const isExpanded = await headerElement.getAttribute('aria-expanded');
  if (isExpanded === 'false') {
    await headerElement.click();
    await page.waitForTimeout(500); // Wait for animation
  }

  // Now find the content region
  const contentElement = page.locator('[role="region"]').filter({ hasText: 'Nome' }).first();
  await contentElement.waitFor({ state: 'visible', timeout: 10000 });

  // Take screenshot of the expanded card
  await page.screenshot({
    path: 'e2e/screenshots/collapsible-card-expanded.png',
    fullPage: true
  });

  // Get the class names
  const headerClasses = await headerElement.evaluate((el) => el.className);
  const contentClasses = await contentElement.evaluate((el) => el.className);

  // Get the parent div classes (the actual header and content containers)
  const headerParent = await headerElement.evaluate((el) => {
    return {
      className: el.parentElement?.className || '',
      tagName: el.parentElement?.tagName || ''
    };
  });

  const contentParent = await contentElement.evaluate((el) => {
    return {
      className: el.parentElement?.className || '',
      tagName: el.parentElement?.tagName || ''
    };
  });

  // Get computed styles for background-color
  const headerBgColor = await headerElement.evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });

  const headerParentBgColor = await headerElement.evaluate((el) => {
    return el.parentElement ? window.getComputedStyle(el.parentElement).backgroundColor : '';
  });

  const contentBgColor = await contentElement.evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });

  const contentParentBgColor = await contentElement.evaluate((el) => {
    return el.parentElement ? window.getComputedStyle(el.parentElement).backgroundColor : '';
  });

  // Get all computed styles for debugging
  const headerAllStyles = await headerElement.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    const parentStyles = el.parentElement ? window.getComputedStyle(el.parentElement) : null;
    return {
      button: {
        backgroundColor: styles.backgroundColor,
        background: styles.background,
        color: styles.color,
        padding: styles.padding,
        border: styles.border,
        borderRadius: styles.borderRadius,
      },
      parent: parentStyles ? {
        backgroundColor: parentStyles.backgroundColor,
        background: parentStyles.background,
        color: parentStyles.color,
        padding: parentStyles.padding,
        border: parentStyles.border,
        borderRadius: parentStyles.borderRadius,
      } : null
    };
  });

  const contentAllStyles = await contentElement.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    const parentStyles = el.parentElement ? window.getComputedStyle(el.parentElement) : null;
    return {
      region: {
        backgroundColor: styles.backgroundColor,
        background: styles.background,
        color: styles.color,
        padding: styles.padding,
        border: styles.border,
        borderRadius: styles.borderRadius,
      },
      parent: parentStyles ? {
        backgroundColor: parentStyles.backgroundColor,
        background: parentStyles.background,
        color: parentStyles.color,
        padding: parentStyles.padding,
        border: parentStyles.border,
        borderRadius: parentStyles.borderRadius,
      } : null
    };
  });

  // Log all findings
  console.log('\n=== HEADER BUTTON ===');
  console.log('Button Classes:', headerClasses);
  console.log('Button Background Color:', headerBgColor);
  console.log('Parent Info:', headerParent);
  console.log('Parent Background Color:', headerParentBgColor);
  console.log('All Styles:', JSON.stringify(headerAllStyles, null, 2));

  console.log('\n=== CONTENT REGION ===');
  console.log('Region Classes:', contentClasses);
  console.log('Region Background Color:', contentBgColor);
  console.log('Parent Info:', contentParent);
  console.log('Parent Background Color:', contentParentBgColor);
  console.log('All Styles:', JSON.stringify(contentAllStyles, null, 2));

  // Output summary
  const results = {
    header: {
      button: {
        classes: headerClasses,
        backgroundColor: headerBgColor,
      },
      parent: {
        ...headerParent,
        backgroundColor: headerParentBgColor,
      },
      allStyles: headerAllStyles,
    },
    content: {
      region: {
        classes: contentClasses,
        backgroundColor: contentBgColor,
      },
      parent: {
        ...contentParent,
        backgroundColor: contentParentBgColor,
      },
      allStyles: contentAllStyles,
    },
  };

  console.log('\n=== FINAL RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
});
