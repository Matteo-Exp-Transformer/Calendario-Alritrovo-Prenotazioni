import React from 'react'
import { BookingRequestForm } from '@/features/booking/components/BookingRequestForm'
import { UtensilsCrossed, MapPin, Clock } from 'lucide-react'

export const BookingRequestPage: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D2B48C', backgroundImage: 'linear-gradient(to bottom, #E8D5B7, #C9A87A)' }}>
      <div className="container mx-auto px-4 md:px-8 max-w-xl py-12 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-14 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-full animate-slide-in-up" style={{ backgroundColor: '#8B6914', boxShadow: '0 10px 25px -5px rgba(139, 105, 20, 0.3)' }}>
            <UtensilsCrossed className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#654321' }}>
            PRENOTA IL TUO TAVOLO
          </h1>
          <p className="text-xl md:text-2xl font-semibold mb-3" style={{ color: '#654321' }}>
            Al Ritrovo
          </p>
          <div className="flex items-center justify-center gap-2 mb-8" style={{ color: '#8B6914' }}>
            <MapPin className="w-5 h-5" />
            <span className="text-base">Bologna, Italia</span>
          </div>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: '#654321' }}>
            Compila il form e ti contatteremo al più presto per confermare la disponibilità.
          </p>
        </div>

        {/* Form Card */}
        <div className="mb-8 animate-slide-in-up" style={{ borderRadius: '15px' }}>
          <div className="p-6 md:p-10" style={{ backgroundColor: 'transparent', borderRadius: '15px' }}>
            <BookingRequestForm />
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-xl p-6 md:p-8 animate-fade-in" style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8B6914' }}>
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-semibold mb-3" style={{ color: '#654321' }}>
                Orari e Contatti
              </h3>
              <p className="text-sm md:text-base mb-4" style={{ color: '#8B6914' }}>
                Per informazioni urgenti, chiamaci direttamente:
              </p>
              <div className="space-y-2 text-sm md:text-base" style={{ color: '#654321' }}>
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
