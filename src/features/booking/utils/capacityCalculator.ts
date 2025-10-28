import type { BookingRequest, TimeSlot, TimeSlotCapacity, DailyCapacity } from '@/types/booking'
import { CAPACITY_CONFIG } from '../constants/capacity'

// Helper: parse time string to minutes
function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Extract time from ISO string - handles both local and UTC times properly
function extractTimeFromISO(isoString: string): string {
  // Always extract time components directly from the ISO string
  // to avoid timezone conversion issues
  const match = isoString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
  
  if (match) {
    const hour = match[4]
    const minute = match[5]
    console.log('🔍 [extractTimeFromISO] Extracted time:', `${hour}:${minute}`, 'from:', isoString)
    // Return time directly from string (no timezone conversion)
    return `${hour}:${minute}`
  }
  
  // Fallback to Date parsing
  const date = new Date(isoString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// Get slots occupied by a booking
export function getSlotsOccupiedByBooking(start: string, _end: string): TimeSlot[] {
  const startTime = extractTimeFromISO(start)
  
  const startMinutes = parseTime(startTime)
  
  const morningStart = parseTime(CAPACITY_CONFIG.MORNING_START)
  const morningEnd = parseTime(CAPACITY_CONFIG.MORNING_END)
  const afternoonStart = parseTime(CAPACITY_CONFIG.AFTERNOON_START)
  const afternoonEnd = parseTime(CAPACITY_CONFIG.AFTERNOON_END)
  const eveningStart = parseTime(CAPACITY_CONFIG.EVENING_START)
  const eveningEnd = parseTime(CAPACITY_CONFIG.EVENING_END)
  
  console.log('🔍 [getSlotsOccupiedByBooking]', {
    startISO: start,
    startTime,
    startMinutes,
    morningStart,
    morningEnd,
    afternoonStart,
    afternoonEnd,
    eveningStart,
    eveningEnd
  })
  
  const slots: TimeSlot[] = []
  
  // Simple rule: booking goes to the slot where it STARTS
  if (startMinutes >= morningStart && startMinutes <= morningEnd) {
    console.log('✅ Added to morning')
    slots.push('morning')
  } else if (startMinutes >= afternoonStart && startMinutes <= afternoonEnd) {
    console.log('✅ Added to afternoon')
    slots.push('afternoon')
  } else if (startMinutes >= eveningStart && startMinutes <= eveningEnd) {
    console.log('✅ Added to evening')
    slots.push('evening')
  } else {
    console.log('⚠️ No slot matched!')
  }
  
  console.log('📊 Final slots:', slots)
  
  return slots
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