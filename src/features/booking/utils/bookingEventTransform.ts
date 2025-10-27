import type { BookingRequest } from '@/types/booking'
import type { CalendarEvent } from '@/types/booking'

// Nuova Palette "Caldo & Legno"
const EVENT_TYPE_COLORS: Record<string, { bg: string; border: string }> = {
  cena: { bg: '#8B4513', border: '#6B3410' },       // warm-wood / warm-wood-dark
  aperitivo: { bg: '#DAA520', border: '#B8860B' },  // gold-warm
  evento: { bg: '#E07041', border: '#C55A30' },     // terracotta
  laurea: { bg: '#6B8E23', border: '#556B1A' },     // olive-green
}

export const transformBookingToCalendarEvent = (
  booking: BookingRequest
): CalendarEvent => {
  const color = EVENT_TYPE_COLORS[booking.event_type] || { bg: '#6B7280', border: '#4B5563' }

  return {
    id: booking.id,
    title: `${booking.client_name} - ${booking.num_guests} ospiti`,
    start: new Date(booking.confirmed_start!),
    end: new Date(booking.confirmed_end!),
    backgroundColor: color.bg,
    borderColor: color.border,
    extendedProps: booking,
  }
}

export const transformBookingsToCalendarEvents = (
  bookings: BookingRequest[]
): CalendarEvent[] => {
  return bookings
    .filter((b) => b.status === 'accepted' && b.confirmed_start && b.confirmed_end)
    .map(transformBookingToCalendarEvent)
}

