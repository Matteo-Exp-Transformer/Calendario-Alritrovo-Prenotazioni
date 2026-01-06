import { test, expect } from '@playwright/test'

/**
 * Test E2E per verificare il fix del problema autocomplete sul campo num_guests
 *
 * PROBLEMA: Il browser autocompleta il campo numero ospiti con "1"
 * e l'utente non può cancellarlo per inserire un nuovo valore
 *
 * FIX: Aggiunto autoComplete="off" a tutti gli input num_guests
 *
 * COMPONENTI TESTATI:
 * - BookingRequestForm.tsx (form pubblico prenotazioni)
 * - AdminBookingForm.tsx (form admin nuove prenotazioni)
 * - AcceptBookingModal.tsx (modal accettazione richieste)
 * - DetailsTab.tsx (modifica prenotazioni esistenti)
 */

test.describe('Num Guests Autocomplete Fix', () => {

  test('BookingRequestForm - campo num_guests deve essere vuoto inizialmente e cancellabile', async ({ page }) => {
    // Vai alla pagina di prenotazione pubblica
    await page.goto('http://localhost:5174/prenota')

    // Attendi che il form sia caricato
    await page.waitForSelector('#num_guests', { state: 'visible' })

    // VERIFICA 1: Il campo deve avere autocomplete="off"
    const autocompleteAttr = await page.locator('#num_guests').getAttribute('autocomplete')
    expect(autocompleteAttr).toBe('off')

    // VERIFICA 2: Il campo deve essere vuoto inizialmente (non "1")
    const initialValue = await page.locator('#num_guests').inputValue()
    expect(initialValue).toBe('')

    // VERIFICA 3: L'utente deve poter inserire un numero
    await page.locator('#num_guests').fill('25')
    const valueAfterFill = await page.locator('#num_guests').inputValue()
    expect(valueAfterFill).toBe('25')

    // VERIFICA 4: L'utente deve poter cancellare completamente il valore
    await page.locator('#num_guests').clear()
    const valueAfterClear = await page.locator('#num_guests').inputValue()
    expect(valueAfterClear).toBe('')

    // VERIFICA 5: L'utente deve poter cancellare carattere per carattere
    await page.locator('#num_guests').fill('123')
    await page.locator('#num_guests').press('Backspace')
    await page.locator('#num_guests').press('Backspace')
    await page.locator('#num_guests').press('Backspace')
    const valueAfterBackspace = await page.locator('#num_guests').inputValue()
    expect(valueAfterBackspace).toBe('')

    console.log('✅ BookingRequestForm - num_guests autocomplete fix verificato')
  })

  test('AdminBookingForm - campo num_guests deve avere autocomplete="off"', async ({ page }) => {
    // Login come admin
    await page.goto('http://localhost:5174/login')
    await page.fill('input[type="email"]', 'admin@alritrovo.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Attendi redirect alla dashboard
    await page.waitForURL('**/admin', { timeout: 10000 })

    // Vai al tab "Nuova Prenotazione"
    await page.click('text=Nuova Prenotazione')

    // Attendi che il form sia visibile
    await page.waitForSelector('#num_guests', { state: 'visible', timeout: 5000 })

    // VERIFICA 1: Il campo deve avere autocomplete="off"
    const autocompleteAttr = await page.locator('#num_guests').getAttribute('autocomplete')
    expect(autocompleteAttr).toBe('off')

    // VERIFICA 2: Il campo deve essere vuoto inizialmente
    const initialValue = await page.locator('#num_guests').inputValue()
    expect(initialValue).toBe('')

    // VERIFICA 3: Deve essere cancellabile
    await page.locator('#num_guests').fill('50')
    await page.locator('#num_guests').clear()
    const valueAfterClear = await page.locator('#num_guests').inputValue()
    expect(valueAfterClear).toBe('')

    console.log('✅ AdminBookingForm - num_guests autocomplete fix verificato')
  })

  test('AcceptBookingModal e DetailsTab - verifica autocomplete="off" in modali', async ({ page }) => {
    // Login come admin
    await page.goto('http://localhost:5174/login')
    await page.fill('input[type="email"]', 'admin@alritrovo.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/admin', { timeout: 10000 })

    // Verifica che ci siano richieste o prenotazioni da gestire
    const hasRequests = await page.locator('text=Richieste Pendenti').isVisible()
    const hasBookings = await page.locator('text=Prenotazioni Accettate').isVisible()

    if (hasRequests) {
      // Clicca su una richiesta per aprire AcceptBookingModal
      await page.click('text=Richieste Pendenti')

      // Cerca il primo pulsante "Accetta" se presente
      const acceptButton = page.locator('button:has-text("Accetta")').first()
      const isAcceptVisible = await acceptButton.isVisible().catch(() => false)

      if (isAcceptVisible) {
        await acceptButton.click()

        // Attendi che il modal sia aperto (cerca l'input numero ospiti nel modal)
        const numGuestsInput = page.locator('.modal input[type="text"][inputMode="numeric"]').first()
        await numGuestsInput.waitFor({ state: 'visible', timeout: 3000 })

        // VERIFICA: autocomplete="off" nel modal
        const autocompleteAttr = await numGuestsInput.getAttribute('autocomplete')
        expect(autocompleteAttr).toBe('off')

        console.log('✅ AcceptBookingModal - num_guests autocomplete fix verificato')
      }
    }

    if (hasBookings) {
      // Clicca su una prenotazione per aprire BookingDetailsModal con DetailsTab
      await page.click('text=Prenotazioni Accettate')

      // Cerca la prima card di prenotazione
      const bookingCard = page.locator('[class*="booking-card"]').first()
      const isCardVisible = await bookingCard.isVisible().catch(() => false)

      if (isCardVisible) {
        await bookingCard.click()

        // Attendi che il modal sia aperto
        await page.waitForSelector('.modal', { state: 'visible', timeout: 3000 })

        // Attiva modalità edit
        const editButton = page.locator('button:has-text("Modifica")').first()
        const isEditVisible = await editButton.isVisible().catch(() => false)

        if (isEditVisible) {
          await editButton.click()

          // Cerca l'input numero ospiti nel DetailsTab
          const numGuestsInput = page.locator('.modal input[type="text"][inputMode="numeric"]').first()
          await numGuestsInput.waitFor({ state: 'visible', timeout: 3000 })

          // VERIFICA: autocomplete="off"
          const autocompleteAttr = await numGuestsInput.getAttribute('autocomplete')
          expect(autocompleteAttr).toBe('off')

          console.log('✅ DetailsTab - num_guests autocomplete fix verificato')
        }
      }
    }
  })

  test('Verifica che il valore 0 non venga mostrato come "0" ma come stringa vuota', async ({ page }) => {
    await page.goto('http://localhost:5174/prenota')
    await page.waitForSelector('#num_guests', { state: 'visible' })

    // Inserisci un numero
    await page.locator('#num_guests').fill('5')

    // Cancellalo completamente
    await page.locator('#num_guests').clear()

    // Verifica che il campo sia vuoto (non "0")
    const value = await page.locator('#num_guests').inputValue()
    expect(value).toBe('')
    expect(value).not.toBe('0')

    console.log('✅ Verifica rendering valore vuoto completata')
  })
})
