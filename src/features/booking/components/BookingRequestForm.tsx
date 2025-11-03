import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui'
import type { BookingRequestInput } from '@/types/booking'
import { useCreateBookingRequest } from '../hooks/useBookingRequests'
import { useRateLimit } from '@/hooks/useRateLimit'
import { toast } from 'react-toastify'
import { Check, Send, Loader2, CheckCircle } from 'lucide-react'
import { MenuSelection } from './MenuSelection'
import { DietaryRestrictionsSection } from './DietaryRestrictionsSection'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { isValidBookingDateTime, getDayOfWeek, formatHours } from '@/lib/businessHours'

interface BookingRequestFormProps {
  onSubmit?: () => void
}

export const BookingRequestForm: React.FC<BookingRequestFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<BookingRequestInput>({
    client_name: '',
    client_email: '',
    client_phone: '',
    booking_type: 'tavolo',
    desired_date: '',
    desired_time: '',
    num_guests: 0,
    special_requests: '',
    menu_selection: {
      items: []
    },
    dietary_restrictions: []
  })

  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  // Ref per prevenire doppi submit (anche con React StrictMode)
  const isSubmittingRef = useRef(false)
  
  // Protezione globale usando sessionStorage - lock semplice e globale (non dipende dai dati)
  const GLOBAL_LOCK_KEY = 'booking-submit-global-lock'
  const LOCK_TIMEOUT = 10000 // 10 secondi
  
  const checkGlobalSubmissionLock = (): boolean => {
    try {
      const existingLock = sessionStorage.getItem(GLOBAL_LOCK_KEY)
      
      if (existingLock) {
        const lockTime = parseInt(existingLock, 10)
        const now = Date.now()
        // Lock valido per il timeout
        if (now - lockTime < LOCK_TIMEOUT) {
          console.warn('⚠️ [BookingForm] Submit già in corso (global lock), ignorando', {
            lockAge: now - lockTime,
            remaining: LOCK_TIMEOUT - (now - lockTime)
          })
          return false
        }
        // Lock scaduto, rimuovilo
        sessionStorage.removeItem(GLOBAL_LOCK_KEY)
        console.log('🔵 [BookingForm] Lock scaduto, rimosso')
      }
      
      // Imposta nuovo lock IMMEDIATAMENTE
      sessionStorage.setItem(GLOBAL_LOCK_KEY, Date.now().toString())
      console.log('✅ [BookingForm] Global lock impostato')
      return true
    } catch (error) {
      // Se sessionStorage non è disponibile, continua comunque (fallback graceful)
      console.warn('⚠️ [BookingForm] sessionStorage non disponibile, continuo senza lock globale:', error)
      return true
    }
  }
  
  const clearGlobalSubmissionLock = () => {
    try {
      sessionStorage.removeItem(GLOBAL_LOCK_KEY)
      console.log('✅ [BookingForm] Global lock rimosso')
    } catch (error) {
      // Ignora errori di sessionStorage
      console.warn('⚠️ [BookingForm] Errore nel clear lock:', error)
    }
  }

  // Reset num_guests to 0 when cleared - only allow numeric input
  const handleNumGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Only allow numeric characters
    if (inputValue === '') {
      const newFormData = { ...formData, num_guests: 0 }
      // Aggiorna menu_total_booking se c'è un menu
      if (newFormData.menu_total_per_person) {
        newFormData.menu_total_booking = 0
      }
      setFormData(newFormData)
      setErrors({ ...errors, num_guests: '' })
    } else if (/^\d+$/.test(inputValue)) {
      const value = parseInt(inputValue, 10)
      if (value >= 1 && value <= 110) {
        const newFormData = { ...formData, num_guests: value }
        // Aggiorna menu_total_booking se c'è un menu
        if (newFormData.menu_total_per_person) {
          newFormData.menu_total_booking = newFormData.menu_total_per_person * value
        }
        setFormData(newFormData)
        setErrors({ ...errors, num_guests: '' })
      }
    }
  }

  const handleNumGuestsKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only allow numbers
    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      e.preventDefault()
    }
  }
  const { mutate, isPending } = useCreateBookingRequest()
  const { checkRateLimit, isBlocked } = useRateLimit({
    maxAttempts: 3,
    timeWindow: 60000 // 1 minuto
  })
  // Menu items loaded via MenuSelection component
  // const { data: menuItems = [] } = useMenuItems()

  // Fetch business hours (non-blocking - form works even if loading/fails)
  const { data: businessHours, isLoading: isLoadingHours, error: hoursError } = useBusinessHours()

  // Validate business hours in real-time (for immediate feedback)
  const validateBusinessHours = (date: string, time: string) => {
    if (!date || !time || !businessHours || isLoadingHours || hoursError) {
      return null // No validation if data not available
    }

    if (!isValidBookingDateTime(date, time, businessHours)) {
      const dayName = getDayOfWeek(date)
      const dayHours = businessHours[dayName]

      if (!dayHours || dayHours.length === 0) {
        return 'Il ristorante è chiuso in questo giorno'
      } else {
        const availableHours = formatHours(dayHours)
        return `Orario non valido. Orari disponibili: ${availableHours}`
      }
    }

    return null // Valid
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    // Name validation
    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Nome obbligatorio'
      isValid = false
    }

    // Email validation - optional but must be valid if provided
    if (formData.client_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = 'Email non valida'
      isValid = false
    }

    // Phone validation - required
    if (!formData.client_phone || !formData.client_phone.trim()) {
      newErrors.client_phone = 'Numero di telefono obbligatorio'
      isValid = false
    }

    // Date validation
    if (!formData.desired_date) {
      newErrors.desired_date = 'Data obbligatoria'
      isValid = false
    } else {
      const selectedDate = new Date(formData.desired_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.desired_date = 'La data non può essere nel passato'
        isValid = false
      }
    }

    // Time validation - required
    if (!formData.desired_time) {
      newErrors.desired_time = 'Orario obbligatorio'
      isValid = false
    }

    // Business hours validation (non-blocking: only validate if hours are loaded)
    if (
      formData.desired_date &&
      formData.desired_time &&
      businessHours &&
      !isLoadingHours &&
      !hoursError
    ) {
      if (!isValidBookingDateTime(formData.desired_date, formData.desired_time, businessHours)) {
        const dayName = getDayOfWeek(formData.desired_date)
        const dayHours = businessHours[dayName]

        if (!dayHours || dayHours.length === 0) {
          newErrors.desired_date = 'Il ristorante è chiuso in questo giorno'
          isValid = false
        } else {
          const availableHours = formatHours(dayHours)
          newErrors.desired_time = `Orario non valido. Orari disponibili: ${availableHours}`
          isValid = false
        }
      }
    }

    // Num guests validation
    if (!formData.num_guests || formData.num_guests < 1) {
      newErrors.num_guests = 'Numero ospiti obbligatorio (min 1)'
      isValid = false
    } else if (formData.num_guests > 80) {
      newErrors.num_guests = 'Massimo 80 ospiti'
      isValid = false
    }

    // Booking type validation
    if (!formData.booking_type) {
      newErrors.booking_type = 'Tipologia di prenotazione obbligatoria'
      isValid = false
    }

    // Menu validation for Rinfresco di Laurea
    if (formData.booking_type === 'rinfresco_laurea') {
      if (!formData.menu_selection || !formData.menu_selection.items || formData.menu_selection.items.length === 0) {
        newErrors.menu = 'Seleziona almeno un prodotto dal menù'
        isValid = false
      }
      if (!formData.menu_total_per_person || formData.menu_total_per_person <= 0) {
        newErrors.menu = 'Il totale a persona deve essere maggiore di 0'
        isValid = false
      }
    }

    // Privacy consent validation
    if (!privacyAccepted) {
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Previene propagazione eventi

    console.log('🔵 [BookingForm] Submit click')
    console.log('🔵 [BookingForm] Form data:', formData)
    console.log('🔵 [BookingForm] Privacy accepted:', privacyAccepted)
    
    // ✅ PROTEZIONE MULTI-LIVELLO CONTRO DOPPI SUBMIT
    // IMPORTANTE: L'ordine è critico - controlla prima il lock globale (più rapido)
    
    // 1. Controllo lock globale PRIMA (protezione tra mount diversi - React StrictMode)
    // Questo è il controllo più importante perché funziona anche tra istanze diverse
    if (!checkGlobalSubmissionLock()) {
      console.warn('❌ [BookingForm] Bloccato da global lock')
      return
    }
    
    // 2. Controllo ref locale (protezione istanza componente)
    if (isSubmittingRef.current) {
      console.warn('⚠️ [BookingForm] Submit già in corso (ref lock), ignorando chiamata duplicata')
      clearGlobalSubmissionLock() // Rimuovi lock globale se ref è già attivo
      return
    }
    
    // 3. Controllo mutation state (protezione React Query)
    if (isPending) {
      console.warn('⚠️ [BookingForm] Mutation già in corso (mutation state), ignorando submit')
      clearGlobalSubmissionLock() // Rimuovi lock globale se mutation è già in corso
      return
    }

    // Check rate limit
    if (!checkRateLimit()) {
      clearGlobalSubmissionLock() // Rimuovi lock se rate limit
      return
    }

    // Validazione
    if (!validate()) {
      clearGlobalSubmissionLock() // Rimuovi lock se validazione fallisce
      if (!privacyAccepted) {
        toast.error('È necessario accettare la Privacy Policy per inviare la richiesta')
      }
      return
    }

    // Imposta tutti i flag per prevenire doppi submit
    isSubmittingRef.current = true
    console.log('✅ [BookingForm] Validation passed, calling mutate...')
    console.log('🔵 [BookingForm] Lock state:', {
      globalLock: sessionStorage.getItem(GLOBAL_LOCK_KEY),
      refLock: isSubmittingRef.current,
      isPending
    })
    
    mutate(formData, {
      onSuccess: () => {
        console.log('✅ [BookingForm] Mutation successful!')
        console.log('🔵 [BookingForm] Setting showSuccessModal to true')
        
        // Reset form
        setFormData({
          client_name: '',
          client_email: '',
          client_phone: '',
          booking_type: 'tavolo',
          desired_date: '',
          desired_time: '',
          num_guests: 0,
          special_requests: '',
          menu_selection: {
            items: []
          },
          dietary_restrictions: []
        })
        setPrivacyAccepted(false)
        
        // Reset tutti i flag di submit
        isSubmittingRef.current = false
        clearGlobalSubmissionLock()
        
        // Mostra la modal di conferma invece del toast
        setShowSuccessModal(true)
        console.log('✅ [BookingForm] showSuccessModal set to true')
        onSubmit?.()
      },
      onError: (error) => {
        console.error('❌ [BookingForm] Mutation error:', error)
        // Reset tutti i flag in caso di errore per permettere nuovo tentativo
        isSubmittingRef.current = false
        clearGlobalSubmissionLock()
      }
    })
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="w-full max-w-[55vw] mx-auto px-2 md:px-6 space-y-8 font-bold">
      {/* Sezione: Dati Personali */}
      <div className="space-y-6">
        <h2
          className="text-2xl md:text-3xl font-serif text-warm-wood mb-4 pb-3 border-b-2 border-warm-beige"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(1px)',
            padding: '12px 24px',
            borderRadius: '16px',
            fontWeight: '700'
          }}
        >
          Dati Personali
        </h2>

        {/* Nome */}
        <div className="space-y-3">
          <Input
            id="client_name"
            value={formData.client_name}
            onChange={(e) => {
              setFormData({ ...formData, client_name: e.target.value })
              setErrors({ ...errors, client_name: '' })
            }}
            placeholder="Nome Completo *"
            required
            className={errors.client_name ? '!border-red-500' : ''}
          />
          {errors.client_name && (
            <p className="text-sm text-red-500">{errors.client_name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-3">
          <Input
            id="client_email"
            type="email"
            value={formData.client_email}
            onChange={(e) => {
              setFormData({ ...formData, client_email: e.target.value })
              setErrors({ ...errors, client_email: '' })
            }}
            placeholder="Email (Opzionale)"
            className={errors.client_email ? '!border-red-500' : ''}
          />
          {errors.client_email && (
            <p className="text-sm text-red-500">{errors.client_email}</p>
          )}
        </div>

        {/* Telefono */}
        <div className="space-y-3">
          <Input
            id="client_phone"
            type="tel"
            value={formData.client_phone}
            onChange={(e) => {
              setFormData({ ...formData, client_phone: e.target.value })
              setErrors({ ...errors, client_phone: '' })
            }}
            placeholder="Telefono *"
            required
            className={errors.client_phone ? '!border-red-500' : ''}
          />
          {errors.client_phone && (
            <p className="text-sm text-red-500">{errors.client_phone}</p>
          )}
        </div>
      </div>

      {/* Sezione: Dettagli Prenotazione */}
      <div className="space-y-6">
        <h2
          className="text-2xl md:text-3xl font-serif text-warm-wood mb-4 pb-3 border-b-2 border-warm-beige"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(1px)',
            padding: '12px 24px',
            borderRadius: '16px',
            fontWeight: '700'
          }}
        >
          Dettagli Prenotazione
        </h2>

        {/* Tipologia di Prenotazione - DROPDOWN */}
        <div>
          <label
            className="block text-base md:text-lg text-warm-wood mb-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(1px)',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'inline-block',
              fontWeight: '700'
            }}
          >
            Tipo di prenotazione *
          </label>
          <select
            id="booking_type"
            value={formData.booking_type}
            onChange={(e) => {
              setFormData({ ...formData, booking_type: e.target.value as 'tavolo' | 'rinfresco_laurea' })
              setErrors({ ...errors, booking_type: '' })
            }}
            className="block rounded-full border shadow-sm transition-all"
            style={{
              borderColor: 'rgba(0,0,0,0.2)',
              height: '56px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(1px)',
              color: 'black',
              width: '100%'
            }}
            onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#8B6914'}
            onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = 'rgba(0,0,0,0.2)'}
          >
            <option value="tavolo">Prenota un Tavolo</option>
            <option value="rinfresco_laurea">Rinfresco di Laurea</option>
          </select>
          {errors.booking_type && (
            <p className="text-sm text-red-500">{errors.booking_type}</p>
          )}
        </div>

        {/* Data */}
        <div className="space-y-3">
          <Input
            id="desired_date"
            type="date"
            value={formData.desired_date}
            onChange={(e) => {
              const newDate = e.target.value
              setFormData({ ...formData, desired_date: newDate })
              
              // Real-time validation for business hours
              const timeError = newDate && formData.desired_time 
                ? validateBusinessHours(newDate, formData.desired_time)
                : null
              
              if (timeError) {
                // Check if it's a day closure error
                const dayName = businessHours ? getDayOfWeek(newDate) : null
                const dayHours = businessHours && dayName ? businessHours[dayName] : null
                
                if (dayHours === null || (Array.isArray(dayHours) && dayHours.length === 0)) {
                  setErrors({ ...errors, desired_date: timeError, desired_time: '' })
                } else {
                  setErrors({ ...errors, desired_date: '', desired_time: timeError })
                }
              } else {
                setErrors({ ...errors, desired_date: '', desired_time: '' })
              }
            }}
            required
            className={errors.desired_date ? '!border-red-500' : ''}
          />
          {errors.desired_date && (
            <div
              className="text-sm text-red-600 p-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(1px)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              {errors.desired_date}
            </div>
          )}
        </div>

        {/* Ora */}
        <div className="space-y-3">
          <Input
            id="desired_time"
            type="time"
            value={formData.desired_time || ''}
            onChange={(e) => {
              const newTime = e.target.value
              setFormData({ ...formData, desired_time: newTime })
              
              // Real-time validation for business hours
              const timeError = formData.desired_date && newTime 
                ? validateBusinessHours(formData.desired_date, newTime)
                : null
              
              if (timeError) {
                // Check if it's a day closure error
                const dayName = businessHours && formData.desired_date ? getDayOfWeek(formData.desired_date) : null
                const dayHours = businessHours && dayName ? businessHours[dayName] : null
                
                if (dayHours === null || (Array.isArray(dayHours) && dayHours.length === 0)) {
                  setErrors({ ...errors, desired_date: timeError, desired_time: '' })
                } else {
                  setErrors({ ...errors, desired_date: '', desired_time: timeError })
                }
              } else {
                setErrors({ ...errors, desired_date: '', desired_time: '' })
              }
            }}
            required
            className={errors.desired_time ? '!border-red-500' : ''}
          />
          {errors.desired_time && (
            <div
              className="text-sm text-red-600 p-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(1px)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              {errors.desired_time}
            </div>
          )}
        </div>

        {/* Numero Ospiti */}
        <div className="space-y-3">
          <Input
            id="num_guests"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            max="80"
            value={formData.num_guests || ''}
            onChange={handleNumGuestsChange}
            onKeyPress={handleNumGuestsKeyPress}
            required
            placeholder="Numero Ospiti * (es: 15)"
            className={errors.num_guests ? '!border-red-500' : ''}
          />
          {errors.num_guests && (
            <p className="text-sm text-red-500">{errors.num_guests}</p>
          )}
        </div>
      </div>
      {/* Menu Selection - Solo per Rinfresco di Laurea */}
      {formData.booking_type === 'rinfresco_laurea' && (
        <div className="space-y-6" style={{ position: 'relative', left: '50%', transform: 'translateX(-50%)', width: '100vw', maxWidth: '1400px', paddingLeft: '2rem', paddingRight: '2rem' }}>
          <MenuSelection
            selectedItems={formData.menu_selection?.items || []}
            onMenuChange={(items, totalPerPerson) => {
              const numGuests = formData.num_guests || 0
              setFormData({
                ...formData,
                menu_selection: {
                  items
                },
                menu_total_per_person: totalPerPerson,
                menu_total_booking: totalPerPerson * numGuests
              })
              setErrors({ ...errors, menu: '' })
            }}
          />
          {errors.menu && (
            <p className="text-sm text-red-500">{errors.menu}</p>
          )}
        </div>
      )}

      {/* Intolleranze Alimentari - Solo per Rinfresco di Laurea */}
      {/* NOTA: I guest_count nelle intolleranze sono separati da num_guests.
          Il num_guests è il totale ospiti della prenotazione.
          I guest_count nelle intolleranze indicano solo quante persone hanno quella specifica intolleranza.
          NON vengono sommati al totale. */}
      {formData.booking_type === 'rinfresco_laurea' && (
        <div className="space-y-6">
          <DietaryRestrictionsSection
            restrictions={formData.dietary_restrictions || []}
            onRestrictionsChange={(restrictions) => {
              setFormData({
                ...formData,
                dietary_restrictions: restrictions
                // NOTA: num_guests non viene modificato quando si aggiungono intolleranze
              })
            }}
            specialRequests={formData.special_requests || ''}
            onSpecialRequestsChange={(value) => {
              setFormData({ ...formData, special_requests: value })
            }}
            privacyAccepted={privacyAccepted}
            onPrivacyChange={setPrivacyAccepted}
          />
        </div>
      )}

      {/* Privacy Policy - Solo per Prenota un Tavolo (per Rinfresco di Laurea è dentro DietaryRestrictionsSection) */}
      {formData.booking_type !== 'rinfresco_laurea' && (
        <div className="rounded-xl p-4 bg-gradient-to-br from-warm-cream-60 via-warm-cream-40 to-transparent border-2 border-warm-beige shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                id="privacy-consent"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                required
                className="peer sr-only"
              />
              <label
                htmlFor="privacy-consent"
                className="flex h-5 w-5 cursor-pointer items-center justify-center border-2 border-warm-wood/40 shadow-sm transition-all duration-300 hover:border-warm-wood hover:shadow-md peer-checked:border-warm-orange peer-checked:shadow-lg peer-focus-visible:ring-4 peer-focus-visible:ring-warm-wood/20"
                style={{ backgroundColor: 'white' }}
              >
                <Check
                  className={`h-3.5 w-3.5 text-white transition-all duration-300 ${
                    privacyAccepted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                  strokeWidth={3}
                />
              </label>
            </div>
            <label
              htmlFor="privacy-consent"
              className="cursor-pointer text-sm text-warm-wood-dark font-medium leading-relaxed"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '8px 16px', borderRadius: '8px', backdropFilter: 'blur(1px)', maxWidth: '600px' }}
            >
              Accetto la{' '}
              <Link
                to="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-warm-orange hover:text-terracotta underline decoration-2 underline-offset-2 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </Link>
              {' '}di Al Ritrovo *
            </label>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center items-center mt-8 w-full">
        <button
            type="submit"
            disabled={isPending || isBlocked}
            className="group relative overflow-hidden px-12 md:px-20 text-xl md:text-2xl uppercase tracking-wide text-white rounded-full bg-green-600 hover:bg-green-700 shadow-2xl hover:shadow-[0_20px_40px_rgba(34,197,94,0.4)] hover:-translate-y-1 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-2xl w-full md:w-auto max-w-md md:max-w-2xl"
            style={{ fontWeight: '700', backgroundColor: '#16a34a', paddingTop: '28px', paddingBottom: '28px' }}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

            {/* Content */}
            <div className="relative flex items-center justify-center gap-3 whitespace-nowrap">
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-base md:text-lg">Invio in corso...</span>
                </>
              ) : isBlocked ? (
                <span className="text-base md:text-lg">Limite richieste raggiunto</span>
              ) : (
                <>
                  <span className="text-xl md:text-2xl">Invia Prenotazione</span>
                  <Send className="h-6 w-6 md:h-7 md:w-7 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </div>

            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute inset-[-2px] rounded-full bg-gradient-to-r from-warm-wood via-warm-orange to-terracotta blur-sm"></div>
            </div>
          </button>
        </div>
    </form>

    {/* Modal di Conferma Successo */}
    {showSuccessModal && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
            Prenotazione Inviata con Successo!
          </h3>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>
            La tua richiesta di prenotazione è stata inoltrata correttamente.<br />
            Ti contatteremo a breve per confermare i dettagli.
          </p>
          <button
            onClick={() => {
              console.log('🔴 [Modal] Closing via button')
              setShowSuccessModal(false)
              setTimeout(() => {
                // Reindirizza al sito Wix di Al Ritrovo
                window.location.href = 'https://alritrovobologna.wixsite.com/alritrovobologna'
              }, 300)
            }}
            style={{
              padding: '12px 32px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: '#22c55e',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer'
            }}
          >
            Chiudi
          </button>
        </div>
      </div>
    )}
    </>
  )
}
