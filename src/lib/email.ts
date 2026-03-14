// Email client using Resend API
// https://resend.com/docs/api-reference
// 
// Note: Email sending is handled via Supabase Edge Function
// Environment variables are configured in Supabase Secrets, not used directly in this file

interface SendEmailOptions {
  to: string | string[] // Support both single email and array (max 50 recipients)
  subject: string
  html: string
  bookingId?: string
  emailType?: string
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

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL not configured')
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-email`

    const payload = {
      to: options.to,
      subject: options.subject,
      html: options.html,
      bookingId: options.bookingId,
      emailType: options.emailType || 'manual',
    }


    // Call Supabase Edge Function for email sending
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    })


    const data = await response.json()


    if (!response.ok) {
      console.error('[Email] Edge Function error:', data)
      return { success: false, error: data.error || data.message || 'Failed to send email' }
    }

    // Check if Resend API returned an error
    if (data.error) {
      console.error('[Email] Resend API error:', data.error)
      return { success: false, error: data.error }
    }

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

    const logData = {
      booking_id: log.booking_id || null,
      email_type: log.email_type,
      recipient_email: log.recipient_email,
      status: log.status,
      provider_response: log.provider_response || null,
      error_message: log.error_message || null,
    }


    const { error } = await supabase.from('email_logs').insert(logData as any)

    if (error) {
      console.error('❌ [logEmailToDatabase] Error:', error)
    }
  } catch (error) {
    console.error('❌ [logEmailToDatabase] Exception:', error)
  }
}

/**
 * Send and log email
 */
export const sendAndLogEmail = async (
  options: SendEmailOptions,
  emailType: string
): Promise<{ success: boolean; error?: string }> => {

  // For logging, if to is an array, join with comma or use first email
  const recipientEmail = Array.isArray(options.to) ? options.to.join(', ') : options.to
  
  const log: EmailLog = {
    booking_id: options.bookingId,
    email_type: emailType,
    recipient_email: recipientEmail,
    status: 'pending',
  }

  const emailOptions = {
    to: options.to,
    subject: options.subject,
    html: options.html,
    bookingId: options.bookingId,
  }
  
  // Set emailType for Edge Function
  const result = await sendEmail({ ...emailOptions, emailType })

  if (result.success) {
    log.status = 'sent'
    log.provider_response = { success: true }
  } else {
    log.status = 'failed'
    log.error_message = result.error
    console.error('❌ [sendAndLogEmail] Email failed:', result.error)
  }

  await logEmailToDatabase(log)

  return result
}

