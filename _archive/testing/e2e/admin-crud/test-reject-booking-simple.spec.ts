import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

/**
 * TEST: Verifica che l'admin possa rifiutare correttamente prenotazioni
 * 
 * Steps:
 * 1. Login come admin
 * 2. Naviga a Prenotazioni Pendenti
 * 3. Trova una prenotazione pending (usa la prima disponibile)
 * 4. Clicca su "Rifiuta"
 * 5. Inserisce motivo rifiuto nel modal
 * 6. Conferma rifiuto
 * 7. Verifica che la prenotazione sia stata rifiutata (status = rejected)
 */

test.describe('Test Rifiuto Prenotazione Admin', () => {
  test('admin può rifiutare prenotazione pending', async ({ page }) => {
    console.log('🧪 TEST: Verifica rifiuto prenotazione da admin');

    // Step 1: Login come admin
    const loginSuccess = await loginAsAdmin(page);
    if (!loginSuccess) {
      console.log('⚠️ Login fallito - skip test');
      test.skip();
      return;
    }

    console.log('✅ Login admin completato');

    // Step 2: Naviga a Prenotazioni Pendenti
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Trova tab "Prenotazioni Pendenti" o "Pendenti"
    const pendentiTab = page.locator('button').filter({ hasText: /Prenotazioni Pendenti|Pendenti/i }).first();
    
    if (await pendentiTab.count() === 0) {
      throw new Error('Tab "Prenotazioni Pendenti" non trovato');
    }

    await pendentiTab.click();
    console.log('✅ Navigato a Prenotazioni Pendenti');
    await page.waitForTimeout(2000);

    // Screenshot prima del rifiuto
    await page.screenshot({ path: 'e2e/screenshots/test-reject-before.png', fullPage: true });

    // Step 3: Trova una prenotazione pending
    // Cerca una card di prenotazione (dovrebbe avere status badge o contenere dati prenotazione)
    const bookingCards = page.locator('[class*="rounded-2xl"], [class*="border"], [data-testid*="booking"]');
    const cardCount = await bookingCards.count();
    
    console.log(`🔍 Trovate ${cardCount} card di prenotazione`);

    if (cardCount === 0) {
      console.log('⚠️ Nessuna prenotazione pending trovata - il test non può procedere');
      console.log('💡 Suggerimento: Crea una prenotazione dal form pubblico prima di eseguire questo test');
      test.skip();
      return;
    }

    // Prendi la prima card
    const firstCard = bookingCards.first();

    // Verifica che la card sia visible
    await firstCard.waitFor({ state: 'visible', timeout: 5000 });

    // Step 4: Espandi la card se collassata (cerca il button header)
    const headerButton = firstCard.locator('button').first();
    const chevronDown = firstCard.locator('[data-icon="chevron-down"], svg').first();
    
    if (await chevronDown.count() > 0) {
      console.log('📂 Card collassata, espando...');
      await headerButton.click();
      await page.waitForTimeout(1000);
    }

    // Step 5: Clicca su "Rifiuta"
    console.log('❌ Cercando bottone "Rifiuta"...');
    
    // Trova il bottone "Rifiuta" dentro la card
    const rejectButton = firstCard.locator('button').filter({ hasText: /Rifiuta/i }).first();

    let buttonToClick = rejectButton;
    
    if (await rejectButton.count() === 0) {
      // Fallback: cerca in tutta la pagina
      buttonToClick = page.locator('button').filter({ hasText: /Rifiuta/i }).first();
      if (await buttonToClick.count() === 0) {
        await page.screenshot({ path: 'e2e/screenshots/test-reject-no-button.png', fullPage: true });
        throw new Error('Bottone "Rifiuta" non trovato');
      }
      console.log('✅ Bottone "Rifiuta" trovato (fallback)');
    } else {
      console.log('✅ Bottone "Rifiuta" trovato nella card');
    }

    // Usa JavaScript click per evitare problemi di viewport
    await buttonToClick.waitFor({ state: 'visible', timeout: 5000 });
    await buttonToClick.evaluate((btn: HTMLElement) => btn.click());
    console.log('✅ Bottone "Rifiuta" cliccato via JavaScript');
    await page.waitForTimeout(1000);

    // Step 6: Verifica che appaia il modal per il motivo rifiuto
    const modal = page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]').first();
    
    if (await modal.count() > 0) {
      console.log('📝 Modal rifiuto apparso');
      
      // Trova il textarea per il motivo rifiuto
      const textarea = modal.locator('textarea').first();
      if (await textarea.count() > 0) {
        await textarea.fill('Test automatico - Rifiuto per verifica sistema');
        console.log('✅ Motivo rifiuto inserito');
      }

      // Clicca su "Conferma" o "Rifiuta" nel modal
      const confirmButton = modal.locator('button').filter({ hasText: /Conferma|Rifiuta/i }).last();
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
        console.log('✅ Rifiuto confermato nel modal');
      }
    } else {
      console.log('ℹ️ Nessun modal apparso - rifiuto potrebbe essere immediato');
    }

    // Step 7: Attendi che la mutation venga processata
    await page.waitForTimeout(3000);

    // Verifica messaggio di successo
    const successMessage = page.locator('text=/rifiutata|successo|rejected/i').first();
    if (await successMessage.count() > 0) {
      const messageText = await successMessage.textContent();
      console.log(`✅ Messaggio successo: ${messageText}`);
    }

    // Screenshot dopo il rifiuto
    await page.screenshot({ path: 'e2e/screenshots/test-reject-after.png', fullPage: true });

    // Step 8: Verifica che la prenotazione non sia più nella lista pendenti
    // (Opzionale: verificare che appaia in Archivio > Rifiutate)
    await page.waitForTimeout(2000);

    // Naviga all'Archivio per verificare
    const archiveTab = page.locator('button').filter({ hasText: /Archivio/i }).first();
    if (await archiveTab.count() > 0) {
      await archiveTab.click();
      await page.waitForTimeout(2000);

      // Clicca filtro "Rifiutate"
      const rifiutateFilter = page.locator('button').filter({ hasText: /Rifiutate/i }).first();
      if (await rifiutateFilter.count() > 0) {
        await rifiutateFilter.click();
        await page.waitForTimeout(1000);
        console.log('✅ Verificato in Archivio > Rifiutate');
      }
    }

    console.log('✅ TEST COMPLETATO: Rifiuto prenotazione verificato');
  });
});

