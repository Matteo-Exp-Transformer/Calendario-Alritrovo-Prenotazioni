import React, { useEffect } from 'react'
import { BookingRequestForm } from '@/features/booking/components/BookingRequestForm'
import { UtensilsCrossed, MapPin, Clock, Phone, Mail } from 'lucide-react'
import bgImage from '@/assets/IMG20241127235924.jpg'
import mobileVintageBg from '@/assets/mobile-vintage-bg.png'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { formatHours, getDefaultBusinessHours } from '@/lib/businessHours'

export const BookingRequestPage: React.FC = () => {
  // Fetch business hours for display (fallback to defaults if unavailable)
  const { data: businessHours, isLoading } = useBusinessHours()
  const hours = businessHours || getDefaultBusinessHours()

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

  // Format day name for display
  const formatDayName = (day: string): string => {
    const dayMap: Record<string, string> = {
      monday: 'Lunedì',
      tuesday: 'Martedì',
      wednesday: 'Mercoledì',
      thursday: 'Giovedì',
      friday: 'Venerdì',
      saturday: 'Sabato',
      sunday: 'Domenica'
    }
    return dayMap[day] || day
  }

  // Group consecutive days with same hours
  const getGroupedHours = () => {
    const dayOrder: (keyof typeof hours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const groups: Array<{ days: string[], hours: string }> = []
    
    let currentGroup: { days: string[], hours: string } | null = null

    dayOrder.forEach((day) => {
      const dayHours = hours[day]
      const hoursStr = dayHours ? formatHours(dayHours) : 'Chiuso'
      
      if (!currentGroup || currentGroup.hours !== hoursStr) {
        if (currentGroup) {
          groups.push(currentGroup)
        }
        currentGroup = { days: [formatDayName(day)], hours: hoursStr }
      } else {
        currentGroup.days.push(formatDayName(day))
      }
    })
    
    if (currentGroup) {
      groups.push(currentGroup)
    }
    
    return groups
  }

  const groupedHours = getGroupedHours()

  return (
    <div className="min-h-screen relative overflow-hidden font-bold">
      {/* Overlay scuro per leggibilità */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}
      />

      {/* Immagine vintage in fondo - Solo Mobile */}
      <div
        className="fixed bottom-0 left-0 right-0 z-0 md:hidden"
        style={{
          backgroundImage: `url("${mobileVintageBg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '100vh',
          top: '100vh'
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
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 text-warm-cream drop-shadow-lg"
              style={{
                textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
              }}
            >
              Prenota il Tuo Tavolo
            </h1>
            <p
              className="text-2xl md:text-3xl font-serif font-semibold mb-3 text-gold-warm"
              style={{
                textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
              }}
            >
              Al Ritrovo
            </p>
            <div
              className="flex items-center justify-center gap-2 mb-6 text-warm-beige"
              style={{
                textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
              }}
            >
              <MapPin className="w-5 h-5" />
              <span className="text-base md:text-lg">Bologna, Italia</span>
            </div>
          </div>

          {/* Form Card con Glassmorphism e Layout 2 Colonne */}
          <div className="bg-white/30 md:bg-white/95 backdrop-blur-xl md:backdrop-blur-md shadow-2xl rounded-modern p-8 md:p-12 mb-8 animate-slide-in-up">
            <BookingRequestForm />
          </div>

          {/* Info Box Ridisegnata */}
          <div
            className="rounded-2xl shadow-xl p-6 md:p-8 animate-fade-in"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-start gap-4 md:gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-terracotta to-warm-orange shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3
                  className="text-xl md:text-2xl font-serif font-semibold mb-4 text-warm-wood"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(6px)',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    display: 'inline-block'
                  }}
                >
                  Orari e Contatti
                </h3>
                <p className="text-base md:text-lg mb-6 text-gray-700">
                  Per informazioni urgenti, chiamaci direttamente:
                </p>
                <div className="space-y-3 text-base md:text-lg text-warm-wood-dark">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-warm-orange" />
                    <span className="font-medium">Alritrovobologna@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-warm-orange" />
                    <span className="font-medium">3505362538</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-warm-orange" />
                      <span className="font-medium">Orario:</span>
                    </div>
                    <div className="ml-8 space-y-1">
                      {isLoading ? (
                        <div className="font-medium">Caricamento orari...</div>
                      ) : (
                        groupedHours.map((group, index) => (
                          <div key={index} className="font-medium">
                            {group.days.length === 1
                              ? `${group.days[0]}: ${group.hours}`
                              : `${group.days[0]} - ${group.days[group.days.length - 1]}: ${group.hours}`}
                          </div>
                        ))
                      )}
                    </div>
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
