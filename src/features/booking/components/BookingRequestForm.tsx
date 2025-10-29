import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input, Textarea } from '@/components/ui'
import type { BookingRequestInput, EventType } from '@/types/booking'
import { useCreateBookingRequest } from '../hooks/useBookingRequests'
import { useRateLimit } from '@/hooks/useRateLimit'
import { toast } from 'react-toastify'
import { Check, Send, Loader2, CheckCircle } from 'lucide-react'

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'drink_caraffe', label: 'Drink/Caraffe' },
  { value: 'drink_rinfresco_leggero', label: 'Drink/Caraffe + rinfresco leggero' },
  { value: 'drink_rinfresco_completo', label: 'Drink/Caraffe + rinfresco completo' },
  { value: 'drink_rinfresco_completo_primo', label: 'Drink/Caraffe + rinfresco completo + primo piatto' },
  { value: 'menu_pranzo_cena', label: 'Menu Pranzo / Menù Cena' }
]

interface BookingRequestFormProps {
  onSubmit?: () => void
}

export const BookingRequestForm: React.FC<BookingRequestFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<BookingRequestInput>({
    client_name: '',
    client_email: '',
    client_phone: '',
    event_type: 'drink_caraffe',
    desired_date: '',
    desired_time: '',
    num_guests: 0,
    special_requests: ''
  })

  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Reset num_guests to 0 when cleared - only allow numeric input
  const handleNumGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Only allow numeric characters
    if (inputValue === '') {
      setFormData({ ...formData, num_guests: 0 })
      setErrors({ ...errors, num_guests: '' })
    } else if (/^\d+$/.test(inputValue)) {
      const value = parseInt(inputValue, 10)
      if (value >= 1 && value <= 110) {
        setFormData({ ...formData, num_guests: value })
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

    // Num guests validation
    if (!formData.num_guests || formData.num_guests < 1) {
      newErrors.num_guests = 'Numero ospiti obbligatorio (min 1)'
      isValid = false
    } else if (formData.num_guests > 110) {
      newErrors.num_guests = 'Massimo 110 ospiti'
      isValid = false
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

    console.log('🔵 [BookingForm] Submit click')
    console.log('🔵 [BookingForm] Form data:', formData)
    console.log('🔵 [BookingForm] Privacy accepted:', privacyAccepted)

    // Check rate limit first
    if (!checkRateLimit()) {
      return
    }

    if (!validate()) {
      if (!privacyAccepted) {
        toast.error('È necessario accettare la Privacy Policy per inviare la richiesta')
      }
      return
    }

    console.log('✅ [BookingForm] Validation passed, calling mutate...')
    mutate(formData, {
      onSuccess: () => {
        console.log('✅ [BookingForm] Mutation successful!')
        console.log('🔵 [BookingForm] Setting showSuccessModal to true')
        // Reset form
        setFormData({
          client_name: '',
          client_email: '',
          client_phone: '',
          event_type: 'drink_caraffe',
          desired_date: '',
          desired_time: '',
          num_guests: 0,
          special_requests: ''
        })
        setPrivacyAccepted(false)
        // Mostra la modal di conferma invece del toast
        setShowSuccessModal(true)
        console.log('✅ [BookingForm] showSuccessModal set to true')
        onSubmit?.()
      },
      onError: (error) => {
        console.error('❌ [BookingForm] Mutation error:', error)
      }
    })
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Layout a 2 Colonne su schermi grandi */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* COLONNA SINISTRA: Dati Personali */}
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-warm-wood mb-4 pb-3 border-b-2 border-warm-beige">
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
          placeholder="Nome Completo * (es: Mario Rossi)"
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
          placeholder="Email * (es: nome@email.com)"
          required
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
          onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
          placeholder="Telefono (Opzionale) - es: 351 123 4567"
        />
      </div>
        </div>

        {/* COLONNA DESTRA: Dettagli Prenotazione */}
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-warm-wood mb-4 pb-3 border-b-2 border-warm-beige">
            Dettagli Prenotazione
          </h2>

      {/* Tipo Evento */}
      <div className="space-y-3">
        <select
          id="event_type"
          value={formData.event_type}
          onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
          required
          className="flex rounded-full border bg-white/50 backdrop-blur-[6px] shadow-sm transition-all text-gray-600"
          style={{ 
            borderColor: 'rgba(0,0,0,0.2)', 
            maxWidth: '600px', 
            height: '56px',
            padding: '16px',
            fontSize: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(6px)'
          }}
          onFocus={(e) => e.target.style.borderColor = '#8B6914'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.2)'}
        >
          {!formData.event_type && <option value="">Tipo Evento * - Seleziona un'opzione</option>}
          {EVENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Data */}
      <div className="space-y-3">
        <Input
          id="desired_date"
          type="date"
          value={formData.desired_date}
          onChange={(e) => {
            setFormData({ ...formData, desired_date: e.target.value })
            setErrors({ ...errors, desired_date: '' })
          }}
          required
          className={errors.desired_date ? '!border-red-500' : ''}
        />
        {errors.desired_date && (
          <p className="text-sm text-red-500">{errors.desired_date}</p>
        )}
      </div>

      {/* Ora */}
      <div className="space-y-3">
        <Input
          id="desired_time"
          type="time"
          value={formData.desired_time}
          onChange={(e) => {
            setFormData({ ...formData, desired_time: e.target.value })
            setErrors({ ...errors, desired_time: '' })
          }}
          required
          className={errors.desired_time ? '!border-red-500' : ''}
        />
        {errors.desired_time && (
          <p className="text-sm text-red-500">{errors.desired_time}</p>
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
          max="110"
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
      </div>

      {/* Note Speciali - Full Width sotto le 2 colonne */}
      <div className="space-y-3">
        <Textarea
          id="special_requests"
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          placeholder="Note o Richieste Speciali (es: Menu vegetariano, intolleranze alimentari, tavolo specifico...)"
          rows={4}
        />
      </div>

      {/* Privacy Policy - Checkbox Piccolo e Stondato */}
      <div className="rounded-xl p-4 bg-gradient-to-br from-warm-cream/60 via-warm-cream/40 to-transparent border-2 border-warm-beige shadow-sm">
        <div className="flex items-center gap-3">
          {/* Custom Checkbox - Più piccolo */}
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

          {/* Label */}
          <label 
            htmlFor="privacy-consent" 
            className="cursor-pointer text-sm text-warm-wood-dark font-medium leading-relaxed"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: '8px 16px', borderRadius: '8px', backdropFilter: 'blur(4px)', maxWidth: '600px' }}
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

      {/* Submit Button - Ovale GRANDE e allungato orizzontalmente */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isPending || isBlocked}
          style={{ backgroundColor: '#22c55e', paddingLeft: '256px', paddingRight: '256px', paddingTop: '25px', paddingBottom: '25px', borderRadius: '50px' }}
          className="group relative overflow-hidden bg-green-600 px-[256px] py-6 text-2xl font-bold uppercase tracking-wide text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(34,197,94,0.4)] hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-2xl md:w-auto"
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

          {/* Content */}
          <div className="relative flex items-center justify-center gap-3 whitespace-nowrap">
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm md:text-base">Invio in corso...</span>
              </>
            ) : isBlocked ? (
              <span className="text-sm md:text-base">Limite richieste raggiunto</span>
            ) : (
              <>
                <span className="text-2xl">Invia Prenotazione</span>
                <Send className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </div>

          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-[-2px] rounded-full bg-gradient-to-r from-warm-wood via-warm-orange to-terracotta blur-sm"></div>
          </div>
        </button>
      </div>

      <p className="text-xs text-center text-gray-600">
        * I campi contrassegnati sono obbligatori.
      </p>
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

