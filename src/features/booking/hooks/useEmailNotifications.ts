// @ts-nocheck
import { sendAndLogEmail } from '@/lib/email'
import {
  getBookingAcceptedEmail,
  getBookingRejectedEmail,
  getBookingCancelledEmail,
} from '@/lib/emailTemplates'
import type { BookingRequest } from '@/types/booking'

/**
 * Send email when booking is accepted
 */
export const sendBookingAcceptedEmail = async (booking: BookingRequest): Promise<{ success: boolean }> => {
  try {
    const { subject, html } = getBookingAcceptedEmail(booking)

    const result = await sendAndLogEmail(
      {
        to: booking.client_email,
        subject,
        html,
        bookingId: booking.id,
      },
      'booking_accepted'
    )

    return { success: result.success }
  } catch (error) {
    console.error('[Email] Error sending accepted email:', error)
    return { success: false }
  }
}

/**
 * Send email when booking is rejected
 */
export const sendBookingRejectedEmail = async (booking: BookingRequest): Promise<{ success: boolean }> => {
  try {
    const { subject, html } = getBookingRejectedEmail(booking)

    const result = await sendAndLogEmail(
      {
        to: booking.client_email,
        subject,
        html,
        bookingId: booking.id,
      },
      'booking_rejected'
    )

    return { success: result.success }
  } catch (error) {
    console.error('[Email] Error sending rejected email:', error)
    return { success: false }
  }
}

/**
 * Send email when booking is cancelled
 */
export const sendBookingCancelledEmail = async (booking: BookingRequest): Promise<{ success: boolean }> => {
  try {
    const { subject, html } = getBookingCancelledEmail(booking)

    const result = await sendAndLogEmail(
      {
        to: booking.client_email,
        subject,
        html,
        bookingId: booking.id,
      },
      'booking_cancelled'
    )

    return { success: result.success }
  } catch (error) {
    console.error('[Email] Error sending cancelled email:', error)
    return { success: false }
  }
}

/**
 * Check if email notifications are enabled
 */
export const areEmailNotificationsEnabled = (): boolean => {
  // In production, this should check restaurant_settings table
  // For now, return true if RESEND_API_KEY is configured
  const apiKey = import.meta.env.RESEND_API_KEY || import.meta.env.VITE_RESEND_API_KEY
  console.log('🔵 [areEmailNotificationsEnabled] Checking:', {
    RESEND_API_KEY: !!import.meta.env.RESEND_API_KEY,
    VITE_RESEND_API_KEY: !!import.meta.env.VITE_RESEND_API_KEY,
    RESEND_API_KEY_value: import.meta.env.RESEND_API_KEY ? 'presente' : 'mancante',
    VITE_RESEND_API_KEY_value: import.meta.env.VITE_RESEND_API_KEY ? 'presente' : 'mancante',
    result: !!apiKey
  })
  // Per ora attiva sempre: RESEND_API_KEY è configurata in Supabase Edge Function secrets
  return true
}

