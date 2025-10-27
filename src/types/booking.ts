// Type definitions for Al Ritrovo Booking System

export type BookingStatus = 'pending' | 'accepted' | 'rejected'
export type EventType = 'cena' | 'aperitivo' | 'evento' | 'laurea'
export type AdminRole = 'admin' | 'staff'

export interface BookingRequest {
  id: string
  created_at: string
  updated_at: string

  // Client information
  client_name: string
  client_email: string
  client_phone?: string

  // Booking details
  event_type: EventType
  desired_date: string
  desired_time?: string
  num_guests: number
  special_requests?: string

  // Status management
  status: BookingStatus
  confirmed_start?: string
  confirmed_end?: string
  rejection_reason?: string

  // Cancellation tracking
  cancellation_reason?: string
  cancelled_at?: string
  cancelled_by?: string
}

export interface BookingRequestInput {
  client_name: string
  client_email: string
  client_phone?: string
  event_type: EventType
  desired_date: string
  desired_time?: string
  num_guests: number
  special_requests?: string
}

export interface AdminUser {
  id: string
  email: string
  password_hash: string
  role: AdminRole
  name?: string
  created_at: string
  updated_at: string
}

export interface EmailLog {
  id: string
  booking_id: string
  email_type: string
  recipient_email: string
  sent_at: string
  status: 'sent' | 'failed' | 'pending'
  provider_response?: Record<string, any>
  error_message?: string
}

export interface RestaurantSetting {
  id: string
  setting_key: string
  setting_value: Record<string, any>
  updated_at: string
}

// Calendar event type (for FullCalendar integration)
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  backgroundColor: string
  borderColor: string
  extendedProps: BookingRequest
}

// Form validation types
export interface BookingFormErrors {
  client_name?: string
  client_email?: string
  client_phone?: string
  event_type?: string
  desired_date?: string
  desired_time?: string
  num_guests?: string
  special_requests?: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// Capacity management types
export type TimeSlot = 'morning' | 'afternoon' | 'evening'

export interface TimeSlotCapacity {
  slot: TimeSlot
  capacity: number
  occupied: number
  available: number
}

export interface DailyCapacity {
  date: string
  morning: TimeSlotCapacity
  afternoon: TimeSlotCapacity
  evening: TimeSlotCapacity
}

export interface AvailabilityCheck {
  isAvailable: boolean
  slotsStatus: TimeSlotCapacity[]
  errorMessage?: string
}
