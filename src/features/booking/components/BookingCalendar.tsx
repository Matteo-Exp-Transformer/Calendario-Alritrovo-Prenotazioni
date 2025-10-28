import React, { useState, useEffect, useMemo } from 'react'
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

// Helper to extract time from ISO string without timezone conversion
const extractTimeFromISO = (isoString: string): string => {
  const match = isoString.match(/T(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : ''
}

interface BookingCalendarProps {
  bookings: BookingRequest[]
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings }) => {
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Set today's date as default
    return new Date().toISOString().split('T')[0]
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
      const bookingDate = new Date(booking.confirmed_start).toISOString().split('T')[0]
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
      const formatTime = (dateStr?: string) => {
        if (!dateStr) return ''
        try {
          return format(new Date(dateStr), 'HH:mm')
        } catch {
          return ''
        }
      }

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
            {booking.confirmed_start && (
              <>
                <span>•</span>
                <span>{formatTime(booking.confirmed_start)}</span>
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

          <FullCalendar key={calendarKey} {...config} events={events} />
        </div>

        {/* Sezione Disponibilità */}
        <div className="space-y-6">
          {/* Header con data */}
          <div className="text-center">
            <h3 className="text-2xl font-serif font-bold text-warm-wood mb-2">
              Disponibilità
            </h3>
            <p className="text-lg text-gray-600">
              {format(new Date(selectedDateData.date), 'EEEE, dd MMMM yyyy', { locale: it })}
            </p>
          </div>

          {/* Mattina CollapsibleCard */}
          <div style={{ border: '5px solid #10B981', borderRadius: '12px', boxShadow: '0 8px 16px -2px rgba(16, 185, 129, 0.4), 0 4px 8px -2px rgba(16, 185, 129, 0.3)', backgroundColor: '#86EFAC' }} className="overflow-hidden transition-all duration-200 hover:shadow-2xl">
            <CollapsibleCard
              title="Mattina"
              subtitle="10:00 - 14:30"
              icon={Sunrise}
              defaultExpanded={true}
              collapseDisabled={false}
              className="!border-0 !rounded-none !shadow-none !bg-transparent"
              headerClassName="!bg-green-100 hover:!bg-green-200 transition-colors"
              actions={
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex">
                  <div className="rounded-full bg-transparent" style={{ padding: '12px', boxShadow: '0 0 0 3px #dc2626' }}>
                    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl w-48 h-48">
                      <div className="text-6xl font-extrabold text-white leading-none mb-2">
                        {selectedDateData.capacity.morning.available}
                      </div>
                      <div className="text-sm font-semibold text-green-100 uppercase tracking-wide">
                        Posti liberi
                      </div>
                      <div className="text-2xl font-bold text-white mt-3 opacity-75">
                        {selectedDateData.capacity.morning.capacity} totali
                      </div>
                    </div>
                  </div>
                </div>
              }
          >
              <div className="px-4 sm:px-6 py-4 space-y-10 bg-gradient-to-b from-white/40 via-white/20 to-transparent">
                {selectedDateData.morningBookings.length > 0 ? (
                  selectedDateData.morningBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white/98 backdrop-blur-sm p-5 rounded-3xl relative"
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
                          {booking.confirmed_start && (
                            <div className="flex items-center gap-10">
                              <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Orario:</span>
                                <span className="text-gray-700 font-semibold">
                                  {extractTimeFromISO(booking.confirmed_start)} - {booking.confirmed_end && extractTimeFromISO(booking.confirmed_end)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Event Type */}
                          <div className="flex items-center gap-10">
                            <UtensilsCrossed className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Evento:</span>
                              <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">{booking.event_type.replace(/_/g, ' ')}</span>
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
          <div style={{ border: '5px solid #FDE047', borderRadius: '12px', boxShadow: '0 8px 16px -2px rgba(253, 224, 71, 0.4), 0 4px 8px -2px rgba(253, 224, 71, 0.3)', backgroundColor: '#FEF08A' }} className="overflow-hidden transition-all duration-200 hover:shadow-2xl">
            <CollapsibleCard
            title="Pomeriggio"
            subtitle="14:31 - 18:30"
            icon={Sun}
            defaultExpanded={true}
            collapseDisabled={true}
            className="!border-0 !rounded-none !shadow-none !bg-transparent"
            headerClassName="!bg-yellow-100 hover:!bg-yellow-200 transition-colors"
            actions={
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex">
                <div className="rounded-full bg-transparent" style={{ padding: '12px', boxShadow: '0 0 0 3px #dc2626' }}>
                  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full shadow-2xl w-48 h-48">
                    <div className="text-6xl font-extrabold text-gray-900 leading-none mb-2">
                      {selectedDateData.capacity.afternoon.available}
                    </div>
                    <div className="text-sm font-semibold text-yellow-900 uppercase tracking-wide opacity-90">
                      Posti liberi
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-3 opacity-75">
                      {selectedDateData.capacity.afternoon.capacity} totali
                    </div>
                  </div>
                </div>
              </div>
            }
          >
              <div className="px-4 sm:px-6 py-4 space-y-10 bg-gradient-to-b from-white/40 via-white/20 to-transparent">
                {selectedDateData.afternoonBookings.length > 0 ? (
                  selectedDateData.afternoonBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white/98 backdrop-blur-sm p-5 rounded-3xl relative"
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
                      <div className="grid grid-cols-2 gap-4">
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
                          {booking.confirmed_start && (
                            <div className="flex items-center gap-10">
                              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Orario:</span>
                                <span className="text-gray-700 font-semibold">
                                  {extractTimeFromISO(booking.confirmed_start)} - {booking.confirmed_end && extractTimeFromISO(booking.confirmed_end)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Event Type */}
                          <div className="flex items-center gap-10">
                            <UtensilsCrossed className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Evento:</span>
                              <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">{booking.event_type.replace(/_/g, ' ')}</span>
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
          <div style={{ border: '5px solid #93C5FD', borderRadius: '12px', boxShadow: '0 8px 16px -2px rgba(147, 197, 253, 0.4), 0 4px 8px -2px rgba(147, 197, 253, 0.3)', backgroundColor: '#A5B4FC' }} className="overflow-hidden transition-all duration-200 hover:shadow-2xl">
            <CollapsibleCard
            title="Sera"
            subtitle="18:31 - 23:30"
            icon={Moon}
            defaultExpanded={true}
            collapseDisabled={true}
            className="!border-0 !rounded-none !shadow-none !bg-transparent"
            headerClassName="!bg-blue-100 hover:!bg-blue-200 transition-colors"
            actions={
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex">
                <div className="rounded-full bg-transparent" style={{ padding: '12px', boxShadow: '0 0 0 3px #dc2626' }}>
                  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-blue-500 rounded-full shadow-2xl w-48 h-48">
                    <div className="text-6xl font-extrabold text-white leading-none mb-2">
                      {selectedDateData.capacity.evening.available}
                    </div>
                    <div className="text-sm font-semibold text-blue-100 uppercase tracking-wide">
                      Posti liberi
                    </div>
                    <div className="text-2xl font-bold text-white mt-3 opacity-75">
                      {selectedDateData.capacity.evening.capacity} totali
                    </div>
                  </div>
                </div>
              </div>
            }
          >
              <div className="px-4 sm:px-6 py-4 space-y-10 bg-gradient-to-b from-white/40 via-white/20 to-transparent">
                {selectedDateData.eveningBookings.length > 0 ? (
                  selectedDateData.eveningBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white/98 backdrop-blur-sm p-5 rounded-3xl relative"
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
                          {booking.confirmed_start && (
                            <div className="flex items-center gap-10">
                              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Orario:</span>
                                <span className="text-gray-700 font-semibold">
                                  {extractTimeFromISO(booking.confirmed_start)} - {booking.confirmed_end && extractTimeFromISO(booking.confirmed_end)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Event Type */}
                          <div className="flex items-center gap-10">
                            <UtensilsCrossed className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold min-w-[70px]">Evento:</span>
                              <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">{booking.event_type.replace(/_/g, ' ')}</span>
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

