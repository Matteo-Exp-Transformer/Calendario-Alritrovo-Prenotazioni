import { test, expect } from '@playwright/test';

/**
 * Test typography hierarchy - Opzione A
 *
 * Verifica la gerarchia tipografica del form di prenotazione:
 * 1. Titoli sezioni: text-2xl md:text-3xl (24px+)
 * 2. Label campi: text-base md:text-lg (16px+) + font-bold
 * 3. Testo input: 16px + font-bold
 */
test.describe('Typography Hierarchy - Opzione A', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prenota');
    // Aspetta che il form sia caricato
    await page.waitForSelector('form');
  });

  test('section titles should be text-2xl or larger (>=24px)', async ({ page }) => {
    const sectionTitle = page.locator('h2', { hasText: 'Dati Personali' }).first();
    await expect(sectionTitle).toBeVisible();

    const fontSize = await sectionTitle.evaluate(el =>
      window.getComputedStyle(el).fontSize
    );

    // text-2xl = 24px, deve essere >= 24px
    expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(24);
  });

  test('field labels should have text-base md:text-lg class (not text-sm)', async ({ page }) => {
    // Check actual <label> elements (e.g., "Tipo di prenotazione")
    const label = page.locator('label', { hasText: 'Tipo di prenotazione' }).first();
    await expect(label).toBeVisible();

    // Check the className contains the correct Tailwind classes
    const className = await label.getAttribute('class');
    console.log('Label className:', className);

    // This should FAIL initially because labels currently have "text-sm"
    expect(className, 'Label should have text-base md:text-lg, not text-sm').not.toContain('text-sm');
    expect(className, 'Label should have text-base').toContain('text-base');

    // Also check computed styles
    const fontWeight = await label.evaluate(el =>
      window.getComputedStyle(el).fontWeight
    );
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(600);
  });

  test('multiple field labels should have consistent typography', async ({ page }) => {
    const labelTexts = ['Tipo di prenotazione', 'Intolleranza / Esigenza', 'Altre Richieste'];

    for (const labelText of labelTexts) {
      const labels = page.locator('label', { hasText: labelText });
      const count = await labels.count();

      // Salta se la label non esiste (potrebbe non essere visibile)
      if (count === 0) continue;

      const label = labels.first();
      const fontSize = await label.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      const fontWeight = await label.evaluate(el =>
        window.getComputedStyle(el).fontWeight
      );

      expect(parseFloat(fontSize), `Label "${labelText}" font size`).toBeGreaterThanOrEqual(16);
      expect(parseInt(fontWeight), `Label "${labelText}" font weight`).toBeGreaterThanOrEqual(600);
    }
  });

  test('input text should be 16px and bold', async ({ page }) => {
    const input = page.locator('input[placeholder*="Nome"]').first();
    await expect(input).toBeVisible();

    const fontSize = await input.evaluate(el =>
      window.getComputedStyle(el).fontSize
    );
    const fontWeight = await input.evaluate(el =>
      window.getComputedStyle(el).fontWeight
    );

    // 16px
    expect(parseFloat(fontSize)).toBe(16);
    // bold
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(600);
  });

  test('visual hierarchy should be clear (title > label >= input)', async ({ page }) => {
    const sectionTitle = page.locator('h2', { hasText: 'Dati Personali' }).first();
    const label = page.locator('label', { hasText: 'Tipo di prenotazione' }).first();
    const input = page.locator('input[placeholder*="Nome"]').first();

    const titleFontSize = parseFloat(await sectionTitle.evaluate(el =>
      window.getComputedStyle(el).fontSize
    ));
    const labelFontSize = parseFloat(await label.evaluate(el =>
      window.getComputedStyle(el).fontSize
    ));
    const inputFontSize = parseFloat(await input.evaluate(el =>
      window.getComputedStyle(el).fontSize
    ));

    // Titolo deve essere maggiore della label
    expect(titleFontSize).toBeGreaterThan(labelFontSize);

    // Label deve essere >= input (16px)
    expect(labelFontSize).toBeGreaterThanOrEqual(inputFontSize);

    // Input dovrebbe essere 16px
    expect(inputFontSize).toBe(16);
  });

  test('take screenshot for visual verification', async ({ page }) => {
    await page.screenshot({
      path: 'e2e/screenshots/typography-hierarchy-AFTER.png',
      fullPage: true
    });
  });
});