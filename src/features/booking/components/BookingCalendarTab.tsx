import React from 'react'
import { useAcceptedBookings } from '../hooks/useBookingQueries'
import { BookingCalendar } from './BookingCalendar'

export const BookingCalendarTab: React.FC = () => {
  const { data: acceptedBookings, isLoading, error } = useAcceptedBookings()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-al-ritrovo-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento calendario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Errore nel caricamento del calendario</p>
        <p className="text-red-600 text-sm mt-2">{String(error)}</p>
      </div>
    )
  }

  if (!acceptedBookings || acceptedBookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Nessuna prenotazione nel calendario
        </h3>
        <p className="text-gray-500">
          Le prenotazioni accettate appariranno qui nel calendario.
        </p>
      </div>
    )
  }

  return <BookingCalendar bookings={acceptedBookings} />
}

