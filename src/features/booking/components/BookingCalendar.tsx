import React, { useState, useEffect, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { Calendar, Users } from 'lucide-react'
import { format } from 'date-fns'
import type { BookingRequest } from '@/types/booking'
import { transformBookingsToCalendarEvents } from '../utils/bookingEventTransform'
import { BookingDetailsModal } from './BookingDetailsModal'
import { calculateDailyCapacity, getSlotsOccupiedByBooking } from '../utils/capacityCalculator'

interface BookingCalendarProps {
  bookings: BookingRequest[]
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings }) => {
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Aggiorna il selectedBooking quando i bookings cambiano (dopo modifica)
  useEffect(() => {
    if (selectedBooking) {
      const updatedBooking = bookings.find(b => b.id === selectedBooking.id)
      if (updatedBooking) {
        setSelectedBooking(updatedBooking)
      }
    }
  }, [bookings])

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
    const date = clickInfo.dateStr
    setSelectedDate(date)
  }

  // Get bookings and capacity for selected date
  const selectedDateData = useMemo(() => {
    if (!selectedDate) return null

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
    // Highlight today
    dayCellDidMount: (arg: any) => {
      const today = new Date()
      const cellDate = arg.date
      if (cellDate.toDateString() === today.toDateString()) {
        arg.el.style.backgroundColor = '#fef3c7'
        arg.el.style.border = '2px solid #f59e0b'
        arg.el.style.borderRadius = '8px'
        arg.el.style.fontWeight = 'bold'
      }
      // Highlight selected date
      if (selectedDate) {
        const cellDateStr = cellDate.toISOString().split('T')[0]
        if (cellDateStr === selectedDate) {
          arg.el.style.backgroundColor = '#dbeafe'
          arg.el.style.border = '2px solid #3b82f6'
          arg.el.style.borderRadius = '8px'
          arg.el.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)'
        }
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

          <FullCalendar {...config} events={events} />
        </div>

        {/* Sezione Disponibilità */}
        {selectedDateData && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-warm-beige">
            <h3 className="text-lg font-serif font-semibold text-warm-wood mb-4">
              Disponibilità - {format(new Date(selectedDateData.date), 'dd MMMM yyyy')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mattina */}
              <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-green-700">🌅 Mattina (10:00 - 14:30)</h4>
                  <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-lg text-sm">
                    {selectedDateData.capacity.morning.available}/{selectedDateData.capacity.morning.capacity}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedDateData.morningBookings.length > 0 ? (
                    selectedDateData.morningBookings.map((booking) => (
                      <div key={booking.id} className="bg-white p-2 rounded border border-green-200">
                        <p className="font-semibold text-sm">{booking.client_name}</p>
                        <p className="text-xs text-gray-600">{booking.num_guests} ospiti</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Nessuna prenotazione</p>
                  )}
                </div>
              </div>

              {/* Pomeriggio */}
              <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-blue-700">☀️ Pomeriggio (14:31 - 18:30)</h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm">
                    {selectedDateData.capacity.afternoon.available}/{selectedDateData.capacity.afternoon.capacity}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedDateData.afternoonBookings.length > 0 ? (
                    selectedDateData.afternoonBookings.map((booking) => (
                      <div key={booking.id} className="bg-white p-2 rounded border border-blue-200">
                        <p className="font-semibold text-sm">{booking.client_name}</p>
                        <p className="text-xs text-gray-600">{booking.num_guests} ospiti</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Nessuna prenotazione</p>
                  )}
                </div>
              </div>

              {/* Sera */}
              <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-purple-700">🌙 Sera (18:31 - 23:30)</h4>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold rounded-lg text-sm">
                    {selectedDateData.capacity.evening.available}/{selectedDateData.capacity.evening.capacity}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedDateData.eveningBookings.length > 0 ? (
                    selectedDateData.eveningBookings.map((booking) => (
                      <div key={booking.id} className="bg-white p-2 rounded border border-purple-200">
                        <p className="font-semibold text-sm">{booking.client_name}</p>
                        <p className="text-xs text-gray-600">{booking.num_guests} ospiti</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Nessuna prenotazione</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legenda con Nuova Palette */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-warm-beige">
          <h3 className="text-lg font-serif font-semibold text-warm-wood mb-4">Legenda Tipologie</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-warm-cream/30 transition-colors">
              <div className="w-5 h-5 rounded-md bg-[#8B4513] shadow-sm"></div>
              <span className="text-sm font-medium text-gray-700">Cena</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-warm-cream/30 transition-colors">
              <div className="w-5 h-5 rounded-md bg-[#DAA520] shadow-sm"></div>
              <span className="text-sm font-medium text-gray-700">Aperitivo</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-warm-cream/30 transition-colors">
              <div className="w-5 h-5 rounded-md bg-[#E07041] shadow-sm"></div>
              <span className="text-sm font-medium text-gray-700">Evento</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-warm-cream/30 transition-colors">
              <div className="w-5 h-5 rounded-md bg-[#6B8E23] shadow-sm"></div>
              <span className="text-sm font-medium text-gray-700">Laurea</span>
            </div>
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

