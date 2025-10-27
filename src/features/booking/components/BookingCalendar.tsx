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
    const date = clickInfo.dateStr
    console.log('Date clicked:', date, 'clickInfo:', clickInfo)
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
      const today = new Date()
      // Use FullCalendar's dateStr to avoid timezone issues
      const cellDateStr = arg.dateStr || arg.date.toISOString().split('T')[0]
      const cellDate = new Date(arg.date)
      const isToday = cellDate.toDateString() === today.toDateString()
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
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-warm-beige">
          <h3 className="text-lg font-serif font-semibold text-warm-wood mb-4">
            Disponibilità - {format(new Date(selectedDateData.date), 'dd MMMM yyyy')}
          </h3>
          
          <div className="space-y-6">
            {/* Mattina */}
            <div className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white rounded-r-lg p-5 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-green-200">
                <h4 className="text-xl font-bold text-green-700 flex items-center gap-2">
                  <span className="text-2xl">🌅</span>
                  <span>Mattina</span>
                  <span className="text-base font-normal text-green-600">(10:00 - 14:30)</span>
                </h4>
                <div className="px-4 py-2 bg-green-100 border-2 border-green-300 rounded-lg">
                  <span className="text-lg font-extrabold text-green-700">
                    {selectedDateData.capacity.morning.available}/{selectedDateData.capacity.morning.capacity} disponibili
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {selectedDateData.morningBookings.length > 0 ? (
                  selectedDateData.morningBookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-3 rounded-lg border-l-4 border-green-400 shadow-sm hover:shadow-md transition-shadow">
                      <p className="font-bold text-base text-gray-800">{booking.client_name}</p>
                      <p className="text-sm text-gray-600 mt-1">{booking.num_guests} ospiti</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-2">Nessuna prenotazione</p>
                )}
              </div>
            </div>

            {/* Pomeriggio */}
            <div className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white rounded-r-lg p-5 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-200">
                <h4 className="text-xl font-bold text-blue-700 flex items-center gap-2">
                  <span className="text-2xl">☀️</span>
                  <span>Pomeriggio</span>
                  <span className="text-base font-normal text-blue-600">(14:31 - 18:30)</span>
                </h4>
                <div className="px-4 py-2 bg-blue-100 border-2 border-blue-300 rounded-lg">
                  <span className="text-lg font-extrabold text-blue-700">
                    {selectedDateData.capacity.afternoon.available}/{selectedDateData.capacity.afternoon.capacity} disponibili
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {selectedDateData.afternoonBookings.length > 0 ? (
                  selectedDateData.afternoonBookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-3 rounded-lg border-l-4 border-blue-400 shadow-sm hover:shadow-md transition-shadow">
                      <p className="font-bold text-base text-gray-800">{booking.client_name}</p>
                      <p className="text-sm text-gray-600 mt-1">{booking.num_guests} ospiti</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-2">Nessuna prenotazione</p>
                )}
              </div>
            </div>

            {/* Sera */}
            <div className="border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-white rounded-r-lg p-5 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-purple-200">
                <h4 className="text-xl font-bold text-purple-700 flex items-center gap-2">
                  <span className="text-2xl">🌙</span>
                  <span>Sera</span>
                  <span className="text-base font-normal text-purple-600">(18:31 - 23:30)</span>
                </h4>
                <div className="px-4 py-2 bg-purple-100 border-2 border-purple-300 rounded-lg">
                  <span className="text-lg font-extrabold text-purple-700">
                    {selectedDateData.capacity.evening.available}/{selectedDateData.capacity.evening.capacity} disponibili
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {selectedDateData.eveningBookings.length > 0 ? (
                  selectedDateData.eveningBookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-3 rounded-lg border-l-4 border-purple-400 shadow-sm hover:shadow-md transition-shadow">
                      <p className="font-bold text-base text-gray-800">{booking.client_name}</p>
                      <p className="text-sm text-gray-600 mt-1">{booking.num_guests} ospiti</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-2">Nessuna prenotazione</p>
                )}
              </div>
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

