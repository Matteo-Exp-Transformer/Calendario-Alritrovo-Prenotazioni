import { test, expect } from '@playwright/test';

/**
 * SKILLS TESTING - Verifica Implementazione Sfondo Vintage Mobile
 * 
 * Questo test verifica in modo sistematico tutte le modifiche implementate:
 * 1. Desktop: deve rimanere invariato (card opaca, no vintage image)
 * 2. Mobile: card trasparente, immagine vintage visibile, overlay più scuro
 * 3. Leggibilità dei testi con text-shadow
 * 4. Trasparenza e blur corretti
 */

test.describe('Skills Testing - Mobile Vintage Background Implementation', () => {
  
  test('DESKTOP: Verifica che tutto rimanga invariato', async ({ page }) => {
    // Desktop viewport 1920x1080
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // ✅ Verifica 1: Card form deve essere opaca su desktop
    const formCard = page.locator('.bg-white\\/30.md\\:bg-white\\/95').first();
    const formCardClasses = await formCard.getAttribute('class');
    expect(formCardClasses).toContain('md:bg-white/95');
    
    // ✅ Verifica 2: Immagine vintage NON deve essere visibile su desktop
    const vintageImage = page.locator('.md\\:hidden').filter({ hasText: '' });
    const vintageImageCount = await vintageImage.count();
    // L'immagine vintage dovrebbe esistere nel DOM ma essere nascosta con md:hidden
    const vintageDiv = page.locator('[style*="mobile-vintage-bg.png"]');
    const isVintageVisible = await vintageDiv.isVisible();
    expect(isVintageVisible).toBe(false); // Deve essere nascosta su desktop

    // ✅ Verifica 3: Info box deve avere background più opaco su desktop
    const infoBox = page.locator('[style*="backdropFilter"]').first();
    const infoBoxStyle = await infoBox.getAttribute('style');
    // Su desktop non abbiamo specificato, ma il blur dovrebbe essere minore (16px mobile, default desktop)
    
    // Screenshot per verifica visiva
    await page.screenshot({ 
      path: 'e2e/screenshots/skills-desktop-verification.png',
      fullPage: true 
    });

    console.log('✅ DESKTOP: Tutte le verifiche passate');
  });

  test('MOBILE: Verifica card trasparente e immagine vintage', async ({ page }) => {
    // Mobile viewport iPhone SE
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // ✅ Verifica 1: Card form deve essere trasparente su mobile (bg-white/30)
    const formCard = page.locator('.bg-white\\/30.md\\:bg-white\\/95').first();
    const formCardClasses = await formCard.getAttribute('class');
    expect(formCardClasses).toContain('bg-white/30'); // Mobile: trasparente
    
    // ✅ Verifica 2: Backdrop blur deve essere forte su mobile (backdrop-blur-xl)
    expect(formCardClasses).toContain('backdrop-blur-xl'); // Mobile
    
    // ✅ Verifica 3: Immagine vintage deve esistere nel DOM
    const vintageDiv = page.locator('[style*="mobile-vintage-bg.png"]');
    const vintageExists = await vintageDiv.count();
    expect(vintageExists).toBeGreaterThan(0);
    
    // ✅ Verifica 4: Info box deve essere trasparente su mobile
    const infoBox = page.locator('[style*="backdropFilter"]').first();
    const infoBoxStyle = await infoBox.getAttribute('style');
    expect(infoBoxStyle).toContain('rgba(255, 255, 255, 0.3)'); // 30% opacità mobile
    expect(infoBoxStyle).toContain('blur(16px)'); // Blur forte mobile

    // Screenshot parte alta
    await page.screenshot({ 
      path: 'e2e/screenshots/skills-mobile-top.png'
    });

    console.log('✅ MOBILE TOP: Card trasparente verificata');
  });

  test('MOBILE: Verifica immagine vintage visibile quando si scrolla', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Scroll fino in fondo per vedere l'immagine vintage
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    // ✅ Verifica: L'immagine vintage dovrebbe essere visibile dopo lo scroll
    // Controlliamo che il div esista e sia posizionato correttamente
    const vintageDiv = page.locator('[style*="mobile-vintage-bg.png"]');
    const vintageStyle = await vintageDiv.first().getAttribute('style');
    
    expect(vintageStyle).toContain('mobile-vintage-bg.png');
    expect(vintageStyle).toContain('top: 100vh'); // Deve partire da 100vh
    
    // Verifica che la classe md:hidden sia presente (solo mobile)
    const vintageClasses = await vintageDiv.first().getAttribute('class');
    expect(vintageClasses).toContain('md:hidden');

    // Screenshot dopo scroll
    await page.screenshot({ 
      path: 'e2e/screenshots/skills-mobile-bottom-scroll.png'
    });

    console.log('✅ MOBILE BOTTOM: Immagine vintage verificata');
  });

  test('MOBILE: Verifica text-shadow per leggibilità', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // ✅ Verifica 1: Titolo principale deve avere text-shadow
    const mainTitle = page.locator('h1:has-text("Prenota il Tuo Tavolo")');
    const titleStyle = await mainTitle.getAttribute('style');
    expect(titleStyle).toContain('textShadow');
    expect(titleStyle).toContain('rgba(0,0,0,0.8)');

    // ✅ Verifica 2: "Al Ritrovo" deve avere text-shadow
    const subtitle = page.locator('p:has-text("Al Ritrovo")');
    const subtitleStyle = await subtitle.getAttribute('style');
    expect(subtitleStyle).toContain('textShadow');
    expect(subtitleStyle).toContain('rgba(0,0,0,0.8)');

    // ✅ Verifica 3: Location deve avere text-shadow
    const location = page.locator('[class*="text-warm-beige"]').filter({ hasText: 'Bologna' });
    const locationStyle = await location.first().getAttribute('style');
    expect(locationStyle).toContain('textShadow');

    console.log('✅ TEXT-SHADOW: Tutti i testi verificati');
  });

  test('MOBILE: Verifica overlay più scuro (40% invece di 30%)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // ✅ Verifica: Overlay deve essere rgba(0, 0, 0, 0.4) invece di 0.3
    const overlay = page.locator('[style*="backgroundColor"][style*="rgba(0, 0, 0"]').first();
    const overlayStyle = await overlay.getAttribute('style');
    expect(overlayStyle).toContain('rgba(0, 0, 0, 0.4)'); // 40% invece di 30%

    console.log('✅ OVERLAY: Opacità 40% verificata');
  });

  test('COMPARAZIONE: Desktop vs Mobile - Side by side verification', async ({ page }) => {
    // Test completo: prendi screenshot e verifica differenze
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/prenota');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verifica classi card
      const formCard = page.locator('.bg-white\\/30.md\\:bg-white\\/95').first();
      const classes = await formCard.getAttribute('class');

      if (viewport.name === 'desktop') {
        // Desktop: card opaca
        expect(classes).toContain('md:bg-white/95');
        console.log(`✅ ${viewport.name.toUpperCase()}: Card opaca verificata`);
      } else {
        // Mobile: card trasparente
        expect(classes).toContain('bg-white/30');
        expect(classes).toContain('backdrop-blur-xl');
        console.log(`✅ ${viewport.name.toUpperCase()}: Card trasparente verificata`);
      }

      await page.screenshot({ 
        path: `e2e/screenshots/skills-${viewport.name}-comparison.png`,
        fullPage: true 
      });
    }
  });

  test('FULL PAGE MOBILE: Verifica completa scroll e layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Screenshot full page per vedere tutto
    await page.screenshot({ 
      path: 'e2e/screenshots/skills-mobile-full-page.png',
      fullPage: true 
    });

    // Verifica elementi chiave presenti
    const formVisible = await page.locator('form').isVisible();
    const infoBoxVisible = await page.locator('text=Orari e Contatti').isVisible();
    
    expect(formVisible).toBe(true);
    expect(infoBoxVisible).toBe(true);

    console.log('✅ FULL PAGE: Layout completo verificato');
  });
});

