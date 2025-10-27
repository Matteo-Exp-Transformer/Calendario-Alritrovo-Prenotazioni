import React from 'react'

export const BookingRequestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-al-ritrovo-primary mb-2">
            Richiesta Prenotazione
          </h1>
          <p className="text-gray-600 mb-6">
            Al Ritrovo - Bologna, Italia
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Form di prenotazione in arrivo nella Fase 4...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
