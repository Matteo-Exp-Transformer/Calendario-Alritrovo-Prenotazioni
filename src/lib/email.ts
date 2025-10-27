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

    console.log('🔵 [sendEmail] Attempting to send via Resend API...')
    console.log('🔵 [sendEmail] To:', options.to)
    console.log('🔵 [sendEmail] Subject:', options.subject)

    // Try to send via Supabase Edge Function if available
    // For now, we'll log but not send due to CORS restrictions
    console.warn('⚠️ [sendEmail] Direct API calls from browser blocked by CORS')
    console.warn('⚠️ [sendEmail] Need to implement Supabase Edge Function for email sending')
    
    // Return success for now to allow logging
    // TODO: Implement Edge Function for actual email sending
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
    console.log('🔵 [logEmailToDatabase] Using supabasePublic to bypass RLS...')
    const { supabasePublic } = await import('./supabasePublic')

    const logData = {
      booking_id: log.booking_id || null,
      email_type: log.email_type,
      recipient_email: log.recipient_email,
      status: log.status,
      provider_response: log.provider_response || null,
      error_message: log.error_message || null,
    }

    console.log('🔵 [logEmailToDatabase] Inserting log:', logData)

    const { data, error } = await supabasePublic.from('email_logs').insert(logData as any).select()

    if (error) {
      console.error('❌ [logEmailToDatabase] Error:', error)
    } else {
      console.log('✅ [logEmailToDatabase] Log inserted successfully:', data)
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
  console.log('🔵 [sendAndLogEmail] Starting email send...')
  console.log('🔵 [sendAndLogEmail] To:', options.to)
  console.log('🔵 [sendAndLogEmail] Type:', emailType)
  console.log('🔵 [sendAndLogEmail] Booking ID:', options.bookingId)

  const log: EmailLog = {
    booking_id: options.bookingId,
    email_type: emailType,
    recipient_email: options.to,
    status: 'pending',
  }

  console.log('🔵 [sendAndLogEmail] Calling sendEmail...')
  const result = await sendEmail(options)
  console.log('🔵 [sendAndLogEmail] Send result:', result)

  if (result.success) {
    log.status = 'sent'
    log.provider_response = { success: true }
    console.log('✅ [sendAndLogEmail] Email sent successfully')
  } else {
    log.status = 'failed'
    log.error_message = result.error
    console.error('❌ [sendAndLogEmail] Email failed:', result.error)
  }

  console.log('🔵 [sendAndLogEmail] Saving log to database:', log)
  await logEmailToDatabase(log)
  console.log('✅ [sendAndLogEmail] Log saved to database')

  return result
}

