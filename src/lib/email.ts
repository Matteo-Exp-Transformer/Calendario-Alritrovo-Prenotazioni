// Email client using Resend API
// https://resend.com/docs/api-reference

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || import.meta.env.VITE_RESEND_API_KEY
const SENDER_EMAIL = import.meta.env.SENDER_EMAIL || import.meta.env.VITE_SENDER_EMAIL || 'noreply@resend.dev'
const SENDER_NAME = import.meta.env.SENDER_NAME || import.meta.env.VITE_SENDER_NAME || 'Al Ritrovo'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  bookingId?: string
}

interface EmailLog {
  booking_id?: string
  email_type: string
  recipient_email: string
  status: 'sent' | 'failed' | 'pending'
  provider_response?: Record<string, any>
  error_message?: string
}

/**
 * Send email using Resend API
 */
export const sendEmail = async (options: SendEmailOptions): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!RESEND_API_KEY) {
      console.error('[Email] RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Email] Error:', data)
      return { success: false, error: data.message || 'Failed to send email' }
    }

    console.log('[Email] Sent successfully:', data)
    return { success: true }
  } catch (error) {
    console.error('[Email] Exception:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Log email to database
 */
export const logEmailToDatabase = async (log: EmailLog): Promise<void> => {
  try {
    const { supabase } = await import('./supabase')

    const { error } = await supabase.from('email_logs').insert({
      booking_id: log.booking_id || null,
      email_type: log.email_type,
      recipient_email: log.recipient_email,
      status: log.status,
      provider_response: log.provider_response || null,
      error_message: log.error_message || null,
    } as any)

    if (error) {
      console.error('[Email] Error logging to database:', error)
    }
  } catch (error) {
    console.error('[Email] Exception logging to database:', error)
  }
}

/**
 * Send and log email
 */
export const sendAndLogEmail = async (
  options: SendEmailOptions,
  emailType: string
): Promise<{ success: boolean; error?: string }> => {
  const log: EmailLog = {
    booking_id: options.bookingId,
    email_type: emailType,
    recipient_email: options.to,
    status: 'pending',
  }

  const result = await sendEmail(options)

  if (result.success) {
    log.status = 'sent'
    log.provider_response = { success: true }
  } else {
    log.status = 'failed'
    log.error_message = result.error
  }

  await logEmailToDatabase(log)

  return result
}

