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
    await page.waitForTimeout(1500);
    
    console.log('2. Selecting Rinfresco di Laurea...');
    await page.selectOption('#booking_type', 'rinfresco_laurea');
    await page.waitForTimeout(2000); // Wait longer for form to update
    
    console.log('3. Taking screenshot after selection...');
    await page.screenshot({ path: 'e2e/screenshots/menu-after-selection.png', fullPage: true });
    
    console.log('4. Scrolling down to find menu section...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);
    
    console.log('5. Looking for Menu section...');
    const menuHeader = page.locator('h3:has-text("Menu")');
    const menuHeaderExists = await menuHeader.count() > 0;
    console.log(`   Menu header exists: ${menuHeaderExists}`);
    
    if (menuHeaderExists) {
      await menuHeader.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    
    console.log('6. Looking for "Aggiungi" buttons...');
    const aggiungiButtons = page.locator('button:has-text("Aggiungi")');
    const buttonCount = await aggiungiButtons.count();
    console.log(`   Found ${buttonCount} "Aggiungi" buttons`);
    
    if (buttonCount >= 2) {
      console.log('7. Clicking first two menu items...');
      await aggiungiButtons.nth(0).scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await aggiungiButtons.nth(0).click();
      console.log('   Clicked item 1');
      await page.waitForTimeout(1000);
      
      await aggiungiButtons.nth(1).scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await aggiungiButtons.nth(1).click();
      console.log('   Clicked item 2');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'e2e/screenshots/menu-items-selected.png', fullPage: true });
    }
    
    console.log('8. Checking for Riepilogo Scelte...');
    const riepilogoHeader = page.locator('h3:has-text("Riepilogo Scelte")');
    const riepilogoVisible = await riepilogoHeader.isVisible();
    console.log(`   Riepilogo Scelte visible: ${riepilogoVisible}`);
    
    if (riepilogoVisible) {
      console.log('9. Scrolling to Riepilogo Scelte...');
      await riepilogoHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      console.log('10. Inspecting container CSS...');
      const cssInfo = await page.evaluate(() => {
        const h3 = Array.from(document.querySelectorAll('h3')).find(el => 
          el.textContent?.includes('Riepilogo Scelte')
        );
        
        if (!h3) return { error: 'H3 not found' };
        
        // The div with items should be next sibling of header's parent
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
          outerHTML: container.outerHTML.substring(0, 500)
        };
      });
      
      console.log('\n=== RIEPILOGO SCELTE CSS INSPECTION ===');
      console.log(JSON.stringify(cssInfo, null, 2));
      
      if (cssInfo.success) {
        const hasPy12 = cssInfo.allClasses?.includes('py-12');
        const hasPy6 = cssInfo.allClasses?.includes('py-6');
        
        console.log('\n=== ANALYSIS ===');
        console.log(`Has py-12 class: ${hasPy12}`);
        console.log(`Has py-6 class: ${hasPy6}`);
        console.log(`Computed padding-top: ${cssInfo.paddingTop} (${cssInfo.paddingTopPx}px)`);
        console.log(`Computed padding-bottom: ${cssInfo.paddingBottom} (${cssInfo.paddingBottomPx}px)`);
        console.log(`\nExpected values:`);
        console.log(`  py-12 = 48px (3rem)`);
        console.log(`  py-6 = 24px (1.5rem)`);
        console.log(`\nActual result: ${cssInfo.paddingTopPx === 48 ? 'py-12 IS APPLIED ✓' : 'py-12 NOT APPLIED ✗'}`);
      }
      
      await page.screenshot({ 
        path: 'e2e/screenshots/menu-riepilogo-final.png', 
        fullPage: true 
      });
    } else {
      console.log('\n⚠ Riepilogo Scelte not visible - cannot inspect CSS');
    }
    
    console.log('\n✓ Inspection complete!');
    
  } catch (error) {
    console.error('Error during inspection:', error);
    await page.screenshot({ path: 'e2e/screenshots/menu-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

inspectMenuCss();
