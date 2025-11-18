import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Edit, Trash2, Save } from 'lucide-react'
import { useUpdateBooking, useCancelBooking } from '../hooks/useBookingMutations'
import { useAcceptedBookings } from '../hooks/useBookingQueries'
import type { BookingRequest } from '@/types/booking'
import { extractDateFromISO, extractTimeFromISO, createBookingDateTime } from '../utils/dateUtils'
import { getSlotsOccupiedByBooking } from '../utils/capacityCalculator'
import { CAPACITY_CONFIG } from '../constants/capacity'
import { toast } from 'react-toastify'
import { DetailsTab } from './DetailsTab'
import { MenuTab } from './MenuTab'
import { DietaryTab } from './DietaryTab'
import type { SelectedMenuItem } from '@/types/menu'

interface BookingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingRequest
}

type TabId = 'details' | 'menu' | 'dietary'

interface Tab {
  id: TabId
  label: string
  icon: string
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {

  const [isEditMode, setIsEditMode] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showTypeChangeWarning, setShowTypeChangeWarning] = useState(false)
  const [pendingBookingType, setPendingBookingType] = useState<'tavolo' | 'rinfresco_laurea'>('tavolo')
  const [activeTab, setActiveTab] = useState<TabId>('details')
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)

  // Responsive width calculation
  const getResponsiveMaxWidth = () => {
    if (typeof window === 'undefined') return '28rem' // SSR fallback

    const width = window.innerWidth

    // Mobile: full width (< 640px)
    if (width < 640) return '100%'

    // Tablet: 90% width (640px - 1024px)
    if (width < 1024) return '90%'

    // Desktop: large modal (>= 1024px)
    return '56rem' // 896px (max-w-4xl in Tailwind)
  }

  const [modalMaxWidth, setModalMaxWidth] = useState(getResponsiveMaxWidth())

  // Update maxWidth on window resize
  useEffect(() => {
    const handleResize = () => {
      setModalMaxWidth(getResponsiveMaxWidth())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const updateMutation = useUpdateBooking()
  const cancelMutation = useCancelBooking()
  const { data: acceptedBookings = [] } = useAcceptedBookings()

  // Initialize form data from booking
  const [formData, setFormData] = useState(() => {
    try {
      const startTime = booking.desired_time
        ? booking.desired_time.split(':').slice(0, 2).join(':')
        : extractTimeFromISO(booking.confirmed_start || '')

      let endTime: string
      if (booking.desired_time) {
        const [hours, minutes] = booking.desired_time.split(':').map(Number)
        const endHours = (hours + 3) % 24
        endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      } else {
        endTime = extractTimeFromISO(booking.confirmed_end || '')
      }

      return {
        booking_type: (booking.booking_type || 'tavolo') as 'tavolo' | 'rinfresco_laurea',
        client_name: booking.client_name || '',
        client_email: booking.client_email || '',
        client_phone: booking.client_phone || '',
        date: extractDateFromISO(booking.confirmed_start || booking.desired_date || ''),
        startTime,
        endTime,
        numGuests: booking.num_guests || 0,
        specialRequests: booking.special_requests || '',
        menu_selection: booking.menu_selection,
        dietary_restrictions: booking.dietary_restrictions || [],
        preset_menu: booking.preset_menu
      }
    } catch (error) {
      console.error('[BookingDetailsModal] Error initializing form data:', error)
      // Return default values if initialization fails
      return {
        booking_type: 'tavolo' as 'tavolo' | 'rinfresco_laurea',
        client_name: booking.client_name || '',
        client_email: booking.client_email || '',
        client_phone: booking.client_phone || '',
        date: '',
        startTime: '12:00',
        endTime: '15:00',
        numGuests: booking.num_guests || 0,
        specialRequests: booking.special_requests || '',
        menu_selection: booking.menu_selection,
        dietary_restrictions: booking.dietary_restrictions || [],
        preset_menu: booking.preset_menu
      }
    }
  })

  // Update form data when booking changes
  useEffect(() => {
    try {
      const startTime = booking.desired_time
        ? booking.desired_time.split(':').slice(0, 2).join(':')
        : extractTimeFromISO(booking.confirmed_start || '')

      let endTime: string
      if (booking.desired_time) {
        const [hours, minutes] = booking.desired_time.split(':').map(Number)
        const endHours = (hours + 3) % 24
        endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      } else {
        endTime = extractTimeFromISO(booking.confirmed_end || '')
      }

      setFormData({
        booking_type: (booking.booking_type || 'tavolo') as 'tavolo' | 'rinfresco_laurea',
        client_name: booking.client_name || '',
        client_email: booking.client_email || '',
        client_phone: booking.client_phone || '',
        date: extractDateFromISO(booking.confirmed_start || booking.desired_date || ''),
        startTime,
        endTime,
        numGuests: booking.num_guests || 0,
        specialRequests: booking.special_requests || '',
        menu_selection: booking.menu_selection,
        dietary_restrictions: booking.dietary_restrictions || [],
        preset_menu: booking.preset_menu
      })
    } catch (error) {
      console.error('[BookingDetailsModal] Error updating form data:', error)
    }
  }, [booking])

  // Dynamic tabs based on booking_type
  const tabs = useMemo<Tab[]>(() => {
    const baseTabs: Tab[] = [
      { id: 'details', label: 'Dettagli', icon: '📋' }
    ]

    if (formData.booking_type === 'rinfresco_laurea') {
      baseTabs.push(
        { id: 'menu', label: 'Menu e Prezzi', icon: '🍽️' },
        { id: 'dietary', label: 'Intolleranze e Note', icon: '⚠️' }
      )
    }

    return baseTabs
  }, [formData.booking_type])

  // Auto-reset active tab if no longer available
  useEffect(() => {
    const tabExists = tabs.some(t => t.id === activeTab)
    if (!tabExists) {
      setActiveTab('details')
    }
  }, [tabs, activeTab])

  // Auto-expand menu in edit mode
  useEffect(() => {
    if (isEditMode && activeTab === 'menu') {
      setIsMenuExpanded(true)
    }
  }, [isEditMode, activeTab])

  // Capacity check function
  const checkCapacity = (date: string, startTime: string, endTime: string, numGuests: number): boolean => {
    const dayBookings = acceptedBookings.filter((b) => {
      if (b.id === booking.id) return false
      if (!b.confirmed_start) return false
      const bookingDate = extractDateFromISO(b.confirmed_start)
      return bookingDate === date
    })

    const confirmedStart = `${date}T${startTime}:00`
    const confirmedEnd = `${date}T${endTime}:00`
    const newBookingSlots = getSlotsOccupiedByBooking(confirmedStart, confirmedEnd)
    
    const morning = { capacity: CAPACITY_CONFIG.MORNING_CAPACITY, occupied: 0 }
    const afternoon = { capacity: CAPACITY_CONFIG.AFTERNOON_CAPACITY, occupied: 0 }
    const evening = { capacity: CAPACITY_CONFIG.EVENING_CAPACITY, occupied: 0 }

    for (const existingBooking of dayBookings) {
      if (!existingBooking.confirmed_start || !existingBooking.confirmed_end) continue
      
      const slots = getSlotsOccupiedByBooking(existingBooking.confirmed_start, existingBooking.confirmed_end)
      const guests = existingBooking.num_guests || 0

      for (const slot of slots) {
        if (slot === 'morning') morning.occupied += guests
        else if (slot === 'afternoon') afternoon.occupied += guests
        else if (slot === 'evening') evening.occupied += guests
      }
    }

    for (const slot of newBookingSlots) {
      let available: number
      
      if (slot === 'morning') {
        available = morning.capacity - morning.occupied
      } else if (slot === 'afternoon') {
        available = afternoon.capacity - afternoon.occupied
      } else if (slot === 'evening') {
        available = evening.capacity - evening.occupied
      } else {
        continue
      }

      if (available < numGuests) {
        return false
      }
    }

    return true
  }

  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBookingTypeChange = (newType: 'tavolo' | 'rinfresco_laurea') => {
    if (formData.booking_type === 'rinfresco_laurea' && newType === 'tavolo') {
      setShowTypeChangeWarning(true)
      setPendingBookingType(newType)
    } else {
      setFormData(prev => ({ ...prev, booking_type: newType }))
    }
  }

  const confirmBookingTypeChange = () => {
    setFormData(prev => ({
      ...prev,
      booking_type: pendingBookingType,
      menu_selection: undefined,
      dietary_restrictions: [],
      preset_menu: undefined
    }))
    setShowTypeChangeWarning(false)
    setActiveTab('details')
  }

  const handleMenuChange = (payload: {
    items: SelectedMenuItem[]
    totalPerPerson: number
    tiramisuTotal: number
    tiramisuKg: number
  }) => {
    setFormData(prev => ({
      ...prev,
      menu_selection: {
        items: payload.items,
        tiramisu_total: payload.tiramisuTotal,
        tiramisu_kg: payload.tiramisuKg
      }
    }))
  }

  const handleSave = () => {
    if (!booking.confirmed_start) return

    // Validation
    if (!formData.client_name || formData.client_name.length < 2) {
      toast.error('Il nome deve contenere almeno 2 caratteri')
      return
    }

    if (!formData.client_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      toast.error('Inserisci un indirizzo email valido')
      return
    }

    if (formData.numGuests < 1 || formData.numGuests > 110) {
      toast.error('Il numero di ospiti deve essere tra 1 e 110')
      return
    }

    const confirmedStart = createBookingDateTime(formData.date, formData.startTime, true)
    const confirmedEnd = createBookingDateTime(formData.date, formData.endTime, false, formData.startTime)

    // Check capacity
    const hasCapacity = checkCapacity(formData.date, formData.startTime, formData.endTime, formData.numGuests)
    
    if (!hasCapacity) {
      toast.error(`❌ Posti non disponibili! La modifica richiede ${formData.numGuests} posti ma non ci sono abbastanza posti liberi nella fascia oraria selezionata.`)
      return
    }

    // Calculate menu totals if rinfresco_laurea
    let menuTotalPerPerson = undefined
    let menuTotalBooking = undefined
    if (formData.booking_type === 'rinfresco_laurea' && formData.menu_selection) {
      const baseTotal = formData.menu_selection.items
        .filter((item) => !item.name.toLowerCase().includes('tiramis'))
        .reduce((sum, item) => sum + item.price, 0)
      const tiramisuTotal = formData.menu_selection.tiramisu_total || 0
      menuTotalPerPerson = baseTotal
      menuTotalBooking = baseTotal * formData.numGuests + tiramisuTotal
    }

    updateMutation.mutate(
      {
        bookingId: booking.id,
        booking_type: formData.booking_type,
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone || undefined,
        confirmedStart,
        confirmedEnd,
        numGuests: formData.numGuests,
        specialRequests: formData.specialRequests,
        desiredTime: formData.startTime,
        menu_selection: formData.booking_type === 'rinfresco_laurea' ? formData.menu_selection : undefined,
        menu_total_per_person: menuTotalPerPerson,
        menu_total_booking: menuTotalBooking,
        dietary_restrictions: formData.booking_type === 'rinfresco_laurea' ? formData.dietary_restrictions : undefined,
        preset_menu: formData.booking_type === 'rinfresco_laurea' ? formData.preset_menu : undefined
      },
      {
        onSuccess: () => {
          setIsEditMode(false)
          toast.success('Prenotazione modificata con successo!')
        },
        onError: (error) => {
          console.error('❌ [BookingDetailsModal] Save failed:', error)
        },
      }
    )
  }

  const handleCancelBooking = () => {
    cancelMutation.mutate(
      {
        bookingId: booking.id,
        cancellationReason: 'Cancellato dall\'amministratore',
      },
      {
        onSuccess: () => {
          setShowCancelConfirm(false)
          onClose()
        },
      }
    )
  }

  if (!isOpen) {
    return null
  }

  const modalContent = (
    <>
      {/* Main Modal */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '100%',
            maxWidth: modalMaxWidth,
            backgroundColor: '#fef3c7',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Sticky */}
          <div className="bg-blue-50 border-b-2 border-blue-200 px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Dettagli Prenotazione
                </h2>
                <p className="text-sm text-gray-600">
                  #{booking.id.slice(0, 8)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-all hover:scale-110 shadow-sm border border-gray-300 bg-white sm:h-10 sm:w-10 max-sm:h-11 max-sm:w-11"
                aria-label="Chiudi dettagli prenotazione"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✓ Confermata
              </span>
            </div>
          </div>

          {/* Tab Navigation - Sticky */}
          <div className="bg-white border-b-2 border-gray-200 px-2 py-2 flex-shrink-0">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] flex items-center justify-center gap-1 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div
            className="flex-1 overflow-y-auto py-4 bg-amber-100"
            style={{ paddingLeft: '24px', paddingRight: '24px' }}
          >
            {activeTab === 'details' && (
              <DetailsTab
                booking={booking}
                isEditMode={isEditMode}
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onBookingTypeChange={handleBookingTypeChange}
              />
            )}

            {activeTab === 'menu' && formData.booking_type === 'rinfresco_laurea' && (
              <MenuTab
                booking={booking}
                isEditMode={isEditMode}
                menuSelection={formData.menu_selection}
                numGuests={formData.numGuests}
                presetMenu={formData.preset_menu}
                isMenuExpanded={isMenuExpanded}
                onMenuExpandToggle={() => setIsMenuExpanded(!isMenuExpanded)}
                onMenuChange={handleMenuChange}
              />
            )}

            {activeTab === 'dietary' && formData.booking_type === 'rinfresco_laurea' && (
              <DietaryTab
                booking={booking}
                isEditMode={isEditMode}
                dietaryRestrictions={formData.dietary_restrictions}
                specialRequests={formData.specialRequests}
                onDietaryRestrictionsChange={(restrictions) => handleFormDataChange('dietary_restrictions', restrictions)}
                onSpecialRequestsChange={(value) => handleFormDataChange('specialRequests', value)}
              />
            )}
          </div>

          {/* Footer Actions - Sticky */}
          {!showCancelConfirm && (
            <div className="border-t-2 border-gray-200 p-3 bg-amber-100 flex-shrink-0">
              <div className="flex gap-3">
                {isEditMode ? (
                  <>
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all shadow hover:shadow-md flex items-center justify-center gap-2 font-semibold text-base"
                    >
                      <X className="h-5 w-5" />
                      Annulla
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-6 py-3 bg-al-ritrovo-primary text-white rounded-lg hover:bg-al-ritrovo-primary-dark transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 font-semibold text-base"
                      disabled={updateMutation.isPending}
                    >
                      <Save className="h-5 w-5" />
                      {updateMutation.isPending ? 'Salvataggio...' : 'Salva'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="flex-1 px-6 py-3 bg-blue-400 text-white rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold text-base min-h-[56px]"
                    >
                      <Edit className="h-5 w-5" />
                      Modifica
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold text-base min-h-[56px]"
                    >
                      <Trash2 className="h-5 w-5" />
                      Elimina
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Type Change Warning Modal */}
      {showTypeChangeWarning && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/75" onClick={() => setShowTypeChangeWarning(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border-2 border-gray-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Attenzione!</h3>
                <p className="text-sm text-gray-600 mt-1">Cambio tipo prenotazione</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 font-medium">
                Cambiando il tipo di prenotazione a "Tavolo", i seguenti dati verranno rimossi:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                <li>Menu selezionato</li>
                <li>Intolleranze e allergie</li>
              </ul>
              <p className="text-sm text-yellow-800 font-medium mt-2">
                Sei sicuro di voler procedere?
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowTypeChangeWarning(false)}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                Annulla
              </button>
              <button
                onClick={confirmBookingTypeChange}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/75" onClick={() => setShowCancelConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border-2 border-gray-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Conferma Cancellazione</h3>
                <p className="text-sm text-gray-600 mt-1">Questa azione non può essere annullata</p>
              </div>
            </div>
            
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ <strong>Attenzione!</strong> Stai per cancellare questa prenotazione.
              </p>
              <p className="text-sm text-red-700 mt-2">
                Questa azione non può essere annullata e il cliente riceverà una notifica email.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-6 py-4 bg-green-600 text-white hover:bg-green-700 font-bold text-lg rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <X className="h-5 w-5" />
                Annulla
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-6 py-4 bg-red-600 text-white hover:bg-red-700 font-bold text-lg rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={cancelMutation.isPending}
              >
                <Trash2 className="h-5 w-5" />
                {cancelMutation.isPending ? 'Cancellazione...' : 'Conferma'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return createPortal(modalContent, document.body)
}
