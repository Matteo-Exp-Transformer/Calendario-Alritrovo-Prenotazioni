import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui'
import type { BookingRequestInput } from '@/types/booking'
import { useCreateAdminBooking } from '../hooks/useAdminBookingRequests'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Send, Loader2 } from 'lucide-react'
import { MenuSelection } from './MenuSelection'
import { DietaryRestrictionsSection } from './DietaryRestrictionsSection'
import { useMenuItems } from '../hooks/useMenuItems'
import { getPresetMenu, type PresetMenuType } from '../constants/presetMenus'

interface AdminBookingFormProps {
  onSubmit?: () => void
}

export const AdminBookingForm: React.FC<AdminBookingFormProps> = ({ onSubmit }) => {
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
    dietary_restrictions: [],
    preset_menu: null
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedPreset, setSelectedPreset] = useState<PresetMenuType>(null)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  const { mutate, isPending } = useCreateAdminBooking()
  const queryClient = useQueryClient()
  const { data: menuItems = [] } = useMenuItems()

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

  // Gestione selezione menu predefinito
  const handlePresetMenuChange = (presetType: PresetMenuType) => {
    setSelectedPreset(presetType)
    
    if (!presetType) {
      // Reset menu se nessun preset
      setFormData({
        ...formData,
        preset_menu: null,
        menu_selection: { items: [] },
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
      
      // Match parziale (uno contiene l'altro)
      if (normalizedItem.includes(normalizedPreset) || normalizedPreset.includes(normalizedItem)) return true
      
      // Match per "Caraffe/Drink" - cerca varianti comuni
      if (normalizeName(presetName).includes('caraffe') && normalizeName(presetName).includes('drink')) {
        const hasCaraffe = normalizedItem.includes('caraffe')
        const hasDrink = normalizedItem.includes('drink')
        const hasPremium = normalizedItem.includes('premium')
        const presetHasPremium = normalizedPreset.includes('premium')
        
        // Se il preset è Caraffe/Drink (non premium) e l'item è Caraffe/Drink (non premium)
        if (!presetHasPremium && hasCaraffe && hasDrink && !hasPremium) return true
        
        // Se il preset è Caraffe/Drink Premium e l'item è Premium
        if (presetHasPremium && hasCaraffe && hasDrink && hasPremium) return true
      }
      
      return false
    }

    // Trova gli items nel database per nome (matching flessibile)
    const selectedItems = menuItems
      .filter(item => {
        const matches = preset.itemNames.some(presetName => matchesName(item.name, presetName))
        
        // Log per debug Caraffe/Drink
        if (matches && (normalizeName(item.name).includes('caraffe') || normalizeName(item.name).includes('drink'))) {
          console.log('✅ [AdminBookingForm] Trovato Caraffe/Drink:', item.name, 'match con preset:', presetType)
        }
        
        return matches
      })
      .map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category
      }))

    console.log('🔵 [AdminBookingForm] Preset selezionato:', presetType)
    console.log('🔵 [AdminBookingForm] Items nel preset:', preset.itemNames)
    console.log('🔵 [AdminBookingForm] Items trovati e selezionati:', selectedItems.map(i => `${i.name} (${i.id})`))

    // Calcola totale
    const totalPerPerson = selectedItems.reduce((sum, item) => sum + item.price, 0)
    const numGuests = formData.num_guests || 0

    setFormData({
      ...formData,
      preset_menu: presetType,
      menu_selection: { items: selectedItems },
      menu_total_per_person: totalPerPerson,
      menu_total_booking: totalPerPerson * numGuests
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

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    mutate(formData, {
      onSuccess: () => {
        toast.success('Prenotazione creata con successo!')
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
          dietary_restrictions: [],
          preset_menu: null
        })
        setSelectedPreset(null)
        setErrors({})
        
        // Invalidate and refetch all booking-related queries
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
        queryClient.invalidateQueries({ queryKey: ['booking-stats'] })
        queryClient.invalidateQueries({ queryKey: ['pending-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['accepted-bookings'] })
        
        onSubmit?.()
      },
      onError: (error) => {
        console.error('Error creating booking:', error)
        toast.error('Errore nella creazione della prenotazione')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Layout a 2 Colonne su schermi grandi */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* COLONNA SINISTRA: Dati Personali */}
        <div className="space-y-6">
          <h2
            className="text-3xl font-serif font-bold text-warm-wood mb-4 pb-3 border-b-2 border-warm-beige"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(6px)',
              padding: '12px 20px',
              borderRadius: '12px'
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

        {/* COLONNA DESTRA: Dettagli Prenotazione */}
        <div className="space-y-6">
          <h2
            className="text-3xl font-serif font-bold text-warm-wood mb-4 pb-3 border-b-2 border-warm-beige"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(6px)',
              padding: '12px 20px',
              borderRadius: '12px'
            }}
          >
            Dettagli Prenotazione
          </h2>

          {/* Tipologia di Prenotazione - DROPDOWN */}
          <div className="space-y-3">
            <label
              className="block text-sm font-medium text-warm-wood mb-2"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(6px)',
                padding: '8px 16px',
                borderRadius: '12px',
                display: 'inline-block'
              }}
            >
              Tipologia di Prenotazione *
            </label>
            <select
              id="booking_type"
              value={formData.booking_type}
              onChange={(e) => {
                setFormData({ ...formData, booking_type: e.target.value as 'tavolo' | 'rinfresco_laurea' })
                setErrors({ ...errors, booking_type: '' })
              }}
              className="block rounded-full border bg-white/50 backdrop-blur-[6px] shadow-sm transition-all"
              style={{
                borderColor: 'rgba(0,0,0,0.2)',
                height: '56px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(6px)',
                color: 'black',
                width: 'auto',
                minWidth: '280px'
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

          {/* Menu Predefinito - Solo per Rinfresco di Laurea */}
          {formData.booking_type === 'rinfresco_laurea' && (
            <div className="space-y-3">
              <label
                className="block text-sm font-medium text-warm-wood mb-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(6px)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  display: 'inline-block'
                }}
              >
                Menu Predefinito
              </label>
              <select
                id="preset_menu"
                value={selectedPreset || ''}
                onChange={(e) => {
                  const value = e.target.value
                  handlePresetMenuChange(value === '' ? null : (value as Exclude<PresetMenuType, null>))
                }}
                className="block rounded-full border bg-white/50 backdrop-blur-[6px] shadow-sm transition-all"
                style={{
                  borderColor: 'rgba(0,0,0,0.2)',
                  height: '56px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '500',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(6px)',
                  color: 'black',
                  width: 'auto',
                  minWidth: '280px'
                }}
                onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#8B6914'}
                onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = 'rgba(0,0,0,0.2)'}
              >
                <option value="">Scegli un menu predefinito</option>
                <option value="menu_1">Menù 1</option>
                <option value="menu_2">Menù 2</option>
                <option value="menu_3">Menù 3</option>
              </select>
            </div>
          )}

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
              value={formData.desired_time || ''}
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
      </div>

      {/* Menu Selection - Solo per Rinfresco di Laurea */}
      {formData.booking_type === 'rinfresco_laurea' && (
        <div className="space-y-6">
          <MenuSelection
            selectedItems={formData.menu_selection?.items || []}
            onMenuChange={(items, totalPerPerson) => {
              const numGuests = formData.num_guests || 0
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
      {formData.booking_type === 'rinfresco_laurea' && (
        <div className="space-y-6">
          <DietaryRestrictionsSection
            restrictions={formData.dietary_restrictions || []}
            onRestrictionsChange={(restrictions) => {
              setFormData({
                ...formData,
                dietary_restrictions: restrictions
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

      {/* Nota campi obbligatori e Submit Button */}
      <div className="flex items-center justify-between gap-4 mt-4">
        <p
          className="text-xs text-gray-600"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(6px)',
            padding: '8px 16px',
            borderRadius: '12px',
            display: 'inline-block'
          }}
        >
          * I campi contrassegnati sono obbligatori.
        </p>
        <div className="flex justify-center flex-1">
          <button
            type="submit"
            disabled={isPending}
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
                  <span className="text-sm md:text-base">Creazione in corso...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">Crea Prenotazione</span>
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
      </div>
    </form>
  )
}
