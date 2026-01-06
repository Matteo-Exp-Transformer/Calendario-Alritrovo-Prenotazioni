import { test, expect } from '@playwright/test'

test('should auto-add Mini Rustici Misti when threshold met', async ({ page }) => {
  await page.goto('http://localhost:5175/prenota')
  await page.click('button:has-text("Rinfresco di Laurea")')

  await page.fill('input[name="nome"]', 'Test User')
  await page.fill('input[type="date"]', '2025-12-15')
  await page.fill('input[name="num_guests"]', '20')

  await page.click('button:has-text("Avanti")')

  // Verifica stato iniziale
  await expect(page.locator('text=Aggiungi ancora €')).toBeVisible()
  await expect(page.locator('text=Mini Rustici Misti')).not.toBeVisible()

  // Seleziona items per raggiungere soglia (€19 totale)
  await page.click('text=Caraffe drink')
  await page.click('text=Pizza Margherita')
  await page.click('text=Farinata')
  await page.click('text=Olive Ascolana')

  // Verifica Mini Rustici Misti appare
  await expect(page.locator('text=Congratulazioni!')).toBeVisible()
  await expect(page.locator('text=Mini Rustici Misti (In regalo)')).toBeVisible()

  // Rimuovi item per scendere sotto soglia
  await page.click('text=Farinata')

  // Verifica Mini Rustici Misti sparisce
  await expect(page.locator('text=Mini Rustici Misti')).not.toBeVisible()
})

test('Mini Rustici Misti should not appear in selectable menu cards', async ({ page }) => {
  await page.goto('http://localhost:5175/prenota')
  await page.click('button:has-text("Rinfresco di Laurea")')

  await page.fill('input[name="nome"]', 'Test User')
  await page.fill('input[type="date"]', '2025-12-15')
  await page.fill('input[name="num_guests"]', '20')

  await page.click('button:has-text("Avanti")')

  // Verifica che Mini Rustici Misti NON sia nelle card selezionabili
  const menuCards = page.locator('.menu-item-card')
  const miniRusticiCard = menuCards.filter({ hasText: 'Mini Rustici Misti' })
  await expect(miniRusticiCard).toHaveCount(0)
})

test('Mini Rustici Misti can be manually removed by user', async ({ page }) => {
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

  await expect(page.locator('text=Mini Rustici Misti (In regalo)')).toBeVisible()

  // Verifica che il pulsante X sia presente e funzionante
  const miniRusticiChip = page.locator('button:has-text("Mini Rustici Misti (In regalo)")')
  await expect(miniRusticiChip).toBeVisible()

  // Clicca per rimuovere
  await miniRusticiChip.click()

  // Verifica che Mini Rustici Misti sia stato rimosso
  await expect(page.locator('text=Mini Rustici Misti (In regalo)')).not.toBeVisible()
})
