import { chromium } from '@playwright/test';

async function inspectRiepilogo() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log('1. Navigating to booking form...');
    await page.goto('http://localhost:5175/prenota');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    console.log('2. Selecting Rinfresco di Laurea...');
    await page.selectOption('#booking_type', 'rinfresco_laurea');
    await page.waitForTimeout(2000);

    console.log('3. Clicking on menu items by finding their container divs...');
    // Find menu items by looking for elements containing prices (€)
    const menuItemContainers = page.locator('label').filter({ hasText: '€' });
    const count = await menuItemContainers.count();
    console.log(`   Found ${count} menu items with prices`);

    if (count >= 3) {
      for (let i = 0; i < 3; i++) {
        await menuItemContainers.nth(i).scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await menuItemContainers.nth(i).click();
        console.log(`   Clicked menu item ${i + 1}`);
        await page.waitForTimeout(700);
      }
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/riepilogo-items-selected.png', fullPage: true });

    console.log('4. Checking for Riepilogo Scelte...');
    const riepilogoHeader = page.locator('h3:has-text("Riepilogo Scelte")');
    const riepilogoVisible = await riepilogoHeader.isVisible();
    console.log(`   Riepilogo Scelte visible: ${riepilogoVisible}`);

    if (riepilogoVisible) {
      console.log('5. Scrolling to Riepilogo Scelte...');
      await riepilogoHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);

      console.log('6. Inspecting container CSS...');
      const cssInfo = await page.evaluate(() => {
        const h3 = Array.from(document.querySelectorAll('h3')).find(el =>
          el.textContent?.includes('Riepilogo Scelte')
        );

        if (!h3) return { error: 'H3 not found' };

        const headerParent = h3.parentElement;
        const container = headerParent?.nextElementSibling;

        if (!container) {
          return {
            error: 'Container not found',
            headerHTML: h3.outerHTML,
            headerParentHTML: headerParent?.outerHTML.substring(0, 400)
          };
        }

        const computed = window.getComputedStyle(container);

        return {
          success: true,
          tagName: container.tagName,
          className: container.className,
          paddingTop: computed.paddingTop,
          paddingBottom: computed.paddingBottom,
          paddingLeft: computed.paddingLeft,
          paddingRight: computed.paddingRight,
          paddingTopPx: parseFloat(computed.paddingTop),
          paddingBottomPx: parseFloat(computed.paddingBottom),
          allClasses: container.className.split(' ').filter(c => c.trim()),
          outerHTML: container.outerHTML.substring(0, 600)
        };
      });

      console.log('\n=== RIEPILOGO SCELTE CSS INSPECTION ===');
      console.log(JSON.stringify(cssInfo, null, 2));

      if (cssInfo.success) {
        const hasPy12 = cssInfo.allClasses?.includes('py-12');
        const hasPy6 = cssInfo.allClasses?.includes('py-6');
        const paddingMatch = cssInfo.paddingTopPx === 48;

        console.log('\n=== ANALYSIS ===');
        console.log('Has py-12 class:', hasPy12);
        console.log('Has py-6 class:', hasPy6);
        console.log('Computed padding-top:', cssInfo.paddingTop, `(${cssInfo.paddingTopPx}px)`);
        console.log('Computed padding-bottom:', cssInfo.paddingBottom, `(${cssInfo.paddingBottomPx}px)`);
        console.log('\nExpected for py-12: 48px (3rem)');
        console.log('Expected for py-6: 24px (1.5rem)');
        console.log('\n' + (paddingMatch ? '✓ py-12 IS APPLIED CORRECTLY' : '✗ py-12 NOT APPLIED'));

        if (!paddingMatch) {
          console.log('\n⚠ WARNING: Expected 48px but got', cssInfo.paddingTopPx + 'px');
          console.log('Possible causes:');
          console.log('  - File not saved or Vite didn\'t hot-reload');
          console.log('  - CSS conflict or override');
          console.log('  - Wrong element being inspected');
        }
      }

      await page.screenshot({
        path: 'e2e/screenshots/riepilogo-final.png',
        fullPage: false
      });
    } else {
      console.log('\n⚠ Riepilogo Scelte not visible - no items were selected');
    }

    console.log('\n✓ Inspection complete! Check e2e/screenshots/ for visual confirmation.');

  } catch (error) {
    console.error('\nError during inspection:', error.message);
    await page.screenshot({ path: 'e2e/screenshots/riepilogo-error.png', fullPage: true });
  } finally {
    await page.close();
    await browser.close();
  }
}

inspectRiepilogo();
