import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui'
import { DateInput } from '@/components/ui/DateInput'
import { TimeInput } from '@/components/ui/TimeInput'
import type { BookingRequestInput } from '@/types/booking'
import { useCreateBookingRequest } from '../hooks/useBookingRequests'
import { useRateLimit } from '@/hooks/useRateLimit'
import { Check, Send, Loader2, CheckCircle } from 'lucide-react'
import { MenuSelection } from './MenuSelection'
import { DietaryRestrictionsSection } from './DietaryRestrictionsSection'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { isValidBookingDateTime, getDayOfWeek, formatHours } from '@/lib/businessHours'
import { toast } from 'react-toastify'
import { getPresetMenu, type PresetMenuType } from '../constants/presetMenus'
import { useMenuItems } from '../hooks/useMenuItems'

interface BookingRequestFormProps {
  onSubmit?: () => void
}

// Contatore globale per tracciare mount del componente (debug React StrictMode)
let componentMountCount = 0
let lastMountTime = 0

export const BookingRequestForm: React.FC<BookingRequestFormProps> = ({ onSubmit }) => {
  // Traccia mount per debug
  React.useEffect(() => {
    componentMountCount++
    const now = Date.now()
    const timeSinceLastMount = now - lastMountTime
    lastMountTime = now
    
    console.log(`🔄 [BookingForm] Component MOUNTED #${componentMountCount}`, {
      timeSinceLastMount: timeSinceLastMount < 1000 ? `${timeSinceLastMount}ms (possibile StrictMode)` : 'normal',
      timestamp: new Date().toISOString()
    })
    
    return () => {
      console.log(`🔄 [BookingForm] Component UNMOUNTED #${componentMountCount}`)
    }
  }, [])
  
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
      items: [],
      tiramisu_total: 0,
      tiramisu_kg: 0
    },
    dietary_restrictions: [],
    preset_menu: null
  })

  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // Stato per triggerare re-render e disabilitare button
  const [selectedPreset, setSelectedPreset] = useState<PresetMenuType>(null)
  
  // Ref per prevenire doppi submit (anche con React StrictMode)
  const isSubmittingRef = useRef(false)
  
  // Protezione globale usando sessionStorage - lock atomico per prevenire race condition
  const GLOBAL_LOCK_KEY = 'booking-submit-global-lock'
  const LOCK_TIMEOUT = 10000 // 10 secondi
  
  // Lock atomico: controlla E imposta in modo atomico usando un timestamp univoco
  // IMPLEMENTAZIONE MIGLIORATA: verifica lock DOPO l'impostazione per rilevare race conditions
  const acquireGlobalLock = (): string | null => {
    // NOTA: Non può essere async perché viene chiamata sincronamente in handleSubmit
    try {
      // 🔒 MECCANISMO DI LOCK ATOMIC CON VERIFICA IMMEDIATA
      const now = Date.now()
      const randomPart = Math.random().toString(36).substring(2, 15) // Più lungo per maggiore unicità
      const lockId = `${now}-${randomPart}` // ID univoco per questo tentativo
      
      // PRIMA VERIFICA: lock esistente e valido?
      const existingLock = sessionStorage.getItem(GLOBAL_LOCK_KEY)
      
      if (existingLock) {
        const lockTime = parseInt(existingLock.split('-')[0], 10)
        const lockAge = now - lockTime
        
        if (lockAge < LOCK_TIMEOUT) {
          // Lock valido - BLOCCATO
          console.warn('⚠️ [BookingForm] Lock già presente (acquired by another instance)', {
            lockAge: `${lockAge}ms`,
            remaining: `${LOCK_TIMEOUT - lockAge}ms`,
            existingLock: existingLock.substring(0, 30) + '...'
          })
          return null
        }
        // Lock scaduto, rimuovilo
        sessionStorage.removeItem(GLOBAL_LOCK_KEY)
      }
      
      // OPERAZIONE ATOMICA: imposta lock con ID univoco
      sessionStorage.setItem(GLOBAL_LOCK_KEY, lockId)
      
      // ⚠️ CRITICO: Verifica IMMEDIATAMENTE se il lock è nostro
      // Se due istanze fanno questo simultaneamente, solo una vedrà il proprio ID
      // Usa un piccolo delay per dare tempo alla race condition di manifestarsi
      const actualLock = sessionStorage.getItem(GLOBAL_LOCK_KEY)
      
      if (actualLock !== lockId) {
        // Race condition rilevata - un'altra istanza ha sovrascritto il nostro lock
        console.error('❌ [BookingForm] RACE CONDITION RILEVATA! Lock acquisito da altra istanza:', {
          ourId: lockId.substring(0, 30),
          actualLock: actualLock?.substring(0, 30),
          timestamp: now
        })
        return null
      }
      
      // Verifica doppia: controlla immediatamente dopo l'impostazione
      // Se due chiamate arrivano simultaneamente, solo una vedrà il proprio ID
      
      console.log('✅ [BookingForm] Global lock ACQUISITO e VERIFICATO con ID:', lockId.substring(0, 30))
      return lockId
    } catch (error) {
      console.warn('⚠️ [BookingForm] sessionStorage non disponibile:', error)
      return null
    }
  }
  
  const releaseGlobalLock = (lockId: string | null) => {
    if (!lockId) return
    
    try {
      const currentLock = sessionStorage.getItem(GLOBAL_LOCK_KEY)
      // Rilascia solo se è il nostro lock (non quello di un'altra istanza)
      if (currentLock === lockId) {
        sessionStorage.removeItem(GLOBAL_LOCK_KEY)
        console.log('✅ [BookingForm] Global lock rilasciato:', lockId)
      } else {
        console.warn('⚠️ [BookingForm] Tentativo di rilasciare lock non nostro:', {
          ourId: lockId,
          currentLock
        })
      }
    } catch (error) {
      console.warn('⚠️ [BookingForm] Errore nel release lock:', error)
    }
  }
  

  // Reset num_guests to 0 when cleared - only allow numeric input
  const handleNumGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Only allow numeric characters
    if (inputValue === '') {
      const tiramisuTotal = formData.menu_selection?.tiramisu_total || 0
      const newFormData = { ...formData, num_guests: 0, menu_total_booking: tiramisuTotal }
      setFormData(newFormData)
      setErrors({ ...errors, num_guests: '' })
    } else if (/^\d+$/.test(inputValue)) {
      const value = parseInt(inputValue, 10)
      if (value >= 1 && value <= 110) {
        const tiramisuTotal = formData.menu_selection?.tiramisu_total || 0
        const perPerson = formData.menu_total_per_person || 0
        const copertoTotal = formData.booking_type === 'rinfresco_laurea' ? 2.00 * value : 0
        const newFormData = {
          ...formData,
          num_guests: value,
          menu_total_booking: perPerson * value + copertoTotal + tiramisuTotal
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

  // Gestione selezione menu predefinito
  const handlePresetMenuChange = (presetType: PresetMenuType) => {
    setSelectedPreset(presetType)
    
    if (!presetType) {
      // Reset menu se nessun preset
      setFormData({
        ...formData,
        preset_menu: null,
        menu_selection: { items: [], tiramisu_total: 0, tiramisu_kg: 0 },
        menu_total_per_person: 0,
        menu_total_booking: 0
      })
      return
    }

    const preset = getPresetMenu(presetType)
    if (!preset) return

    // Helper per normalizzare i nomi per il matching (case-insensitive, ignora spazi extra)
    const normalizeName = (name: string): string => {
      return name.toLowerCase().trim().replace(/\s+/g, ' ').replace(/\//g, '/').replace(/\/\s*/g, '/').replace(/\s*\/\s*/g, '/')
    }

    // Helper per match flessibile - cerca anche varianti comuni
    const matchesName = (itemName: string, presetName: string): boolean => {
      const normalizedItem = normalizeName(itemName)
      const normalizedPreset = normalizeName(presetName)
      
      // Match esatto normalizzato
      if (normalizedItem === normalizedPreset) return true
      
      // Match per "Caraffe" - gestisci PRIMA il match parziale per evitare match errati
      // IMPORTANTE: Gestire questo caso PRIMA del match parziale generico
      const presetHasCaraffe = normalizedPreset.includes('caraffe')
      const presetHasDrink = normalizedPreset.includes('drink')
      const presetHasPremium = normalizedPreset.includes('premium')
      
      if (presetHasCaraffe) {
        const hasCaraffe = normalizedItem.includes('caraffe')
        const hasDrink = normalizedItem.includes('drink')
        const hasPremium = normalizedItem.includes('premium')
        
        // Caso 1: Preset ha "Caraffe Premium" (senza "drink") - matcha "Caraffe Drink Premium" o "Caraffe / Drink Premium"
        if (presetHasPremium && !presetHasDrink) {
          if (hasCaraffe && hasPremium) return true
          // NON matchare se l'item non ha premium
          return false
        }
        
        // Caso 2: Preset ha "Caraffe/Drink" (con "drink", senza premium) - matcha SOLO items senza premium
        if (presetHasDrink && !presetHasPremium) {
          if (hasCaraffe && hasDrink && !hasPremium) return true
          // NON matchare se l'item ha premium
          return false
        }
        
        // Caso 3: Preset ha "Caraffe/Drink Premium" (con "drink" e "premium") - matcha SOLO items con premium
        if (presetHasDrink && presetHasPremium) {
          if (hasCaraffe && hasDrink && hasPremium) return true
          // NON matchare se l'item non ha premium
          return false
        }
      }
      
      // Match parziale per altri items (solo se non è un caso Caraffe)
      if (normalizedItem.includes(normalizedPreset) || normalizedPreset.includes(normalizedItem)) return true
      
      return false
    }

    // Trova gli items nel database per nome (matching flessibile)
    const selectedItems = menuItems
      .filter(item => {
        return preset.itemNames.some(presetName => matchesName(item.name, presetName))
      })
      .map(item => {
        const isTiramisu = item.name.toLowerCase().includes('tiramis')
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          quantity: isTiramisu ? 1 : undefined,
          totalPrice: isTiramisu ? item.price : item.price
        }
      })

    // Calcola totale
    const totalPerPerson = selectedItems
      .filter(item => !item.name.toLowerCase().includes('tiramis'))
      .reduce((sum, item) => sum + item.price, 0)
    const numGuests = formData.num_guests || 0
    const copertoTotal = formData.booking_type === 'rinfresco_laurea' ? 2.00 * numGuests : 0

    const tiramisuSelection = selectedItems.find((item) => item.name.toLowerCase().includes('tiramis'))
    const tiramisuUnitPrice = tiramisuSelection?.price || 0
    const tiramisuKg = tiramisuSelection?.quantity || 0
    const tiramisuTotal = tiramisuKg > 0 ? tiramisuUnitPrice * tiramisuKg : 0

    setFormData({
      ...formData,
      preset_menu: presetType,
      menu_selection: {
        items: selectedItems,
        tiramisu_total: tiramisuTotal,
        tiramisu_kg: tiramisuKg
      },
      menu_total_per_person: totalPerPerson,
      menu_total_booking: totalPerPerson * numGuests + copertoTotal + tiramisuTotal
    })
  }

  // Reset preset quando cambia booking_type
  useEffect(() => {
    if (formData.booking_type !== 'rinfresco_laurea') {
      setSelectedPreset(null)
      setFormData(prev => ({
        ...prev,
        preset_menu: null
      }))
    }
  }, [formData.booking_type])

  const { mutate, isPending } = useCreateBookingRequest()
  const { checkRateLimit, isBlocked } = useRateLimit({
    maxAttempts: 3,
    timeWindow: 60000 // 1 minuto
  })
  const { data: menuItems = [] } = useMenuItems()

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

  // Helper function to scroll to first error field
  const scrollToError = (errorKey: string) => {
    // Map error keys to input IDs
    const fieldIdMap: Record<string, string> = {
      client_name: 'client_name',
      client_email: 'client_email',
      client_phone: 'client_phone',
      desired_date: 'desired_date',
      desired_time: 'desired_time',
      num_guests: 'num_guests',
      booking_type: 'booking_type',
      menu: 'menu-section',
      privacyAccepted: 'privacy-consent'
    }

    const fieldId = fieldIdMap[errorKey]
    if (fieldId) {
      const element = document.getElementById(fieldId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Focus the element if it's an input
        if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
          setTimeout(() => element.focus(), 500)
        }
      }
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true
    let firstErrorKey: string | null = null

    // Name validation
    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Nome obbligatorio'
      isValid = false
      if (!firstErrorKey) firstErrorKey = 'client_name'
    }

    // Email validation - optional but must be valid if provided
    if (formData.client_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = 'Email non valida'
      isValid = false
      if (!firstErrorKey) firstErrorKey = 'client_email'
    }

    // Phone validation - required
    if (!formData.client_phone || !formData.client_phone.trim()) {
      newErrors.client_phone = 'Numero di telefono obbligatorio'
      isValid = false
      if (!firstErrorKey) firstErrorKey = 'client_phone'
    }

    // Date validation
    if (!formData.desired_date) {
      newErrors.desired_date = 'Data obbligatoria'
      isValid = false
      if (!firstErrorKey) firstErrorKey = 'desired_date'
    } else {
      const selectedDate = new Date(formData.desired_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.desired_date = 'La data non può essere nel passato'
        isValid = false
        if (!firstErrorKey) firstErrorKey = 'desired_date'
      }
    }

    // Time validation - required
    if (!formData.desired_time) {
      newErrors.desired_time = 'Orario obbligatorio'
      isValid = false
      if (!firstErrorKey) firstErrorKey = 'desired_time'
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
          if (!firstErrorKey) firstErrorKey = 'desired_date'
        } else {
          const availableHours = formatHours(dayHours)
          newErrors.desired_time = `Orario non valido. Orari disponibili: ${availableHours}`
          isValid = false
          if (!firstErrorKey) firstErrorKey = 'desired_time'
        }
      }
    }

    // Num guests validation
    if (!formData.num_guests || formData.num_guests < 1) {
      newErrors.num_guests = 'Numero ospiti obbligatorio (min 1)'
      isValid = false
      if (!firstErrorKey) firstErrorKey = 'num_guests'
    } else if (formData.num_guests > 80) {
      newErrors.num_guests = 'Massimo 80 ospiti'
      isValid = false
      if (!firstErrorKey) firstErrorKey = 'num_guests'
    }

    // Booking type validation
    if (!formData.booking_type) {
      newErrors.booking_type = 'Tipologia di prenotazione obbligatoria'
      isValid = false
      if (!firstErrorKey) firstErrorKey = 'booking_type'
    }

    // Menu validation for Rinfresco di Laurea
    if (formData.booking_type === 'rinfresco_laurea') {
      if (!formData.menu_selection || !formData.menu_selection.items || formData.menu_selection.items.length === 0) {
        newErrors.menu = 'Seleziona almeno un prodotto dal menù'
        isValid = false
        if (!firstErrorKey) firstErrorKey = 'menu'
      }
      if (!formData.menu_total_per_person || formData.menu_total_per_person <= 0) {
        newErrors.menu = 'Il totale a persona deve essere maggiore di 0'
        isValid = false
        if (!firstErrorKey) firstErrorKey = 'menu'
      }
    }

    // Privacy consent validation
    if (!privacyAccepted) {
      newErrors.privacyAccepted = 'È necessario accettare la Privacy Policy per inviare la richiesta'
      isValid = false
      if (!firstErrorKey) firstErrorKey = 'privacyAccepted'
      console.log('❌ [BookingForm] Privacy non accettata, errore impostato:', newErrors.privacyAccepted)
    }

    setErrors(newErrors)
    console.log('🔵 [BookingForm] Errors state dopo validazione:', newErrors)

    // If validation failed, show toast and scroll to first error
    if (!isValid) {
      const errorCount = Object.keys(newErrors).length
      toast.error(`Compilazione non valida: ${errorCount} ${errorCount === 1 ? 'campo da correggere' : 'campi da correggere'}`, {
        position: 'top-center',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      })

      // Scroll to first error field
      if (firstErrorKey) {
        scrollToError(firstErrorKey)
      }
    }

    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Previene propagazione eventi

    // 🚨 CRITICO: Imposta lock IMMEDIATAMENTE, PRIMA di qualsiasi log o controllo
    // Questo è fondamentale per prevenire race conditions sincronizzate
    const lockId = acquireGlobalLock()
    if (!lockId) {
      console.warn('❌ [BookingForm] Lock globale già acquisito, BLOCCATO immediatamente')
      return
    }
    
    // Salva lockId immediatamente nel ref
    ;(isSubmittingRef as any).currentLockId = lockId
    
    console.log('🔵 [BookingForm] Submit click - Lock ID:', lockId)
    console.log('🔵 [BookingForm] Form data:', formData)
    console.log('🔵 [BookingForm] Privacy accepted:', privacyAccepted)
    
    // ✅ PROTEZIONE MULTI-LIVELLO CONTRO DOPPI SUBMIT
    // IMPORTANTE: Il lock globale è già acquisito, ora verifica gli altri controlli
    
    // 1. Controllo stato locale (protezione istanza componente - triggera re-render)
    if (isSubmitting) {
      console.warn('⚠️ [BookingForm] Submit già in corso (state lock), rilasciando lock e ignorando')
      releaseGlobalLock(lockId)
      return
    }
    
    // 2. Controllo ref locale (backup - per casi edge)
    if (isSubmittingRef.current) {
      console.warn('⚠️ [BookingForm] Submit già in corso (ref lock), rilasciando lock e ignorando')
      releaseGlobalLock(lockId)
      return
    }
    
    // 3. Controllo mutation state (protezione React Query)
    if (isPending) {
      console.warn('⚠️ [BookingForm] Mutation già in corso (mutation state), rilasciando lock e ignorando')
      releaseGlobalLock(lockId)
      return
    }

    // Check rate limit
    if (!checkRateLimit()) {
      releaseGlobalLock(lockId) // Rilascia lock se rate limit
      return
    }

    // Validazione
    if (!validate()) {
      releaseGlobalLock(lockId) // Rilascia lock se validazione fallisce
      return
    }

    // Imposta tutti i flag per prevenire doppi submit
    // IMPORTANTE: Imposta flag PRIMA di chiamare mutate
    isSubmittingRef.current = true
    setIsSubmitting(true) // Triggera re-render per disabilitare button immediatamente
    
    console.log('✅ [BookingForm] Validation passed, calling mutate...')
    console.log('🔵 [BookingForm] Lock state:', {
      lockId,
      globalLock: sessionStorage.getItem(GLOBAL_LOCK_KEY),
      refLock: isSubmittingRef.current,
      stateLock: isSubmitting,
      isPending
    })
    
    // Chiama mutate - il lock globale e la mutation lock prevengono doppi insert
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
            items: [],
            tiramisu_total: 0,
            tiramisu_kg: 0
          },
          dietary_restrictions: [],
          preset_menu: null
        })
        setSelectedPreset(null)
        setPrivacyAccepted(false)
        
        // Reset tutti i flag di submit e rilascia lock
        const savedLockId = (isSubmittingRef as any).currentLockId
        isSubmittingRef.current = false
        setIsSubmitting(false)
        if (savedLockId) {
          releaseGlobalLock(savedLockId)
        }
        
        // Mostra la modal di conferma invece del toast
        setShowSuccessModal(true)
        console.log('✅ [BookingForm] showSuccessModal set to true')
        onSubmit?.()
      },
      onError: (error) => {
        console.error('❌ [BookingForm] Mutation error:', error)
        // Reset tutti i flag in caso di errore per permettere nuovo tentativo
        const savedLockId = (isSubmittingRef as any).currentLockId
        isSubmittingRef.current = false
        setIsSubmitting(false)
        if (savedLockId) {
          releaseGlobalLock(savedLockId)
        }
      }
    })
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="w-full max-w-[55vw] mx-auto px-2 md:px-6 space-y-8 font-bold booking-form-mobile">
      {/* Sezione: Dati Personali */}
      <div className="space-y-6">
        <h2
          className="booking-section-title text-lg md:text-xl font-serif text-warm-wood mb-4 pb-3 border-b-2 border-warm-beige"
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
        <div className="space-y-3" style={{ paddingTop: '0.5rem' }}>
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
        <div className="space-y-3" style={{ paddingTop: '0.5rem' }}>
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
          className="booking-section-title text-lg md:text-xl font-serif text-warm-wood mb-4 pb-3 border-b-2 border-warm-beige"
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
        <div style={{ marginBottom: '0' }}>
          <label
            className="block text-base md:text-lg text-warm-wood mb-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(1px)',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'inline-block',
              fontWeight: '700',
              marginBottom: '0.5rem'
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
        <div className="space-y-3" style={{ paddingTop: '0.5rem' }}>
          <label
            htmlFor="desired_date"
            className="block text-base md:text-lg text-warm-wood mb-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(1px)',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'inline-block',
              fontWeight: '700',
              marginBottom: '0.5rem'
            }}
          >
            Data prenotazione *
          </label>
          <DateInput
            id="desired_date"
            value={formData.desired_date}
            onChange={(newDate) => {
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
            hasError={!!errors.desired_date}
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
        <div className="space-y-3" style={{ paddingTop: '0.5rem' }}>
          <label
            htmlFor="desired_time"
            className="block text-base md:text-lg text-warm-wood mb-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(1px)',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'inline-block',
              fontWeight: '700',
              marginBottom: '0.5rem'
            }}
          >
            Ora prenotazione *
          </label>
          <TimeInput
            id="desired_time"
            value={formData.desired_time || '00:00'}
            onChange={(newTime) => {
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
            hasError={!!errors.desired_time}
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
        <div className="space-y-3 guest-card-container" style={{ paddingTop: '0.5rem' }}>
          <div className="guest-card-mobile">
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
          </div>
          {errors.num_guests && (
            <p className="text-sm text-red-500">{errors.num_guests}</p>
          )}
        </div>

      </div>
      {/* Menu Selection - Solo per Rinfresco di Laurea */}
      {formData.booking_type === 'rinfresco_laurea' && (
        <div 
          id="menu-section" 
          className="space-y-6"
          style={{ paddingTop: '1.5rem', paddingBottom: '0', marginTop: '0', marginBottom: '0' }}
        >
          <MenuSelection
            selectedItems={formData.menu_selection?.items || []}
            numGuests={formData.num_guests || 0}
            bookingType={formData.booking_type}
            presetMenu={selectedPreset}
            onPresetMenuChange={handlePresetMenuChange}
            onMenuChange={({ items, totalPerPerson, tiramisuTotal, tiramisuKg }) => {
              const numGuests = formData.num_guests || 0
              const copertoTotal = 2.00 * numGuests
              // Mantieni preset_menu se gli items corrispondono ancora al preset
              const currentPreset = selectedPreset
              let updatedPreset: PresetMenuType = currentPreset
              
              // Verifica se gli items corrispondono ancora al preset selezionato
              if (currentPreset) {
                const preset = getPresetMenu(currentPreset)
                if (preset) {
                  const presetItemNames = preset.itemNames.sort()
                  const selectedItemNames = items.map(i => i.name).sort()
                  
                  // Se gli items non corrispondono più, rimuovi il preset
                  if (presetItemNames.length !== selectedItemNames.length || 
                      !presetItemNames.every((name, idx) => name === selectedItemNames[idx])) {
                    updatedPreset = null
                    setSelectedPreset(null)
                  }
                }
              }
              
              setFormData({
                ...formData,
                preset_menu: updatedPreset,
                menu_selection: {
                  items,
                  tiramisu_total: tiramisuTotal,
                  tiramisu_kg: tiramisuKg
                },
                menu_total_per_person: totalPerPerson,
                menu_total_booking: totalPerPerson * numGuests + copertoTotal + tiramisuTotal
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
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                id="privacy-consent"
                checked={privacyAccepted}
                onChange={(e) => {
                  setPrivacyAccepted(e.target.checked)
                  // Rimuovi errore quando viene selezionata
                  if (e.target.checked && errors.privacyAccepted) {
                    setErrors({ ...errors, privacyAccepted: '' })
                  }
                }}
                required
                className="peer sr-only"
              />
              <label
                htmlFor="privacy-consent"
                className={`flex h-5 w-5 cursor-pointer items-center justify-center border-2 shadow-sm transition-all duration-300 hover:shadow-md peer-checked:border-warm-orange peer-checked:shadow-lg peer-focus-visible:ring-4 peer-focus-visible:ring-warm-wood/20 ${
                  errors.privacyAccepted 
                    ? 'border-red-500 hover:border-red-600' 
                    : 'border-warm-wood/40 hover:border-warm-wood'
                }`}
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
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.85)', 
                backdropFilter: 'blur(1px)',
                padding: '8px 16px', 
                borderRadius: '12px',
                maxWidth: '600px' 
              }}
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
          {errors.privacyAccepted && (
            <p className="text-sm text-red-500 ml-8 mt-2">{errors.privacyAccepted}</p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center items-center mt-8 w-full">
        <button
            type="submit"
            disabled={isPending || isBlocked || isSubmitting}
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
            Richiesta di Prenotazione Inviata!
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
