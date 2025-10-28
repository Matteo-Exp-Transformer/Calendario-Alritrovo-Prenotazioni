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
      if (updatedBooking) {
        setSelectedBooking(updatedBooking)
      }
    }
  }, [bookings])

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
          <div className="flex items-center gap-1.5 font-semibold truncate">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{booking.client_name}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 opacity-90 text-[10px]">
            <span>{booking.num_guests} ospiti</span>
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
          <div style={{ border: '5px solid #10B981', borderRadius: '12px', boxShadow: '0 8px 16px -2px rgba(16, 185, 129, 0.4), 0 4px 8px -2px rgba(16, 185, 129, 0.3)', backgroundColor: '#F0FDF4' }} className="overflow-hidden transition-all duration-200 hover:shadow-2xl">
            <CollapsibleCard
              title="Mattina"
              subtitle="10:00 - 14:30"
              icon={Sunrise}
              defaultExpanded={true}
              className="!border-0 !rounded-none !shadow-none !bg-transparent"
              headerClassName="!bg-green-100 hover:!bg-green-200 transition-colors"
              actions={
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-md">
                <div className="text-center">
                  <div className="text-lg font-extrabold text-white leading-none">
                    {selectedDateData.capacity.morning.available}
                  </div>
                  <div className="text-[9px] font-medium text-green-100 leading-tight">
                    /{selectedDateData.capacity.morning.capacity}
                  </div>
                </div>
              </div>
            }
          >
              <div className="px-4 sm:px-6 py-4 space-y-4">
                {selectedDateData.morningBookings.length > 0 ? (
                  selectedDateData.morningBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="group/card bg-white/95 backdrop-blur-sm p-5 rounded-xl border-2 border-l-6 border-green-500 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                    >
                      {/* Header con Avatar e Nome */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover/card:scale-110 transition-transform flex-shrink-0">
                          {booking.client_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg text-gray-900 group-hover/card:text-green-700 transition-colors truncate">
                            {booking.client_name}
                          </h4>
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-0.5">
                            ID: {booking.id.slice(0, 8)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                          <Users className="w-4 h-4 text-green-700" />
                          <span className="font-bold text-green-800">{booking.num_guests}</span>
                        </div>
                      </div>

                      {/* Grid con dati - 2 colonne su desktop */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {/* Email */}
                        <div className="flex items-center gap-2.5 bg-gray-50/80 rounded-lg px-3 py-2">
                          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700 truncate font-medium">{booking.client_email}</span>
                        </div>

                        {/* Telefono */}
                        {booking.client_phone && (
                          <div className="flex items-center gap-2.5 bg-gray-50/80 rounded-lg px-3 py-2">
                            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-700 font-medium">{booking.client_phone}</span>
                          </div>
                        )}

                        {/* Orario */}
                        {booking.confirmed_start && (
                          <div className="flex items-center gap-2.5 bg-green-50/80 rounded-lg px-3 py-2">
                            <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700 font-semibold">
                              {format(new Date(booking.confirmed_start), 'HH:mm')} - {booking.confirmed_end && format(new Date(booking.confirmed_end), 'HH:mm')}
                            </span>
                          </div>
                        )}

                        {/* Tipo Evento */}
                        <div className="flex items-center gap-2.5 bg-green-50/80 rounded-lg px-3 py-2">
                          <UtensilsCrossed className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">{booking.event_type.replace(/_/g, ' ')}</span>
                        </div>
                      </div>

                      {/* Note speciali (se presenti) */}
                      {booking.special_requests && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
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
          <div style={{ border: '5px solid #FDE047', borderRadius: '12px', boxShadow: '0 8px 16px -2px rgba(253, 224, 71, 0.4), 0 4px 8px -2px rgba(253, 224, 71, 0.3)', backgroundColor: '#FEFCE8' }} className="overflow-hidden transition-all duration-200 hover:shadow-2xl">
            <CollapsibleCard
            title="Pomeriggio"
            subtitle="14:31 - 18:30"
            icon={Sun}
            defaultExpanded={true}
            className="!border-0 !rounded-none !shadow-none !bg-transparent"
            headerClassName="!bg-yellow-100 hover:!bg-yellow-200 transition-colors"
            actions={
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-md">
                <div className="text-center">
                  <div className="text-lg font-extrabold text-gray-900 leading-none">
                    {selectedDateData.capacity.afternoon.available}
                  </div>
                  <div className="text-[9px] font-medium text-yellow-800 leading-tight">
                    /{selectedDateData.capacity.afternoon.capacity}
                  </div>
                </div>
              </div>
            }
          >
              <div className="px-4 sm:px-6 py-4 space-y-4">
                {selectedDateData.afternoonBookings.length > 0 ? (
                  selectedDateData.afternoonBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="group/card bg-white/95 backdrop-blur-sm p-5 rounded-xl border-2 border-l-6 border-yellow-400 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-gray-900 font-bold text-lg shadow-lg group-hover/card:scale-110 transition-transform flex-shrink-0">
                          {booking.client_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg text-gray-900 group-hover/card:text-yellow-700 transition-colors truncate">
                            {booking.client_name}
                          </h4>
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-0.5">
                            ID: {booking.id.slice(0, 8)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 rounded-full">
                          <Users className="w-4 h-4 text-yellow-700" />
                          <span className="font-bold text-yellow-800">{booking.num_guests}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2.5 bg-gray-50/80 rounded-lg px-3 py-2">
                          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700 truncate font-medium">{booking.client_email}</span>
                        </div>
                        {booking.client_phone && (
                          <div className="flex items-center gap-2.5 bg-gray-50/80 rounded-lg px-3 py-2">
                            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-700 font-medium">{booking.client_phone}</span>
                          </div>
                        )}
                        {booking.confirmed_start && (
                          <div className="flex items-center gap-2.5 bg-yellow-50/80 rounded-lg px-3 py-2">
                            <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                            <span className="text-gray-700 font-semibold">
                              {format(new Date(booking.confirmed_start), 'HH:mm')} - {booking.confirmed_end && format(new Date(booking.confirmed_end), 'HH:mm')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5 bg-yellow-50/80 rounded-lg px-3 py-2">
                          <UtensilsCrossed className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                          <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">{booking.event_type.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                      {booking.special_requests && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
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
          <div style={{ border: '5px solid #93C5FD', borderRadius: '12px', boxShadow: '0 8px 16px -2px rgba(147, 197, 253, 0.4), 0 4px 8px -2px rgba(147, 197, 253, 0.3)', backgroundColor: '#EFF6FF' }} className="overflow-hidden transition-all duration-200 hover:shadow-2xl">
            <CollapsibleCard
            title="Sera"
            subtitle="18:31 - 23:30"
            icon={Moon}
            defaultExpanded={true}
            className="!border-0 !rounded-none !shadow-none !bg-transparent"
            headerClassName="!bg-blue-100 hover:!bg-blue-200 transition-colors"
            actions={
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 shadow-md">
                <div className="text-center">
                  <div className="text-lg font-extrabold text-white leading-none">
                    {selectedDateData.capacity.evening.available}
                  </div>
                  <div className="text-[9px] font-medium text-blue-100 leading-tight">
                    /{selectedDateData.capacity.evening.capacity}
                  </div>
                </div>
              </div>
            }
          >
              <div className="px-4 sm:px-6 py-4 space-y-4">
                {selectedDateData.eveningBookings.length > 0 ? (
                  selectedDateData.eveningBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="group/card bg-white/95 backdrop-blur-sm p-5 rounded-xl border-2 border-l-6 border-blue-400 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover/card:scale-110 transition-transform flex-shrink-0">
                          {booking.client_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg text-gray-900 group-hover/card:text-blue-700 transition-colors truncate">
                            {booking.client_name}
                          </h4>
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-0.5">
                            ID: {booking.id.slice(0, 8)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full">
                          <Users className="w-4 h-4 text-blue-700" />
                          <span className="font-bold text-blue-800">{booking.num_guests}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2.5 bg-gray-50/80 rounded-lg px-3 py-2">
                          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700 truncate font-medium">{booking.client_email}</span>
                        </div>
                        {booking.client_phone && (
                          <div className="flex items-center gap-2.5 bg-gray-50/80 rounded-lg px-3 py-2">
                            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-700 font-medium">{booking.client_phone}</span>
                          </div>
                        )}
                        {booking.confirmed_start && (
                          <div className="flex items-center gap-2.5 bg-blue-50/80 rounded-lg px-3 py-2">
                            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-700 font-semibold">
                              {format(new Date(booking.confirmed_start), 'HH:mm')} - {booking.confirmed_end && format(new Date(booking.confirmed_end), 'HH:mm')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5 bg-blue-50/80 rounded-lg px-3 py-2">
                          <UtensilsCrossed className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">{booking.event_type.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                      {booking.special_requests && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
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

