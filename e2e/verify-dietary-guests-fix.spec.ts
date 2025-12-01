import { test, expect } from '@playwright/test'

/**
 * Test E2E per verificare il fix del campo "Numero ospiti con intolleranze alimentari"
 *
 * PROBLEMA: Il campo mostrava sempre "1" e non era cancellabile
 * ROOT CAUSE:
 * - useState inizializzato a 1 invece di 0
 * - type="number" con min="1"
 * - onChange forzava a 1 quando vuoto: parseInt(e.target.value) || 1
 *
 * FIX:
 * - Inizializzato a 0
 * - Cambiato a type="text" con inputMode="numeric"
 * - Rimosso min="1"
 * - Aggiunto autoComplete="off"
 * - Rendering condizionale: mostra "" quando 0
 * - onChange permette valore 0
 */

test('Campo numero ospiti intolleranze - deve essere vuoto e cancellabile', async ({ page }) => {
  // Vai alla pagina di prenotazione
  await page.goto('http://localhost:5174/prenota')

  // Attendi che la pagina sia caricata
  await page.waitForLoadState('networkidle')

  // Scrolla alla sezione intolleranze
  await page.locator('text=Intolleranze e Richieste Speciali').scrollIntoViewIfNeeded()

  // Attendi che il campo sia visibile
  const dietaryGuestsInput = page.locator('label:has-text("Numero ospiti con intolleranze alimentari")').locator('..').locator('input')
  await dietaryGuestsInput.waitFor({ state: 'visible', timeout: 5000 })

  // Fai screenshot iniziale
  await page.screenshot({ path: 'e2e/screenshots/dietary-guests-01-initial.png', fullPage: true })

  // VERIFICA 1: Il campo deve essere vuoto inizialmente (non "1")
  const initialValue = await dietaryGuestsInput.inputValue()
  console.log('Valore iniziale:', initialValue)
  expect(initialValue).toBe('')

  // VERIFICA 2: Il campo deve avere autocomplete="off"
  const autocomplete = await dietaryGuestsInput.getAttribute('autocomplete')
  expect(autocomplete).toBe('off')

  // VERIFICA 3: Il campo deve avere type="text" (non "number")
  const type = await dietaryGuestsInput.getAttribute('type')
  expect(type).toBe('text')

  // VERIFICA 4: L'utente deve poter inserire un numero
  await dietaryGuestsInput.fill('5')
  const valueAfterFill = await dietaryGuestsInput.inputValue()
  expect(valueAfterFill).toBe('5')

  await page.screenshot({ path: 'e2e/screenshots/dietary-guests-02-after-fill.png', fullPage: true })

  // VERIFICA 5: L'utente deve poter cancellare completamente
  await dietaryGuestsInput.clear()
  const valueAfterClear = await dietaryGuestsInput.inputValue()
  expect(valueAfterClear).toBe('')

  await page.screenshot({ path: 'e2e/screenshots/dietary-guests-03-after-clear.png', fullPage: true })

  // VERIFICA 6: L'utente deve poter cancellare carattere per carattere
  await dietaryGuestsInput.fill('123')
  await dietaryGuestsInput.press('Backspace')
  await dietaryGuestsInput.press('Backspace')
  await dietaryGuestsInput.press('Backspace')
  const valueAfterBackspace = await dietaryGuestsInput.inputValue()
  expect(valueAfterBackspace).toBe('')

  console.log('✅ Tutti i test passati! Il campo intolleranze è vuoto e cancellabile')
})
