import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { Calendar, Users } from 'lucide-react'
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
    const booking = clickInfo.event.extendedProps as BookingRequest
    
    if (!booking) {
      return
    }
    
    setSelectedBooking(booking)
    setIsModalOpen(true)
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
    eventCursor: 'pointer',
    eventTimeFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
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

