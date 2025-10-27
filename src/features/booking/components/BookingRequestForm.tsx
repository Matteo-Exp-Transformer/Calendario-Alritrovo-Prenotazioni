import React, { useState } from 'react'
import { Button, Input, Textarea, Label } from '@/components/ui'
import type { BookingRequestInput, EventType } from '@/types/booking'
import { useCreateBookingRequest } from '../hooks/useBookingRequests'
import { useRateLimit } from '@/hooks/useRateLimit'
import { toast } from 'react-toastify'

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'cena', label: 'Cena' },
  { value: 'aperitivo', label: 'Aperitivo' },
  { value: 'evento', label: 'Evento Privato' },
  { value: 'laurea', label: 'Laurea' }
]

interface BookingRequestFormProps {
  onSubmit?: () => void
}

export const BookingRequestForm: React.FC<BookingRequestFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<BookingRequestInput>({
    client_name: '',
    client_email: '',
    client_phone: '',
    event_type: 'cena',
    desired_date: '',
    desired_time: '',
    num_guests: 0,
    special_requests: ''
  })

  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset num_guests to 0 when cleared
  const handleNumGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === '') {
      setFormData({ ...formData, num_guests: 0 })
      setErrors({ ...errors, num_guests: '' })
    } else {
      const value = parseInt(inputValue) || 0
      if (value >= 1 && value <= 110) {
        setFormData({ ...formData, num_guests: value })
        setErrors({ ...errors, num_guests: '' })
      }
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

    // Email validation
    if (!formData.client_email.trim()) {
      newErrors.client_email = 'Email obbligatoria'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = 'Email non valida'
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
        // Reset form
        setFormData({
          client_name: '',
          client_email: '',
          client_phone: '',
          event_type: 'cena',
          desired_date: '',
          desired_time: '',
          num_guests: 0,
          special_requests: ''
        })
        setPrivacyAccepted(false)
        onSubmit?.()
      },
      onError: (error) => {
        console.error('❌ [BookingForm] Mutation error:', error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="client_name" style={{ color: '#654321' }}>Nome Completo *</Label>
        <Input
          id="client_name"
          value={formData.client_name}
          onChange={(e) => {
            setFormData({ ...formData, client_name: e.target.value })
            setErrors({ ...errors, client_name: '' })
          }}
          placeholder="Mario Rossi"
          required
          className={errors.client_name ? '!border-red-500' : ''}
        />
        {errors.client_name && (
          <p className="text-sm text-red-500">{errors.client_name}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="client_email" style={{ color: '#654321' }}>Email *</Label>
        <Input
          id="client_email"
          type="email"
          value={formData.client_email}
          onChange={(e) => {
            setFormData({ ...formData, client_email: e.target.value })
            setErrors({ ...errors, client_email: '' })
          }}
          placeholder="nome@email.com"
          required
          className={errors.client_email ? '!border-red-500' : ''}
        />
        {errors.client_email && (
          <p className="text-sm text-red-500">{errors.client_email}</p>
        )}
      </div>

      {/* Telefono */}
      <div className="space-y-2">
        <Label htmlFor="client_phone" style={{ color: '#654321' }}>Telefono (Opzionale)</Label>
        <Input
          id="client_phone"
          type="tel"
          value={formData.client_phone}
          onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
          placeholder="351 123 4567"
        />
      </div>

      {/* Tipo Evento */}
      <div className="space-y-2">
        <Label htmlFor="event_type" style={{ color: '#654321' }}>Tipo Evento *</Label>
        <select
          id="event_type"
          value={formData.event_type}
          onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
          required
          className="flex rounded-full border bg-white shadow-sm transition-all"
          style={{ 
            borderColor: 'rgba(0,0,0,0.2)', 
            maxWidth: '600px', 
            height: '56px',
            padding: '16px',
            fontSize: '16px'
          }}
          onFocus={(e) => e.target.style.borderColor = '#8B6914'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.2)'}
        >
          {EVENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Data */}
      <div className="space-y-2">
        <Label htmlFor="desired_date" style={{ color: '#654321' }}>Data Desiderata *</Label>
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
      <div className="space-y-2">
        <Label htmlFor="desired_time" style={{ color: '#654321' }}>Orario Desiderato</Label>
        <Input
          id="desired_time"
          type="time"
          value={formData.desired_time}
          onChange={(e) => setFormData({ ...formData, desired_time: e.target.value })}
        />
      </div>

      {/* Numero Ospiti */}
      <div className="space-y-2">
        <Label htmlFor="num_guests" style={{ color: '#654321' }}>Numero Ospiti *</Label>
        <Input
          id="num_guests"
          type="number"
          min="1"
          max="110"
          value={formData.num_guests || ''}
          onChange={handleNumGuestsChange}
          required
          placeholder="Inserisci numero ospiti"
          className={errors.num_guests ? '!border-red-500' : ''}
        />
        {errors.num_guests && (
          <p className="text-sm text-red-500">{errors.num_guests}</p>
        )}
      </div>

      {/* Note Speciali */}
      <div className="space-y-2">
        <Label htmlFor="special_requests" style={{ color: '#654321' }}>Note o Richieste Speciali</Label>
        <Textarea
          id="special_requests"
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          placeholder="Es: Menu vegetariano, intolleranze alimentari, tavolo specifico..."
          rows={4}
        />
      </div>

      {/* Privacy Policy */}
      <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(255,255,255,0.3)', border: '1px solid rgba(101, 67, 33, 0.3)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="privacy-consent"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            required
            className="mt-1"
          />
          <label htmlFor="privacy-consent" className="text-sm cursor-pointer" style={{ color: '#654321' }}>
            Accetto la{' '}
            <a href="/privacy" target="_blank" className="underline" style={{ color: '#654321' }}>
              Privacy Policy
            </a>
            {' '}di Al Ritrovo *
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isPending || isBlocked}
        className="mt-6"
        style={{ backgroundColor: '#8B6914', color: '#FFFFFF' }}
      >
        {isPending ? 'Invio in corso...' : isBlocked ? 'Limite richieste raggiunto' : 'INVIA RICHIESTA PRENOTAZIONE'}
      </Button>

      <p className="text-xs text-center" style={{ color: '#8B6914' }}>
        * I campi contrassegnati sono obbligatori.
      </p>
    </form>
  )
}

