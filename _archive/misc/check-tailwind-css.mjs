import { chromium } from '@playwright/test';

async function checkTailwindCss() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log('1. Navigating with hard refresh (bypassing cache)...');
    await page.goto('http://localhost:5175/prenota', { waitUntil: 'networkidle' });

    // Force hard refresh by reloading with no cache
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('2. Checking if py-12 CSS rule exists in stylesheets...');
    const py12Exists = await page.evaluate(() => {
      // Check all stylesheets for .py-12 rule
      const sheets = Array.from(document.styleSheets);
      let found = false;
      let py12Rule = null;

      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.selectorText === '.py-12') {
              found = true;
              py12Rule = {
                cssText: rule.cssText,
                paddingTop: rule.style.paddingTop,
                paddingBottom: rule.style.paddingBottom
              };
              break;
            }
          }
          if (found) break;
        } catch (e) {
          // CORS error for external stylesheets, skip
        }
      }

      return { found, py12Rule };
    });

    console.log('\npy-12 CSS rule check:', JSON.stringify(py12Exists, null, 2));

    console.log('\n3. Selecting Rinfresco and adding items...');
    await page.selectOption('#booking_type', 'rinfresco_laurea');
    await page.waitForTimeout(2000);

    const menuItems = page.locator('label').filter({ hasText: '€' });
    const count = await menuItems.count();
    console.log(`   Found ${count} menu items`);

    if (count >= 2) {
      await menuItems.nth(0).click();
      await page.waitForTimeout(500);
      await menuItems.nth(1).click();
      await page.waitForTimeout(1000);
    }

    console.log('4. Re-checking py-12 after interaction...');
    const cssInfoAfter = await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find(el =>
        el.textContent?.includes('Riepilogo Scelte')
      );

      if (!h3) return { error: 'Riepilogo not found' };

      const container = h3.parentElement?.nextElementSibling;
      if (!container) return { error: 'Container not found' };

      const computed = window.getComputedStyle(container);

      // Also check if the CSS rule exists in stylesheets
      const sheets = Array.from(document.styleSheets);
      let py12FromStylesheet = null;

      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.selectorText === '.py-12') {
              py12FromStylesheet = rule.cssText;
              break;
            }
          }
          if (py12FromStylesheet) break;
        } catch (e) {}
      }

      return {
        className: container.className,
        computedPaddingTop: computed.paddingTop,
        computedPaddingBottom: computed.paddingBottom,
        py12StylesheetRule: py12FromStylesheet,
        allComputedStyles: {
          padding: computed.padding,
          paddingTop: computed.paddingTop,
          paddingBottom: computed.paddingBottom,
          paddingLeft: computed.paddingLeft,
          paddingRight: computed.paddingRight
        }
      };
    });

    console.log('\n=== DETAILED CSS ANALYSIS ===');
    console.log(JSON.stringify(cssInfoAfter, null, 2));

    if (!cssInfoAfter.py12StylesheetRule) {
      console.log('\n⚠ CRITICAL: .py-12 CSS rule NOT FOUND in stylesheets!');
      console.log('This means Tailwind is not generating the py-12 class.');
      console.log('Possible causes:');
      console.log('  1. Tailwind config not including the file path');
      console.log('  2. Build process needs restart');
      console.log('  3. CSS file not being imported properly');
    } else {
      console.log('\n✓ .py-12 rule exists in stylesheet:', cssInfoAfter.py12StylesheetRule);
      if (cssInfoAfter.computedPaddingTop === '0px') {
        console.log('⚠ But it\'s being overridden or not applied!');
      }
    }

  } catch (error) {
    console.error('\nError:', error.message);
  } finally {
    await page.close();
    await browser.close();
  }
}

checkTailwindCss();
