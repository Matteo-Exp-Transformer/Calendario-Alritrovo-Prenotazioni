import { test, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Legge email e password da Sessioni di lavoro/24-02-2026/ADMIN-LOGIN.md.
 * Fallback: env ADMIN_EMAIL e ADMIN_PASSWORD (per CI).
 */
function getAdminCredentials(): { email: string; password: string } {
  const envEmail = process.env.ADMIN_EMAIL
  const envPassword = process.env.ADMIN_PASSWORD
  if (envEmail && envPassword) {
    return { email: envEmail, password: envPassword }
  }

  const credentialsPath = path.join(
    process.cwd(),
    'Sessioni di lavoro',
    '24-02-2026',
    'ADMIN-LOGIN.md'
  )
  if (!fs.existsSync(credentialsPath)) {
    throw new Error(
      `File credenziali non trovato: ${credentialsPath}. Crealo da ADMIN-LOGIN.md o imposta ADMIN_EMAIL e ADMIN_PASSWORD.`
    )
  }

  const content = fs.readFileSync(credentialsPath, 'utf-8')
  const values: string[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('|') && trimmed.includes('`')) {
      const m = trimmed.match(/\|\s*`([^`]+)`\s*\|/)
      if (m) {
        const v = m[1].trim()
        if (v.includes('@') && v.endsWith('.com')) {
          values[0] = v
        } else if (!v.startsWith('input') && v.length < 50) {
          values[1] = v
        }
      }
    }
  }

  const email = values[0]
  const password = values[1]
  if (!email || !password) {
    throw new Error(
      `Impossibile parsare email/password da ${credentialsPath}. Verifica la tabella (valori in backtick).`
    )
  }
  return { email, password }
}

test.describe('Admin login (per verifica agente)', () => {
  test('login e cattura dashboard', async ({ page }) => {
    const { email, password } = getAdminCredentials()

    await page.goto('/login')

    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(password)
    await page.getByRole('button', { name: /Accedi|Accesso in corso/ }).click()

    await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 })

    const screenshotDir = path.join(
      process.cwd(),
      'Sessioni di lavoro',
      '24-02-2026'
    )
    const screenshotPath = path.join(screenshotDir, 'admin-verification.png')

    await fs.promises.mkdir(screenshotDir, { recursive: true })
    await page.screenshot({ path: screenshotPath, fullPage: false })

    console.log(`Screenshot salvato: ${screenshotPath}`)
  })
})
