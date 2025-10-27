import React from 'react'
import { BookingRequestForm } from '@/features/booking/components/BookingRequestForm'
import { UtensilsCrossed, MapPin, Clock } from 'lucide-react'

export const BookingRequestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-al-ritrovo-primary rounded-xl mb-6 shadow-xl shadow-al-ritrovo-primary/30 animate-slide-in-up">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            Prenota il tuo tavolo
          </h1>
          <p className="text-xl text-gray-500 font-medium mb-2">
            Al Ritrovo
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Bologna, Italia</span>
          </div>
          <p className="text-gray-600 max-w-md mx-auto">
            Compila il form e ti contatteremo al più presto per confermare la disponibilità.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10 mb-8 border border-gray-200 rounded-2xl animate-slide-in-up">
          <BookingRequestForm />
        </div>

        {/* Info Box */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl animate-fade-in">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-al-ritrovo-primary/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-al-ritrovo-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Orari e Contatti
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Per informazioni urgenti, chiamaci direttamente:
              </p>
              <div className="space-y-1.5 text-sm text-gray-700">
                <p className="font-medium">📧 Email: info@alritrovo.it</p>
                <p className="font-medium">📞 Telefono: +39 051 123 4567</p>
                <p className="font-medium">🕐 Orari: Martedì - Domenica, 19:00 - 24:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
