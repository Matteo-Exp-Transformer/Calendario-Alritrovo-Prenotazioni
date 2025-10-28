import type { BookingRequest } from '@/types/booking'
import type { CalendarEvent } from '@/types/booking'

import { CAPACITY_CONFIG } from '../constants/capacity'

// Colori in base alla fascia oraria (delicati e leggibili)
const TIME_SLOT_COLORS = {
  morning: { bg: '#10B981', border: '#059669', text: '#000000' },           // Verde: 10:00-14:30
  afternoon: { bg: '#FDE047', border: '#FACC15', text: '#000000' },          // Giallo: 14:31-18:30
  evening: { bg: '#93C5FD', border: '#60A5FA', text: '#000000' },           // Azzurro: 18:31-23:30
}

/**
 * Determina il colore in base alla fascia oraria di inizio
 * Uses the same boundaries as capacity config for consistency:
 * - Morning: 10:00 - 14:30
 * - Afternoon: 14:31 - 18:30
 * - Evening: 18:31 - 23:30
 */
function getTimeSlotColor(startDate: Date): { bg: string; border: string; text: string } {
  const hour = startDate.getHours()
  const minute = startDate.getMinutes()
  const totalMinutes = hour * 60 + minute
  
  // Parse capacity config boundaries
  const [morningStartHour, morningStartMin] = CAPACITY_CONFIG.MORNING_START.split(':').map(Number)
  const [morningEndHour, morningEndMin] = CAPACITY_CONFIG.MORNING_END.split(':').map(Number)
  const [afternoonStartHour, afternoonStartMin] = CAPACITY_CONFIG.AFTERNOON_START.split(':').map(Number)
  const [afternoonEndHour, afternoonEndMin] = CAPACITY_CONFIG.AFTERNOON_END.split(':').map(Number)
  const [eveningStartHour, eveningStartMin] = CAPACITY_CONFIG.EVENING_START.split(':').map(Number)
  const [eveningEndHour, eveningEndMin] = CAPACITY_CONFIG.EVENING_END.split(':').map(Number)
  
  const morningStart = morningStartHour * 60 + morningStartMin  // 10:00 = 600
  const morningEnd = morningEndHour * 60 + morningEndMin         // 14:30 = 870
  const afternoonStart = afternoonStartHour * 60 + afternoonStartMin  // 14:31 = 871
  const afternoonEnd = afternoonEndHour * 60 + afternoonEndMin    // 18:30 = 1110
  const eveningStart = eveningStartHour * 60 + eveningStartMin    // 18:31 = 1111
  const eveningEnd = eveningEndHour * 60 + eveningEndMin         // 23:30 = 1410
  
  if (totalMinutes >= morningStart && totalMinutes <= morningEnd) {
    return TIME_SLOT_COLORS.morning
  } else if (totalMinutes >= afternoonStart && totalMinutes <= afternoonEnd) {
    return TIME_SLOT_COLORS.afternoon
  } else if (totalMinutes >= eveningStart && totalMinutes <= eveningEnd) {
    return TIME_SLOT_COLORS.evening
  } else {
    // Default to evening if outside all ranges
    return TIME_SLOT_COLORS.evening
  }
}

export const transformBookingToCalendarEvent = (
  booking: BookingRequest
): CalendarEvent => {
  // Parse dates and ensure they're interpreted as local time
  const startStr = booking.confirmed_start!
  const endStr = booking.confirmed_end!
  
  let startDate: Date
  let endDate: Date
  
  // Always extract time components directly from ISO string to avoid timezone issues
  const startMatch = startStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
  const endMatch = endStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
  
  if (startMatch && endMatch) {
    // Extract time components directly from string to avoid timezone conversion
    const [, year, month, day, hour, minute, second] = startMatch
    startDate = new Date(
      parseInt(year), 
      parseInt(month) - 1, 
      parseInt(day), 
      parseInt(hour), 
      parseInt(minute),
      parseInt(second)
    )
    
    const [, endYear, endMonth, endDay, endHour, endMinute, endSecond] = endMatch
    endDate = new Date(
      parseInt(endYear), 
      parseInt(endMonth) - 1, 
      parseInt(endDay), 
      parseInt(endHour), 
      parseInt(endMinute),
      parseInt(endSecond)
    )
  } else {
    // Fallback to Date parsing if format doesn't match
    startDate = new Date(startStr)
    endDate = new Date(endStr)
  }

  const color = getTimeSlotColor(startDate)

  const event: CalendarEvent = {
    id: booking.id,
    title: `${booking.client_name} - ${booking.num_guests} ospiti`,
    start: startDate,
    end: endDate,
    backgroundColor: color.bg,
    borderColor: color.border,
    extendedProps: booking,
  }
  
  if (color.text) {
    event.textColor = color.text
  }
  
  return event
}

export const transformBookingsToCalendarEvents = (
  bookings: BookingRequest[]
): CalendarEvent[] => {
  return bookings
    .filter((b) => b.status === 'accepted' && b.confirmed_start && b.confirmed_end)
    .map(transformBookingToCalendarEvent)
}

