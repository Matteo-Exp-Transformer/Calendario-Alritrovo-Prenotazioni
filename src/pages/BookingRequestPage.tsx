import React, { useEffect } from 'react'
import { BookingRequestForm } from '@/features/booking/components/BookingRequestForm'
import { UtensilsCrossed, MapPin, Clock, Phone, Mail } from 'lucide-react'
import bgImage from '@/assets/IMG20241127235924.jpg'

export const BookingRequestPage: React.FC = () => {
  useEffect(() => {
    document.documentElement.style.backgroundImage = `url("${bgImage}")`;
    document.documentElement.style.backgroundSize = 'cover';
    document.documentElement.style.backgroundPosition = 'center';
    document.documentElement.style.backgroundRepeat = 'no-repeat';
    document.documentElement.style.backgroundAttachment = 'fixed';
    
    return () => {
      document.documentElement.style.backgroundImage = '';
      document.documentElement.style.backgroundSize = '';
      document.documentElement.style.backgroundPosition = '';
      document.documentElement.style.backgroundRepeat = '';
      document.documentElement.style.backgroundAttachment = '';
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Overlay scuro per leggibilità */}
      <div 
        className="fixed inset-0 z-0" 
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 md:p-8">
        <div className="w-full max-w-6xl">
          {/* Hero Section con Glassmorphism */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-warm-cream shadow-2xl animate-slide-in-up">
              <UtensilsCrossed className="w-10 h-10 text-warm-wood" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 text-warm-cream drop-shadow-lg">
              Prenota il Tuo Tavolo
            </h1>
            <p className="text-2xl md:text-3xl font-serif font-semibold mb-3 text-gold-warm">
              Al Ritrovo
            </p>
            <div className="flex items-center justify-center gap-2 mb-6 text-warm-beige">
              <MapPin className="w-5 h-5" />
              <span className="text-base md:text-lg">Bologna, Italia</span>
            </div>
          </div>

          {/* Form Card con Glassmorphism e Layout 2 Colonne */}
          <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-8 md:p-12 mb-8 animate-slide-in-up">
            <BookingRequestForm />
          </div>

          {/* Info Box Ridisegnata */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 animate-fade-in">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-terracotta to-warm-orange shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-serif font-semibold mb-4 text-warm-wood">
                  Orari e Contatti
                </h3>
                <p className="text-base md:text-lg mb-6 text-gray-700">
                  Per informazioni urgenti, chiamaci direttamente:
                </p>
                <div className="space-y-3 text-base md:text-lg text-warm-wood-dark">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-warm-orange" />
                    <span className="font-medium">info@alritrovo.it</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-warm-orange" />
                    <span className="font-medium">+39 051 123 4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-warm-orange" />
                    <span className="font-medium">Martedì - Domenica, 19:00 - 24:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
