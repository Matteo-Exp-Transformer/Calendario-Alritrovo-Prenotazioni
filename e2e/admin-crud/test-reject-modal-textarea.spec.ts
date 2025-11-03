import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

/**
 * TEST SPECIFICO: Verifica che il modal di rifiuto mostri la textarea per il motivo
 */

test.describe('Test Modal Rifiuto - Verifica Textarea', () => {
  test('modal deve mostrare textarea per motivo rifiuto', async ({ page }) => {
    console.log('🧪 TEST: Verifica textarea nel modal rifiuto');

    // Login come admin
    const loginSuccess = await loginAsAdmin(page);
    if (!loginSuccess) {
      test.skip();
      return;
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Naviga a Prenotazioni Pendenti
    const pendentiTab = page.locator('button').filter({ hasText: /Prenotazioni Pendenti|Pendenti/i }).first();
    await pendentiTab.click();
    await page.waitForTimeout(2000);

    // Trova prima prenotazione
    const bookingCards = page.locator('[class*="rounded-2xl"], [class*="border"]');
    const cardCount = await bookingCards.count();
    
    if (cardCount === 0) {
      console.log('⚠️ Nessuna prenotazione trovata');
      test.skip();
      return;
    }

    const firstCard = bookingCards.first();
    
    // Espandi se necessario
    const headerButton = firstCard.locator('button').first();
    const chevronDown = firstCard.locator('[data-icon="chevron-down"], svg').first();
    
    if (await chevronDown.count() > 0) {
      await headerButton.click();
      await page.waitForTimeout(1000);
    }

    // Clicca su Rifiuta
    const rejectButton = page.locator('button').filter({ hasText: /Rifiuta/i }).first();
    
    if (await rejectButton.count() === 0) {
      throw new Error('Bottone Rifiuta non trovato');
    }

    // Ascolta console logs PRIMA del click
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      if (text.includes('RejectModal') || text.includes('PendingRequestsTab') || text.includes('handleReject')) {
        console.log(`📋 Console: ${text}`);
      }
    });

    // Usa JavaScript click
    await rejectButton.evaluate((btn: HTMLElement) => btn.click());
    console.log('✅ Bottone Rifiuta cliccato');
    
    // Attendi che il modal appaia (con timeout più lungo)
    try {
      await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5000 });
      console.log('✅ Modal apparso');
    } catch (e) {
      // Se non appare, prova altri selettori
      console.log('⚠️ Modal non trovato con [role="dialog"], provo altri selettori...');
      
      // Verifica se c'è un modal con il testo "Rifiuta"
      const modalByText = page.locator('text=/Rifiuta Prenotazione/i');
      const count = await modalByText.count();
      console.log(`🔍 Modal per testo trovato: ${count}`);
      
      if (count === 0) {
        await page.screenshot({ path: 'e2e/screenshots/test-modal-not-visible.png', fullPage: true });
        
        // Mostra gli ultimi messaggi console
        console.log('📋 Ultimi messaggi console:');
        consoleMessages.slice(-10).forEach(msg => console.log(`  - ${msg}`));
        
        throw new Error('Modal non è visibile dopo click su Rifiuta');
      }
    }

    // Verifica che il modal sia visibile
    const modal = page.locator('[role="dialog"]').first();
    const isModalVisible = await modal.isVisible();
    
    console.log(`🔍 Modal visibile: ${isModalVisible}`);
    
    if (!isModalVisible) {
      // Prova anche altri selettori
      const altModal = page.locator('.modal, [class*="Modal"], [class*="modal"]').first();
      const altModalVisible = await altModal.isVisible();
      console.log(`🔍 Alt modal visibile: ${altModalVisible}`);
      
      if (!altModalVisible) {
        await page.screenshot({ path: 'e2e/screenshots/test-modal-not-visible.png', fullPage: true });
        throw new Error('Modal non è visibile dopo click su Rifiuta');
      }
      
      // Usa l'alt modal trovato
      const modal = altModal;
    }

    // Verifica che il modal contenga il titolo
    const modalTitle = modal.locator('text=/Rifiuta Prenotazione/i');
    await expect(modalTitle).toBeVisible({ timeout: 5000 });
    console.log('✅ Titolo modal visibile');

    // Cerca la textarea per ID
    const textarea = modal.locator('#rejection-reason-textarea');
    const textareaCount = await textarea.count();
    
    console.log(`🔍 Textarea trovata: ${textareaCount}`);
    
    if (textareaCount === 0) {
      // Screenshot per debug
      await page.screenshot({ path: 'e2e/screenshots/test-textarea-not-found.png', fullPage: true });
      
      // Verifica anche con altri selettori
      const textareaByTag = modal.locator('textarea');
      const textareaByTagCount = await textareaByTag.count();
      console.log(`🔍 Textarea per tag: ${textareaByTagCount}`);
      
      // Verifica il contenuto del modal
      const modalContent = await modal.textContent();
      console.log(`🔍 Contenuto modal: ${modalContent?.substring(0, 200)}`);
      
      throw new Error('Textarea non trovata nel modal');
    }

    // Verifica che la textarea sia visibile
    const isTextareaVisible = await textarea.isVisible();
    console.log(`🔍 Textarea visibile: ${isTextareaVisible}`);
    
    expect(isTextareaVisible).toBe(true);

    // Verifica che abbia il placeholder
    const placeholder = await textarea.getAttribute('placeholder');
    console.log(`🔍 Placeholder: ${placeholder}`);
    expect(placeholder).toContain('Esempio');

    // Verifica che abbia il label associato
    const label = modal.locator('label[for="rejection-reason-textarea"]');
    const labelCount = await label.count();
    console.log(`🔍 Label trovata: ${labelCount}`);
    
    if (labelCount > 0) {
      const labelText = await label.textContent();
      console.log(`🔍 Testo label: ${labelText}`);
      expect(labelText).toContain('Motivo rifiuto');
    }

    // Prova a scrivere nella textarea
    await textarea.fill('Test motivo rifiuto automatico');
    const textareaValue = await textarea.inputValue();
    console.log(`🔍 Valore textarea: ${textareaValue}`);
    expect(textareaValue).toBe('Test motivo rifiuto automatico');

    // Screenshot finale
    await page.screenshot({ path: 'e2e/screenshots/test-textarea-visible.png', fullPage: true });

    console.log('✅ TEST PASSED: Textarea è visibile e funzionante');
  });
});

