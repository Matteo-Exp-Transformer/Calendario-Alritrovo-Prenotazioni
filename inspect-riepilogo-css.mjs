import { chromium } from '@playwright/test';

async function inspectRiepilogoCss() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('1. Navigating to booking form...');
    await page.goto('http://localhost:5175/prenota');
    await page.waitForLoadState('networkidle');
    
    console.log('2. Selecting Rinfresco di Laurea...');
    // Use selectOption instead of click for dropdown
    await page.selectOption('select[name="tipoEvento"]', 'rinfresco_laurea');
    await page.waitForTimeout(1000);
    
    console.log('3. Scrolling to menu section...');
    const menuSection = page.locator('h3:has-text("Menu e Bevande")');
    await menuSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    console.log('4. Selecting menu items to trigger Riepilogo Scelte...');
    // Find and click first two menu items
    const menuItems = page.locator('button:has-text("Aggiungi")');
    const count = await menuItems.count();
    console.log(`   Found ${count} menu items`);
    
    if (count >= 2) {
      await menuItems.nth(0).click();
      await page.waitForTimeout(500);
      await menuItems.nth(1).click();
      await page.waitForTimeout(1000);
    }
    
    console.log('5. Checking if Riepilogo Scelte is visible...');
    const riepilogoHeader = page.locator('h3:has-text("Riepilogo Scelte")');
    const isVisible = await riepilogoHeader.isVisible();
    console.log(`   Riepilogo Scelte visible: ${isVisible}`);
    
    if (!isVisible) {
      console.log('   ERROR: Riepilogo Scelte not visible. Cannot inspect.');
      await page.screenshot({ path: 'e2e/screenshots/riepilogo-not-visible.png', fullPage: true });
      return;
    }
    
    console.log('6. Inspecting CSS of Riepilogo Scelte container...');
    const containerInfo = await page.evaluate(() => {
      // Find the "Riepilogo Scelte" header
      const header = Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Riepilogo Scelte'));
      if (!header) return { error: 'Header not found' };
      
      // The container should be the sibling div after the header
      let container = header.nextElementSibling;
      
      // If not found, try parent's next sibling
      if (!container) {
        container = header.parentElement?.nextElementSibling;
      }
      
      if (!container) return { error: 'Container not found', headerHTML: header.outerHTML };
      
      const computed = window.getComputedStyle(container);
      
      return {
        tagName: container.tagName,
        className: container.className,
        paddingTop: computed.paddingTop,
        paddingBottom: computed.paddingBottom,
        paddingLeft: computed.paddingLeft,
        paddingRight: computed.paddingRight,
        margin: computed.margin,
        inlineStyle: container.getAttribute('style'),
        actualHTML: container.outerHTML.substring(0, 500),
        allAppliedClasses: container.className.split(' ').filter(c => c),
        parentClassName: container.parentElement?.className
      };
    });
    
    console.log('\n=== CSS INSPECTION RESULTS ===');
    console.log(JSON.stringify(containerInfo, null, 2));
    
    console.log('\n7. Taking screenshot for visual verification...');
    await riepilogoHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'e2e/screenshots/riepilogo-css-inspection.png', 
      fullPage: true 
    });
    
    console.log('\n8. Checking the actual BookingForm.tsx file content...');
    const fs = await import('fs/promises');
    const fileContent = await fs.readFile('src/features/booking/components/BookingForm.tsx', 'utf-8');
    
    // Find the Riepilogo Scelte section
    const riepilogoMatch = fileContent.match(/Riepilogo Scelte[\s\S]{0,800}/);
    if (riepilogoMatch) {
      console.log('\nRelevant code from BookingForm.tsx:');
      console.log(riepilogoMatch[0]);
    }
    
    console.log('\n✓ Inspection complete!');
    console.log('Screenshot saved to: e2e/screenshots/riepilogo-css-inspection.png');
    
  } catch (error) {
    console.error('Error during inspection:', error);
    await page.screenshot({ path: 'e2e/screenshots/riepilogo-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

inspectRiepilogoCss();
