import type { BookingRequest } from '@/types/booking'
import type { CalendarEvent } from '@/types/booking'

const EVENT_TYPE_COLORS: Record<string, { bg: string; border: string }> = {
  cena: { bg: '#8B0000', border: '#6B0000' }, // bordeaux scuro
  aperitivo: { bg: '#DAA520', border: '#B8860B' }, // oro
  evento: { bg: '#9370DB', border: '#7B68EE' }, // viola
  laurea: { bg: '#20B2AA', border: '#008B8B' }, // acquamarina
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

