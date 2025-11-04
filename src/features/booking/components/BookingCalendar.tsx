import React, { useState, useEffect, useMemo, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { Calendar, Users, Sunrise, Sun, Moon, Mail, Phone, Clock, UtensilsCrossed } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import type { BookingRequest } from '@/types/booking'
import { transformBookingsToCalendarEvents } from '../utils/bookingEventTransform'
import { BookingDetailsModal } from './BookingDetailsModal'
import { calculateDailyCapacity, getSlotsOccupiedByBooking } from '../utils/capacityCalculator'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'

import { extractDateFromISO, extractTimeFromISO } from '../utils/dateUtils'

/**
 * Helper per ottenere l'orario accurato di una prenotazione
 * Preferisce desired_time (TIME senza timezone) a confirmed_start (TIMESTAMP WITH TIME ZONE)
 * per evitare shift timezone in production
 */
const getAccurateTime = (booking: BookingRequest): string => {
  // Preferisci desired_time (accurato, senza conversioni timezone)
  if (booking.desired_time) return booking.desired_time
  // Fallback a confirmed_start (può avere shift timezone in production)
  if (booking.confirmed_start) return extractTimeFromISO(booking.confirmed_start)
  return ''
}

interface BookingCalendarProps {
  bookings: BookingRequest[]
  initialDate?: string | null
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings, initialDate }) => {
  const calendarRef = useRef<FullCalendar>(null)
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Set today's date as default, or initialDate if provided
    return initialDate || new Date().toISOString().split('T')[0]
  })
  const [calendarKey, setCalendarKey] = useState(0) // Force re-render key

  // Aggiorna il selectedBooking quando i bookings cambiano (dopo modifica)
  useEffect(() => {
    if (selectedBooking) {
      const updatedBooking = bookings.find(b => b.id === selectedBooking.id)
      if (updatedBooking && JSON.stringify(updatedBooking) !== JSON.stringify(selectedBooking)) {
        setSelectedBooking(updatedBooking)
      }
    }
  }, [bookings, selectedBooking])

  // Force calendar re-render when selectedDate changes
  useEffect(() => {
    setCalendarKey(prev => prev + 1)
  }, [selectedDate])

  // Navigate to initialDate when it changes (from Archive)
  useEffect(() => {
    if (initialDate && calendarRef.current) {
      try {
        const calendarApi = calendarRef.current.getApi()
        // Parse date in local timezone to avoid timezone issues
        const [year, month, day] = initialDate.split('-').map(Number)
        const targetDate = new Date(year, month - 1, day)
        calendarApi.gotoDate(targetDate)
        setSelectedDate(initialDate)
        console.log('✅ [BookingCalendar] Navigated to date:', initialDate)
      } catch (error) {
        console.error('❌ [BookingCalendar] Error navigating to date:', error)
      }
    }
  }, [initialDate])

  const events = transformBookingsToCalendarEvents(bookings)

  const handleEventClick = (clickInfo: any) => {
    const booking = clickInfo.event.extendedProps as BookingRequest
    
    if (!booking) {
      return
    }
    
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const handleDateClick = (clickInfo: any) => {
    // ✅ Fix: Normalizza la data per evitare problemi di timezone
    // Ignora dateStr e forza l'estrazione locale dai metodi get* dell'oggetto Date
    const d = new Date(clickInfo.date)
    
    // Usa i metodi locali per evitare conversioni UTC
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const date = `${year}-${month}-${day}`
    
    console.log('Date clicked:', date, 'clickInfo.dateStr:', clickInfo.dateStr, 'arg.date:', clickInfo.date)
    setSelectedDate(date)
  }

  // Get bookings and capacity for selected date
  const selectedDateData = useMemo(() => {
    const acceptedBookings = bookings.filter(b => b.status === 'accepted')
    const dayCapacity = calculateDailyCapacity(selectedDate, acceptedBookings)
    
    const dayBookings = acceptedBookings.filter((booking) => {
      if (!booking.confirmed_start) return false
      const bookingDate = extractDateFromISO(booking.confirmed_start)
      return bookingDate === selectedDate
    })

    // Group bookings by time slot
    const morningBookings: BookingRequest[] = []
    const afternoonBookings: BookingRequest[] = []
    const eveningBookings: BookingRequest[] = []

    for (const booking of dayBookings) {
      if (!booking.confirmed_start || !booking.confirmed_end) continue
      const slots = getSlotsOccupiedByBooking(booking.confirmed_start, booking.confirmed_end)
      if (slots.includes('morning')) morningBookings.push(booking)
      if (slots.includes('afternoon')) afternoonBookings.push(booking)
      if (slots.includes('evening')) eveningBookings.push(booking)
    }

    return {
      date: selectedDate,
      capacity: dayCapacity,
      morningBookings,
      afternoonBookings,
      eveningBookings,
    }
  }, [selectedDate, bookings])

  const config = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    height: 'auto',
    locale: 'it',
    firstDay: 1, // Monday
    slotMinTime: '08:00:00',
    slotMaxTime: '24:00:00',
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday - Saturday
      startTime: '08:00',
      endTime: '22:00',
    },
    eventClick: handleEventClick,
    dateClick: handleDateClick,
    eventDisplay: 'block',
    eventTextColor: '#fff',
    eventCursor: 'pointer',
    eventTimeFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
    },
    // Ensure events don't overflow to other days in month view
    dayMaxEvents: 3,
    moreLinkClick: 'popover',
    // Highlight today and selected date
    dayCellDidMount: (arg: any) => {
      // ✅ Fix: Estrai date string usando metodi locali per evitare problemi di timezone
      const d = new Date(arg.date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const cellDateStr = `${year}-${month}-${day}`
      
      // Confronta oggi usando metodi locali
      const today = new Date()
      const todayYear = today.getFullYear()
      const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
      const todayDay = String(today.getDate()).padStart(2, '0')
      const todayStr = `${todayYear}-${todayMonth}-${todayDay}`
      
      const isToday = cellDateStr === todayStr
      const isSelected = cellDateStr === selectedDate
      
      // Remove FullCalendar's default today class
      arg.el.classList.remove('fc-day-today')
      
      // Clear any previous styles
      arg.el.style.cssText = ''
      
      if (isToday && isSelected) {
        // Today + Selected: blue darker for selected on today
        arg.el.style.cssText = `
          background-color: #93c5fd !important;
          border: 3px solid #1d4ed8 !important;
          border-radius: 10px !important;
          font-weight: bold !important;
          box-shadow: 0 4px 8px rgba(29, 78, 216, 0.5) !important;
          transform: scale(1.02) !important;
          z-index: 10 !important;
        `
      } else if (isToday) {
        // Today only - YELLOW background (not blue!)
        arg.el.style.cssText = `
          background-color: #fef9c3 !important;
          border: 3px solid #f59e0b !important;
          border-radius: 8px !important;
          font-weight: bold !important;
        `
      } else if (isSelected) {
        // Selected only - DARKER blue background
        arg.el.style.cssText = `
          background-color: #60a5fa !important;
          border: 3px solid #1e40af !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 8px rgba(30, 64, 175, 0.4) !important;
          transform: scale(1.01) !important;
          z-index: 9 !important;
        `
      }
    },
    // Custom event rendering per card eventi migliorate
    eventContent: (arg: any) => {
      const booking = arg.event.extendedProps as BookingRequest

      return (
        <div className="px-2 py-1.5 rounded-lg text-white text-xs hover:opacity-90 transition-opacity cursor-pointer overflow-hidden">
          {/* Nome cliente */}
          <div className="flex items-center gap-1.5 font-semibold truncate mb-1">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{booking.client_name}</span>
          </div>
          
          {/* Dati in fila sotto */}
          <div className="flex items-center gap-2 text-xs opacity-90 truncate">
            <span>{booking.num_guests} ospiti</span>
            {booking.menu && (
              <>
                <span>•</span>
                <span className="truncate">{booking.menu}</span>
              </>
            )}
            {(booking.desired_time || booking.confirmed_start) && (
              <>
                <span>•</span>
                <span>{getAccurateTime(booking)}</span>
              </>
            )}
          </div>
        </div>
      )
    },
  }

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-warm-beige">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warm-wood to-warm-orange flex items-center justify-center shadow-md">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-serif font-bold text-warm-wood">
                Calendario Prenotazioni
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Vista completa delle prenotazioni accettate
              </p>
            </div>
            <span className="px-5 py-2.5 bg-gradient-to-r from-olive-green to-warm-wood text-white rounded-xl text-base font-semibold shadow-md">
              {bookings.length} prenotazioni
            </span>
          </div>

          <FullCalendar ref={calendarRef} key={calendarKey} {...config} events={events} />
        </div>

        {/* Sezione Disponibilità */}
        <div>
          {/* Header con data */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif font-bold text-warm-wood mb-2">
              Disponibilità
            </h3>
            <p className="text-lg text-gray-600">
              {format(new Date(selectedDateData.date), 'EEEE, dd MMMM yyyy', { locale: it })}
            </p>
          </div>

          {/* Mattina CollapsibleCard */}
          <div 
            className="rounded-lg overflow-hidden shadow-lg"
            style={{
              border: '4px solid rgb(34, 197, 94)',
              backgroundColor: 'rgba(209, 250, 229, 0.85)',
              marginBottom: '32px',
            }}
          >
            <CollapsibleCard
              title="Mattina"
              subtitle="10:00 - 14:30"
              icon={Sunrise}
              defaultExpanded={true}
              collapseDisabled={false}
              counter={{
                available: selectedDateData.capacity.morning.available,
                capacity: selectedDateData.capacity.morning.capacity
              }}
              headerClassName="bg-green-100 hover:bg-green-200 border-b-2 border-green-300"
              className="!bg-transparent !border-transparent !shadow-none"
            >
              <div className="px-4 sm:px-6 py-4" style={{ backgroundColor: 'rgba(187, 247, 208, 0.8)' }}>
                {selectedDateData.morningBookings.length > 0 ? (
                  selectedDateData.morningBookings.map((booking, index) => (
                    <React.Fragment key={booking.id}>
                      {index > 0 && (
                        <div className="my-8 flex items-center">
                          <div 
                            className="w-full"
                            style={{
                              height: '3px',
                              background: 'linear-gradient(to right, transparent, rgba(34, 197, 94, 0.4) 5%, rgba(34, 197, 94, 0.8) 20%, rgba(34, 197, 94, 1) 50%, rgba(34, 197, 94, 0.8) 80%, rgba(34, 197, 94, 0.4) 95%, transparent)',
                              borderRadius: '2px',
                              boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)',
                            }}
                          ></div>
                        </div>
                      )}
                      <div
                        className="bg-white/98 backdrop-blur-sm p-5 rounded-modern relative"
                        style={{
                          border: '3px solid rgba(255, 255, 255, 0.9)',
                          boxShadow: '0 0 0 1px rgba(255, 255, 255, 1), 0 0 0 2px rgba(255, 255, 255, 0.7), 0 0 0 3px rgba(255, 255, 255, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(0, 0, 0, 0.08)',
                          transform: 'translateY(-2px)',
                        }}
                      >
                      {/* Nome cliente */}
                      <div className="mb-4">
                        <h4 className="font-bold text-xl text-gray-900">
                          {booking.client_name}
                        </h4>
                      </div>

                      {/* Two-column layout */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">

                          {/* Email */}
                          <div className="flex items-center gap-10">
                            <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Email:</span>
                              <span className="text-gray-700 truncate font-medium">{booking.client_email}</span>
                            </div>
                          </div>

                          {/* Phone */}
                          {booking.client_phone && (
                            <div className="flex items-center gap-10">
                              <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Telefono:</span>
                                <span className="text-gray-700 font-medium">{booking.client_phone}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {/* Time */}
                          {(booking.desired_time || booking.confirmed_start) && (
                            <div className="flex items-center gap-10">
                              <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Orario:</span>
                                <span className="text-gray-700 font-semibold">
                                  {getAccurateTime(booking)} - {booking.confirmed_end && extractTimeFromISO(booking.confirmed_end)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Event Type */}
                          <div className="flex items-center gap-10">
                            <UtensilsCrossed className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Evento:</span>
                              <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">{booking.event_type?.replace(/_/g, ' ') || 'N/A'}</span>
                            </div>
                          </div>

                          {/* Guest Count */}
                          <div className="flex items-center gap-10">
                            <Users className="w-5 h-5 text-green-700 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Ospiti:</span>
                              <span className="font-bold text-green-800">{booking.num_guests}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu (se presente) */}
                      {booking.menu && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 font-semibold mb-1">Menù:</p>
                          <p className="text-sm text-gray-700 line-clamp-3">{booking.menu}</p>
                        </div>
                      )}

                      {/* Note speciali (se presenti) */}
                      {booking.special_requests && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 font-semibold mb-1">Note speciali:</p>
                          <p className="text-sm text-gray-700 italic line-clamp-2">{booking.special_requests}</p>
                        </div>
                      )}
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                      <Sunrise className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-500 italic">Nessuna prenotazione per questa fascia oraria</p>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          </div>

          {/* Pomeriggio CollapsibleCard */}
          <div 
            className="rounded-lg overflow-hidden shadow-lg"
            style={{
              border: '4px solid rgb(234, 179, 8)',
              backgroundColor: 'rgba(254, 243, 199, 0.8)',
              marginTop: '32px',
              marginBottom: '32px',
            }}
          >
            <CollapsibleCard
              title="Pomeriggio"
              subtitle="14:31 - 18:30"
              icon={Sun}
              defaultExpanded={true}
              collapseDisabled={false}
              counter={{
                available: selectedDateData.capacity.afternoon.available,
                capacity: selectedDateData.capacity.afternoon.capacity
              }}
              headerClassName="bg-yellow-100 hover:bg-yellow-200 border-b-2 border-yellow-300"
              className="!bg-transparent !border-transparent !shadow-none"
            >
              <div className="px-4 sm:px-6 py-4" style={{ backgroundColor: 'rgba(253, 230, 138, 0.75)' }}>
                {selectedDateData.afternoonBookings.length > 0 ? (
                  selectedDateData.afternoonBookings.map((booking, index) => (
                    <React.Fragment key={booking.id}>
                      {index > 0 && (
                        <div className="my-8 flex items-center">
                          <div 
                            className="w-full"
                            style={{
                              height: '3px',
                              background: 'linear-gradient(to right, transparent, rgba(234, 179, 8, 0.4) 5%, rgba(234, 179, 8, 0.8) 20%, rgba(234, 179, 8, 1) 50%, rgba(234, 179, 8, 0.8) 80%, rgba(234, 179, 8, 0.4) 95%, transparent)',
                              borderRadius: '2px',
                              boxShadow: '0 2px 4px rgba(234, 179, 8, 0.2)',
                            }}
                          ></div>
                        </div>
                      )}
                      <div
                        className="bg-white/98 backdrop-blur-sm p-5 rounded-modern relative"
                        style={{
                          border: '3px solid rgba(255, 255, 255, 0.9)',
                          boxShadow: '0 0 0 1px rgba(255, 255, 255, 1), 0 0 0 2px rgba(255, 255, 255, 0.7), 0 0 0 3px rgba(255, 255, 255, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(0, 0, 0, 0.08)',
                          transform: 'translateY(-2px)',
                        }}
                      >
                      {/* Nome cliente */}
                      <div className="mb-4">
                        <h4 className="font-bold text-xl text-gray-900">
                          {booking.client_name}
                        </h4>
                      </div>

                      {/* Two-column layout */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">

                          {/* Email */}
                          <div className="flex items-center gap-10">
                            <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Email:</span>
                              <span className="text-gray-700 truncate font-medium">{booking.client_email}</span>
                            </div>
                          </div>

                          {/* Phone */}
                          {booking.client_phone && (
                            <div className="flex items-center gap-10">
                              <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Telefono:</span>
                                <span className="text-gray-700 font-medium">{booking.client_phone}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {/* Time */}
                          {(booking.desired_time || booking.confirmed_start) && (
                            <div className="flex items-center gap-10">
                              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Orario:</span>
                                <span className="text-gray-700 font-semibold">
                                  {getAccurateTime(booking)} - {booking.confirmed_end && extractTimeFromISO(booking.confirmed_end)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Event Type */}
                          <div className="flex items-center gap-10">
                            <UtensilsCrossed className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Evento:</span>
                              <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">{booking.event_type?.replace(/_/g, ' ') || 'N/A'}</span>
                            </div>
                          </div>

                          {/* Guest Count */}
                          <div className="flex items-center gap-10">
                            <Users className="w-5 h-5 text-yellow-700 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Ospiti:</span>
                              <span className="font-bold text-yellow-800">{booking.num_guests}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Menu (se presente) */}
                      {booking.menu && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 font-semibold mb-1">Menù:</p>
                          <p className="text-sm text-gray-700 line-clamp-3">{booking.menu}</p>
                        </div>
                      )}

                      {/* Note speciali (se presenti) */}
                      {booking.special_requests && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 font-semibold mb-1">Note speciali:</p>
                          <p className="text-sm text-gray-700 italic line-clamp-2">{booking.special_requests}</p>
                        </div>
                      )}
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Sun className="w-8 h-8 text-yellow-500" />
                    </div>
                    <p className="text-sm text-gray-500 italic">Nessuna prenotazione per questa fascia oraria</p>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          </div>

          {/* Sera CollapsibleCard */}
          <div 
            className="rounded-lg overflow-hidden shadow-lg"
            style={{
              border: '4px solid rgb(59, 130, 246)',
              backgroundColor: 'rgba(191, 219, 254, 0.85)',
              marginTop: '32px',
            }}
          >
            <CollapsibleCard
              title="Sera"
              subtitle="18:31 - 23:30"
              icon={Moon}
              defaultExpanded={true}
              collapseDisabled={false}
              counter={{
                available: selectedDateData.capacity.evening.available,
                capacity: selectedDateData.capacity.evening.capacity
              }}
              headerClassName="bg-blue-100 hover:bg-blue-200 border-b-2 border-blue-300"
              className="!bg-transparent !border-transparent !shadow-none"
            >
              <div className="px-4 sm:px-6 py-4" style={{ backgroundColor: 'rgba(147, 197, 253, 0.8)' }}>
                {selectedDateData.eveningBookings.length > 0 ? (
                  selectedDateData.eveningBookings.map((booking, index) => (
                    <React.Fragment key={booking.id}>
                      {index > 0 && (
                        <div className="my-8 flex items-center">
                          <div 
                            className="w-full"
                            style={{
                              height: '3px',
                              background: 'linear-gradient(to right, transparent, rgba(59, 130, 246, 0.4) 5%, rgba(59, 130, 246, 0.8) 20%, rgba(59, 130, 246, 1) 50%, rgba(59, 130, 246, 0.8) 80%, rgba(59, 130, 246, 0.4) 95%, transparent)',
                              borderRadius: '2px',
                              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                            }}
                          ></div>
                        </div>
                      )}
                      <div
                        className="bg-white/98 backdrop-blur-sm p-5 rounded-modern relative"
                        style={{
                          border: '3px solid rgba(255, 255, 255, 0.9)',
                          boxShadow: '0 0 0 1px rgba(255, 255, 255, 1), 0 0 0 2px rgba(255, 255, 255, 0.7), 0 0 0 3px rgba(255, 255, 255, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(0, 0, 0, 0.08)',
                          transform: 'translateY(-2px)',
                        }}
                      >
                      {/* Nome cliente */}
                      <div className="mb-4">
                        <h4 className="font-bold text-xl text-gray-900">
                          {booking.client_name}
                        </h4>
                      </div>

                      {/* Two-column layout */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">

                          {/* Email */}
                          <div className="flex items-center gap-10">
                            <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Email:</span>
                              <span className="text-gray-700 truncate font-medium">{booking.client_email}</span>
                            </div>
                          </div>

                          {/* Phone */}
                          {booking.client_phone && (
                            <div className="flex items-center gap-10">
                              <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Telefono:</span>
                                <span className="text-gray-700 font-medium">{booking.client_phone}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {/* Time */}
                          {(booking.desired_time || booking.confirmed_start) && (
                            <div className="flex items-center gap-10">
                              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Orario:</span>
                                <span className="text-gray-700 font-semibold">
                                  {getAccurateTime(booking)} - {booking.confirmed_end && extractTimeFromISO(booking.confirmed_end)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Event Type */}
                          <div className="flex items-center gap-10">
                            <UtensilsCrossed className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Evento:</span>
                              <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">{booking.event_type?.replace(/_/g, ' ') || 'N/A'}</span>
                            </div>
                          </div>

                          {/* Guest Count */}
                          <div className="flex items-center gap-10">
                            <Users className="w-5 h-5 text-blue-700 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Ospiti:</span>
                              <span className="font-bold text-blue-800">{booking.num_guests}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Menu (se presente) */}
                      {booking.menu && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 font-semibold mb-1">Menù:</p>
                          <p className="text-sm text-gray-700 line-clamp-3">{booking.menu}</p>
                        </div>
                      )}

                      {/* Note speciali (se presenti) */}
                      {booking.special_requests && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 font-semibold mb-1">Note speciali:</p>
                          <p className="text-sm text-gray-700 italic line-clamp-2">{booking.special_requests}</p>
                        </div>
                      )}
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                      <Moon className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 italic">Nessuna prenotazione per questa fascia oraria</p>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          </div>
        </div>


      </div>

      {/* Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedBooking(null)
          }}
          booking={selectedBooking}
        />
      )}
    </>
  )
}

