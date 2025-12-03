import { chromium } from '@playwright/test';

async function inspectMenuCss() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log('1. Navigating to booking form...');
    await page.goto('http://localhost:5175/prenota');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('2. Taking initial screenshot...');
    await page.screenshot({ path: 'e2e/screenshots/menu-01-initial.png', fullPage: true });
    
    console.log('3. Selecting Rinfresco di Laurea...');
    await page.selectOption('#booking_type', 'rinfresco_laurea');
    await page.waitForTimeout(1500);
    console.log('   Selected Rinfresco di Laurea');
    
    console.log('4. Looking for menu items with "Aggiungi" buttons...');
    const aggiungiButtons = page.locator('button:has-text("Aggiungi")');
    const buttonCount = await aggiungiButtons.count();
    console.log(`   Found ${buttonCount} "Aggiungi" buttons`);
    
    if (buttonCount >= 2) {
      console.log('5. Clicking first two menu items...');
      await aggiungiButtons.nth(0).scrollIntoViewIfNeeded();
      await aggiungiButtons.nth(0).click();
      await page.waitForTimeout(800);
      
      await aggiungiButtons.nth(1).scrollIntoViewIfNeeded();
      await aggiungiButtons.nth(1).click();
      await page.waitForTimeout(800);
      
      console.log('   Clicked 2 menu items');
      await page.screenshot({ path: 'e2e/screenshots/menu-02-items-selected.png', fullPage: true });
    }
    
    console.log('6. Checking for Riepilogo Scelte...');
    const riepilogoVisible = await page.locator('h3:has-text("Riepilogo Scelte")').isVisible();
    console.log(`   Riepilogo Scelte visible: ${riepilogoVisible}`);
    
    if (riepilogoVisible) {
      console.log('7. Inspecting Riepilogo Scelte container CSS...');
      
      const cssInfo = await page.evaluate(() => {
        const h3 = Array.from(document.querySelectorAll('h3')).find(el => 
          el.textContent?.includes('Riepilogo Scelte')
        );
        
        if (!h3) return { error: 'H3 not found' };
        
        // The container div should be the next sibling of the header's parent
        const headerParent = h3.parentElement;
        const container = headerParent?.nextElementSibling;
        
        if (!container) {
          return { 
            error: 'Container not found',
            headerParentHTML: headerParent?.outerHTML.substring(0, 300)
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
          allClasses: container.className.split(' '),
          outerHTML: container.outerHTML.substring(0, 400)
        };
      });
      
      console.log('\n=== RIEPILOGO SCELTE CSS INSPECTION ===');
      console.log(JSON.stringify(cssInfo, null, 2));
      
      // Scroll to it and take a close-up screenshot
      await page.locator('h3:has-text("Riepilogo Scelte")').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'e2e/screenshots/menu-03-riepilogo-closeup.png', fullPage: false });
      
      // Check if py-12 is actually in the className
      if (cssInfo.success) {
        const hasPy12 = cssInfo.allClasses?.includes('py-12');
        const hasPy6 = cssInfo.allClasses?.includes('py-6');
        console.log(`\nClass check:`);
        console.log(`  - Has py-12: ${hasPy12}`);
        console.log(`  - Has py-6: ${hasPy6}`);
        console.log(`  - Computed padding-top: ${cssInfo.paddingTop} (${cssInfo.paddingTopPx}px)`);
        console.log(`  - Computed padding-bottom: ${cssInfo.paddingBottom} (${cssInfo.paddingBottomPx}px)`);
        console.log(`  - Expected for py-12: 48px (3rem)`);
        console.log(`  - Expected for py-6: 24px (1.5rem)`);
      }
    }
    
    console.log('\n✓ Inspection complete!');
    console.log('Screenshots saved to e2e/screenshots/menu-*.png');
    
  } catch (error) {
    console.error('Error during inspection:', error);
    await page.screenshot({ path: 'e2e/screenshots/menu-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

inspectMenuCss();
