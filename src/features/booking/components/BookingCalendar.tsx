import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { Calendar } from 'lucide-react'
import type { BookingRequest } from '@/types/booking'
import { transformBookingsToCalendarEvents } from '../utils/bookingEventTransform'
import { BookingDetailsModal } from './BookingDetailsModal'

interface BookingCalendarProps {
  bookings: BookingRequest[]
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings }) => {
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const events = transformBookingsToCalendarEvents(bookings)

  const handleEventClick = (clickInfo: any) => {
    console.log('🔵 BookingCalendar: Event clicked!', clickInfo)
    console.log('🔵 BookingCalendar: clickInfo.event:', clickInfo.event)
    console.log('🔵 BookingCalendar: clickInfo.event.extendedProps:', clickInfo.event.extendedProps)
    
    const booking = clickInfo.event.extendedProps as BookingRequest
    
    if (!booking) {
      console.error('❌ BookingCalendar: No booking found in extendedProps!')
      return
    }
    
    console.log('✅ BookingCalendar: Setting booking:', booking)
    setSelectedBooking(booking)
    setIsModalOpen(true)
    console.log('✅ BookingCalendar: isModalOpen set to true')
  }

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
    eventDisplay: 'block',
    eventTextColor: '#fff',
    eventTimeFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
    },
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-6 w-6 text-al-ritrovo-primary" />
          <h2 className="text-2xl font-bold text-gray-900">
            Calendario Prenotazioni
          </h2>
          <span className="ml-auto px-3 py-1 bg-status-accepted/10 text-status-accepted rounded-full text-sm font-medium">
            {bookings.length} prenotazioni
          </span>
        </div>

        <FullCalendar {...config} events={events} />
      </div>

      {/* Legenda */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#8B0000]"></div>
            <span className="text-sm text-gray-700">🍽️ Cena</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#DAA520]"></div>
            <span className="text-sm text-gray-700">🥂 Aperitivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#9370DB]"></div>
            <span className="text-sm text-gray-700">🎉 Evento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#20B2AA]"></div>
            <span className="text-sm text-gray-700">🎓 Laurea</span>
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
    </div>
  )
}

