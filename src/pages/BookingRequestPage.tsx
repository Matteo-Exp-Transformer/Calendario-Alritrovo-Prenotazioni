import React from 'react'
import { BookingRequestForm } from '@/features/booking/components/BookingRequestForm'

export const BookingRequestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-al-ritrovo-primary mb-2">
              Richiesta Prenotazione
            </h1>
            <p className="text-gray-600 mb-4">
              Al Ritrovo - Bologna, Italia
            </p>
            <p className="text-sm text-gray-500">
              Compila il modulo per richiedere una prenotazione. Ti contatteremo al più presto!
            </p>
          </div>

          {/* Form */}
          <BookingRequestForm />
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📞 Contatti
          </h3>
          <p className="text-sm text-blue-800 mb-2">
            Per informazioni urgenti, chiamaci direttamente.
          </p>
          <p className="text-sm text-blue-700">
            • Email: info@alritrovo.it<br />
            • Telefono: +39 051 123 4567<br />
            • Orari: Mar-Dom 19:00 - 24:00
          </p>
        </div>
      </div>
    </div>
  )
}
