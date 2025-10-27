import type { BookingRequest, TimeSlot, TimeSlotCapacity, DailyCapacity } from '@/types/booking'
import { CAPACITY_CONFIG } from '../constants/capacity'

// Helper: parse time string to minutes
function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper: get time slot(s) from a time string
function getTimeSlotFromTime(time: string): TimeSlot[] {
  const timeMinutes = parseTime(time)
  const morningStart = parseTime(CAPACITY_CONFIG.MORNING_START)
  const morningEnd = parseTime(CAPACITY_CONFIG.MORNING_END)
  const afternoonStart = parseTime(CAPACITY_CONFIG.AFTERNOON_START)
  const afternoonEnd = parseTime(CAPACITY_CONFIG.AFTERNOON_END)
  const eveningStart = parseTime(CAPACITY_CONFIG.EVENING_START)
  const eveningEnd = parseTime(CAPACITY_CONFIG.EVENING_END)

  const slots: TimeSlot[] = []

  if (timeMinutes >= morningStart && timeMinutes <= morningEnd) {
    slots.push('morning')
  }
  if (timeMinutes >= afternoonStart && timeMinutes <= afternoonEnd) {
    slots.push('afternoon')
  }
  if (timeMinutes >= eveningStart && timeMinutes <= eveningEnd) {
    slots.push('evening')
  }
  return slots
}

// Extract time from ISO string
function extractTimeFromISO(isoString: string): string {
  const date = new Date(isoString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// Get slots occupied by a booking
export function getSlotsOccupiedByBooking(start: string, end: string): TimeSlot[] {
  const startTime = extractTimeFromISO(start)
  const endTime = extractTimeFromISO(end)
  
  const startSlots = getTimeSlotFromTime(startTime)
  const endSlots = getTimeSlotFromTime(endTime)
  
  const allSlots = [...startSlots, ...endSlots]
  
  return Array.from(new Set(allSlots))
}

// Calculate daily capacity for a specific date
export function calculateDailyCapacity(date: string, bookings: BookingRequest[]): DailyCapacity {
  const morning: TimeSlotCapacity = { 
    slot: 'morning', 
    capacity: CAPACITY_CONFIG.MORNING_CAPACITY, 
    occupied: 0, 
    available: CAPACITY_CONFIG.MORNING_CAPACITY 
  }
  const afternoon: TimeSlotCapacity = { 
    slot: 'afternoon', 
    capacity: CAPACITY_CONFIG.AFTERNOON_CAPACITY, 
    occupied: 0, 
    available: CAPACITY_CONFIG.AFTERNOON_CAPACITY 
  }
  const evening: TimeSlotCapacity = { 
    slot: 'evening', 
    capacity: CAPACITY_CONFIG.EVENING_CAPACITY, 
    occupied: 0, 
    available: CAPACITY_CONFIG.EVENING_CAPACITY 
  }

  const dayBookings = bookings.filter((booking) => {
    if (!booking.confirmed_start) return false
    const bookingDate = new Date(booking.confirmed_start).toISOString().split('T')[0]
    return bookingDate === date
  })

  for (const booking of dayBookings) {
    if (!booking.confirmed_start || !booking.confirmed_end) continue
    const slots = getSlotsOccupiedByBooking(booking.confirmed_start, booking.confirmed_end)
    const numGuests = booking.num_guests || 0
    for (const slot of slots) {
      if (slot === 'morning') { morning.occupied += numGuests }
      else if (slot === 'afternoon') { afternoon.occupied += numGuests }
      else if (slot === 'evening') { evening.occupied += numGuests }
    }
  }

  morning.available = Math.max(0, morning.capacity - morning.occupied)
  afternoon.available = Math.max(0, afternoon.capacity - afternoon.occupied)
  evening.available = Math.max(0, evening.capacity - evening.occupied)
  
  return { date, morning, afternoon, evening }
} 