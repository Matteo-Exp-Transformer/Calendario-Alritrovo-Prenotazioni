import { test, expect } from '@playwright/test'

/**
 * Test: Le prenotazioni devono apparire SOLO nella card della fascia oraria di INIZIO
 *
 * Fasce orarie:
 * - Mattina: 10:00 - 14:30
 * - Pomeriggio: 14:31 - 18:30
 * - Sera: 18:31 - 23:30
 *
 * NOTA: Questi test verificano la logica di visualizzazione.
 * I calcoli di capacità continuano a usare la logica di overlap (corretto).
 */

test.describe('Visualizzazione prenotazioni nelle fasce orarie', () => {
  test.beforeEach(async ({ page }) => {
    // Login come admin
    await page.goto('http://localhost:5175')

    // Attendi che il form di login sia visibile
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    await page.fill('input[type="email"]', 'admin@alritrovo.it')
    await page.fill('input[type="password"]', 'alritrovo2024')
    await page.click('button[type="submit"]')

    // Attendi che la navigazione sia completata
    await page.waitForURL('**/admin', { timeout: 10000 })
  })

  test('Verifica che il calendario sia caricato e funzionante', async ({ page }) => {
    // Verifica che il calendario sia visibile
    await expect(page.locator('.fc-view')).toBeVisible({ timeout: 10000 })

    // Verifica che ci siano le tre fasce orarie (card)
    const pageContent = await page.content()

    // Cerca le card delle fasce orarie nel contenuto
    // Le card dovrebbero avere titoli con icone per Mattina, Pomeriggio, Sera
    expect(pageContent).toContain('Mattina') // 🌅
    expect(pageContent).toContain('Pomeriggio') // ☀️
    expect(pageContent).toContain('Sera') // 🌙
  })

  test('Verifica struttura HTML delle card fasce orarie', async ({ page }) => {
    // Clicca su una data futura per vedere i dettagli
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]

    // Trova e clicca sulla data
    const dateCell = page.locator(`.fc-day[data-date="${dateStr}"]`).first()
    await dateCell.click()

    // Attendi che le card siano visibili
    await page.waitForTimeout(500)

    // Verifica che esistano elementi che contengono i nomi delle fasce
    const morningText = page.getByText(/Mattina/i).first()
    const afternoonText = page.getByText(/Pomeriggio/i).first()
    const eveningText = page.getByText(/Sera/i).first()

    await expect(morningText).toBeVisible()
    await expect(afternoonText).toBeVisible()
    await expect(eveningText).toBeVisible()
  })

  test('Verifica che la funzione getStartSlotForBooking sia stata importata correttamente', async ({ page }) => {
    // Questo test verifica che non ci siano errori JavaScript nella console
    const errors: string[] = []

    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    // Naviga al calendario
    await page.goto('http://localhost:5175/admin')
    await page.waitForSelector('.fc-view', { timeout: 10000 })

    // Clicca su una data per attivare il codice di raggruppamento
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]

    const dateCell = page.locator(`.fc-day[data-date="${dateStr}"]`).first()
    await dateCell.click()

    await page.waitForTimeout(1000)

    // Verifica che non ci siano errori relativi a getStartSlotForBooking
    const relevantErrors = errors.filter(e =>
      e.includes('getStartSlotForBooking') ||
      e.includes('capacityCalculator')
    )

    expect(relevantErrors).toHaveLength(0)
  })
})

/**
 * NOTA: Test più avanzati che verificano il comportamento con prenotazioni reali
 * richiedono di creare prenotazioni di test nel database.
 *
 * Per ora, questi test verificano che:
 * 1. Il calendario si carica correttamente
 * 2. Le card delle fasce orarie sono presenti
 * 3. Non ci sono errori JavaScript
 *
 * Test futuri potrebbero includere:
 * - Creazione di prenotazioni tramite API Supabase
 * - Verifica che prenotazioni a orari specifici appaiano nelle card corrette
 * - Verifica che i calcoli di capacità siano corretti
 */
