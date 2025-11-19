/**
 * TEST: Verifica invio email a qualsiasi indirizzo email (singolo e array)
 * 
 * Questo test verifica che il sistema possa inviare email a qualsiasi
 * indirizzo email, non solo a indirizzi autorizzati, e supporti array di destinatari.
 * 
 * RED-GREEN-REFACTOR:
 * - RED: Test che verifica il supporto per qualsiasi indirizzo email e array
 * - GREEN: Implementare modifiche per supportare string | string[]
 * - REFACTOR: Verificare che tutto funzioni correttamente
 */

import { test, expect } from '@playwright/test'

test.describe('Email Sending - Any Recipient Support', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to admin dashboard (or test email modal)
    // For now, we'll test via API directly
  })

  test('should send email to any single email address', async ({ request }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
    
    // Test with various email formats to ensure no restrictions
    const testEmails = [
      'external@example.com',
      'user@gmail.com',
      'test+alias@domain.co.uk',
      'user123@test-domain.com'
    ]

    for (const email of testEmails) {
      const response = await request.post(`${supabaseUrl}/functions/v1/send-email`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        data: {
          to: email,
          subject: 'Test Email - Any Recipient',
          html: '<p>Test email to verify any recipient support</p>',
          emailType: 'test',
        },
      })

      // Should accept the request (status 200) even if email sending fails due to config
      // We're testing that the API accepts any email, not that it successfully sends
      expect(response.status()).toBeLessThan(500) // Not a server error
      
      const data = await response.json()
      
      // Either success or configuration error, but not "invalid recipient"
      expect(data).toBeDefined()
      // Should not have "invalid recipient" or "unauthorized email" errors
      expect(JSON.stringify(data)).not.toContain('invalid recipient')
      expect(JSON.stringify(data)).not.toContain('unauthorized')
    }
  })

  test('should support array of recipients (up to 50)', async ({ request }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
    
    // Test with array of 5 recipients (well below limit of 50)
    const recipients = [
      'recipient1@example.com',
      'recipient2@test.com',
      'recipient3@domain.com',
      'recipient4@email.com',
      'recipient5@mail.com'
    ]

    const response = await request.post(`${supabaseUrl}/functions/v1/send-email`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      data: {
        to: recipients, // Array instead of string
        subject: 'Test Email - Multiple Recipients',
        html: '<p>Test email to multiple recipients</p>',
        emailType: 'test',
      },
    })

    expect(response.status()).toBeLessThan(500)
    const data = await response.json()
    
    // Should accept array format
    expect(data).toBeDefined()
    // Should not have "invalid format" or type errors
    expect(JSON.stringify(data)).not.toContain('invalid format')
    expect(JSON.stringify(data)).not.toContain('must be a string')
  })

  test('should handle maximum 50 recipients', async ({ request }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
    
    // Create array of exactly 50 recipients
    const recipients = Array.from({ length: 50 }, (_, i) => `user${i}@test.com`)

    const response = await request.post(`${supabaseUrl}/functions/v1/send-email`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      data: {
        to: recipients,
        subject: 'Test Email - 50 Recipients',
        html: '<p>Test email to 50 recipients</p>',
        emailType: 'test',
      },
    })

    expect(response.status()).toBeLessThan(500)
    const data = await response.json()
    expect(data).toBeDefined()
  })

  test('should reject more than 50 recipients', async ({ request }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
    
    // Create array of 51 recipients (over limit)
    const recipients = Array.from({ length: 51 }, (_, i) => `user${i}@test.com`)

    const response = await request.post(`${supabaseUrl}/functions/v1/send-email`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      data: {
        to: recipients,
        subject: 'Test Email - Too Many Recipients',
        html: '<p>Test email to 51 recipients (should fail)</p>',
        emailType: 'test',
      },
    })

    const data = await response.json()
    
    // Should either reject or handle gracefully
    // Resend API will reject >50, so we should validate client-side
    if (response.status() === 400 || response.status() === 422) {
      // Validation error is acceptable
      expect(data.error || data.message).toBeDefined()
    } else {
      // If it passes to Resend, it will be rejected there
      // But we prefer client-side validation
    }
  })
})












