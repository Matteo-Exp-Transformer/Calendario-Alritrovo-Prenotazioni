import { test, expect } from '@playwright/test'

test('should auto-add Vol-au-vent when threshold met', async ({ page }) => {
  await page.goto('http://localhost:5175/prenota')
  await page.click('button:has-text("Rinfresco di Laurea")')

  await page.fill('input[name="nome"]', 'Test User')
  await page.fill('input[type="date"]', '2025-12-15')
  await page.fill('input[name="num_guests"]', '20')

  await page.click('button:has-text("Avanti")')

  // Verifica stato iniziale
  await expect(page.locator('text=Aggiungi ancora €')).toBeVisible()
  await expect(page.locator('text=Vol-au-vent Misti')).not.toBeVisible()

  // Seleziona items per raggiungere soglia (€19 totale)
  await page.click('text=Caraffe drink')
  await page.click('text=Pizza Margherita')
  await page.click('text=Farinata')
  await page.click('text=Olive Ascolana')

  // Verifica Vol-au-vent appare
  await expect(page.locator('text=Congratulazioni!')).toBeVisible()
  await expect(page.locator('text=Vol-au-vent Misti (In regalo)')).toBeVisible()

  // Rimuovi item per scendere sotto soglia
  await page.click('text=Farinata')

  // Verifica Vol-au-vent sparisce
  await expect(page.locator('text=Vol-au-vent Misti')).not.toBeVisible()
})

test('Vol-au-vent should not appear in selectable menu cards', async ({ page }) => {
  await page.goto('http://localhost:5175/prenota')
  await page.click('button:has-text("Rinfresco di Laurea")')

  await page.fill('input[name="nome"]', 'Test User')
  await page.fill('input[type="date"]', '2025-12-15')
  await page.fill('input[name="num_guests"]', '20')

  await page.click('button:has-text("Avanti")')

  // Verifica che Vol-au-vent NON sia nelle card selezionabili
  const menuCards = page.locator('.menu-item-card')
  const volauventCard = menuCards.filter({ hasText: 'Vol-au-vent Misti' })
  await expect(volauventCard).toHaveCount(0)
})

test('Vol-au-vent can be manually removed by user', async ({ page }) => {
  await page.goto('http://localhost:5175/prenota')
  await page.click('button:has-text("Rinfresco di Laurea")')

  await page.fill('input[name="nome"]', 'Test User')
  await page.fill('input[type="date"]', '2025-12-15')
  await page.fill('input[name="num_guests"]', '20')

  await page.click('button:has-text("Avanti")')

  // Seleziona items per attivare promozione
  await page.click('text=Caraffe drink')
  await page.click('text=Pizza Margherita')
  await page.click('text=Farinata')
  await page.click('text=Olive Ascolana')

  await expect(page.locator('text=Vol-au-vent Misti (In regalo)')).toBeVisible()

  // Verifica che il pulsante X sia presente e funzionante
  const volauventChip = page.locator('button:has-text("Vol-au-vent Misti (In regalo)")')
  await expect(volauventChip).toBeVisible()

  // Clicca per rimuovere
  await volauventChip.click()

  // Verifica che Vol-au-vent sia stato rimosso
  await expect(page.locator('text=Vol-au-vent Misti (In regalo)')).not.toBeVisible()
})
