import React, { useState } from 'react'
import { Input, Textarea } from '@/components/ui'
import { Link } from 'react-router-dom'
import { Plus, Trash2, X, Check } from 'lucide-react'
import { DIETARY_RESTRICTIONS, type DietaryRestrictionType } from '@/types/menu'

interface DietaryRestriction {
  restriction: string
  guest_count: number
  notes?: string
}

interface DietaryRestrictionsSectionProps {
  restrictions: DietaryRestriction[]
  onRestrictionsChange: (restrictions: DietaryRestriction[]) => void
  specialRequests: string
  onSpecialRequestsChange: (value: string) => void
  privacyAccepted: boolean
  onPrivacyChange: (value: boolean) => void
}

export const DietaryRestrictionsSection: React.FC<DietaryRestrictionsSectionProps> = ({
  restrictions,
  onRestrictionsChange,
  specialRequests,
  onSpecialRequestsChange,
  privacyAccepted,
  onPrivacyChange
}) => {
  const [selectedRestriction, setSelectedRestriction] = useState<DietaryRestrictionType | 'Altro'>('No Lattosio')
  const [guestCount, setGuestCount] = useState<number>(1)
  const [otherNotes, setOtherNotes] = useState<string>('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAdd = () => {
    if (guestCount < 1) {
      alert('Il numero di ospiti deve essere almeno 1')
      return
    }

    if (selectedRestriction === 'Altro' && !otherNotes.trim()) {
      alert('Inserisci una descrizione per "Altro"')
      return
    }

    // IMPORTANTE: guest_count qui è separato da num_guests della prenotazione.
    // Questo numero serve solo per associare quante persone hanno questa specifica intolleranza
    // e non viene sommato al totale ospiti della prenotazione.
    const newRestriction: DietaryRestriction = {
      restriction: selectedRestriction,
      guest_count: guestCount,
      notes: selectedRestriction === 'Altro' ? otherNotes.trim() : undefined
    }

    if (editingIndex !== null) {
      // Modifica esistente
      const updated = [...restrictions]
      updated[editingIndex] = newRestriction
      onRestrictionsChange(updated)
      setEditingIndex(null)
    } else {
      // Aggiungi nuovo
      onRestrictionsChange([...restrictions, newRestriction])
    }

    // Reset form
    setSelectedRestriction('No Lattosio')
    setGuestCount(1)
    setOtherNotes('')
  }

  const handleDelete = (index: number) => {
    const updated = restrictions.filter((_, i) => i !== index)
    onRestrictionsChange(updated)
    if (editingIndex === index) {
      setEditingIndex(null)
      setSelectedRestriction('No Lattosio')
      setGuestCount(1)
      setOtherNotes('')
    }
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setSelectedRestriction('No Lattosio')
    setGuestCount(1)
    setOtherNotes('')
  }

  return (
    <div className="space-y-6">
      {/* Titolo Sezione */}
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
        Intolleranze e Richieste Speciali
      </h2>

      {/* Form Aggiunta/Modifica */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-full">
          <div className="space-y-4">
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
                Intolleranza / Esigenza *
              </label>
              <select
                value={selectedRestriction}
                onChange={(e) => {
                  const value = e.target.value as DietaryRestrictionType | 'Altro'
                  setSelectedRestriction(value)
                  if (value !== 'Altro') {
                    setOtherNotes('')
                  }
                }}
                className="flex rounded-full border shadow-sm transition-all text-gray-600 w-full"
                style={{
                  borderColor: 'rgba(0,0,0,0.2)',
                  height: '56px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '700',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(1px)',
                  marginBottom: '15px'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8B6914'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.2)'}
              >
                {DIETARY_RESTRICTIONS.map((restriction) => (
                  <option key={restriction} value={restriction}>{restriction}</option>
                ))}
              </select>
            </div>

            {/* Campo Altro - appare subito sotto il dropdown */}
            {selectedRestriction === 'Altro' && (
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
                  Specifica intolleranza / esigenza *
                </label>
                <Input
                  value={otherNotes}
                  onChange={(e) => setOtherNotes(e.target.value)}
                  placeholder="Descrivi l'intolleranza o esigenza"
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div style={{ marginTop: '15px' }} className="guest-card-container">
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
              Numero ospiti con intolleranze alimentari *
            </label>
            <div className="guest-card-mobile">
              <Input
                type="number"
                min="1"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center justify-center gap-3 text-lg text-white rounded-full bg-green-600 hover:bg-green-700 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-500/30"
            style={{ fontWeight: '700', backgroundColor: '#16a34a', paddingTop: '20px', paddingBottom: '20px', paddingLeft: '40px', paddingRight: '40px' }}
          >
            <Plus className="h-5 w-5" />
            {editingIndex !== null ? 'Salva Modifiche' : 'Aggiungi'}
          </button>
          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 border-2 border-warm-wood text-warm-wood rounded-full bg-transparent hover:bg-warm-wood hover:text-white shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-warm-wood/30"
              style={{ fontWeight: '600' }}
            >
              <X className="h-4 w-4" />
              Annulla
            </button>
          )}
        </div>

        <p
          className="text-xs text-gray-700 mt-2"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(1px)',
            padding: '8px 16px',
            borderRadius: '12px',
            display: 'inline-block',
            fontWeight: '600'
          }}
        >
          Nota: Questo numero è solo per associare l'intolleranza specifica e non viene sommato al totale ospiti della prenotazione.
        </p>
      </div>

      {/* Lista Recap */}
      {restrictions.length > 0 && (
        <div>
          <h3
            className="text-lg md:text-xl text-gray-800 mb-4"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(1px)',
              padding: '8px 16px',
              borderRadius: '12px',
              fontWeight: '700'
            }}
          >
            Intolleranze inserite:
          </h3>
          <div className="space-y-4">
          {restrictions.map((restriction, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-start md:items-center gap-4 p-8 rounded-xl border-2 border-warm-beige hover:shadow-md transition-all w-full"
              style={{
                padding: '28px 32px',
                borderRadius: '16px',
                marginBottom: '4px',
                minHeight: '64px',
                maxWidth: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(6px)'
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-1 min-w-0">
                <span className="font-bold text-gray-900 text-base md:text-lg" style={{ wordBreak: 'break-word', fontWeight: '700' }}>{restriction.restriction}</span>
                {restriction.restriction === 'Altro' && restriction.notes && (
                  <span className="text-sm md:text-base font-bold text-gray-600 italic" style={{ wordBreak: 'break-word', fontWeight: '700' }}>({restriction.notes})</span>
                )}
                <span className="text-warm-wood font-bold text-base md:text-lg" style={{ fontWeight: '700' }}>
                  {restriction.guest_count} {restriction.guest_count === 1 ? 'ospite' : 'ospiti'}
                </span>
              </div>
              <div className="flex gap-3 md:ml-auto flex-shrink-0 w-full md:w-auto justify-end md:justify-start">
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="p-2.5 border-2 border-terracotta text-terracotta rounded-lg bg-white hover:bg-terracotta hover:text-white shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Note o Richieste Speciali */}
      <div className="space-y-3 mt-10" style={{ marginTop: '40px' }}>
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
          Altre Richieste
        </label>
        <Textarea
          id="special_requests"
          value={specialRequests}
          onChange={(e) => onSpecialRequestsChange(e.target.value)}
          rows={4}
          placeholder="Inserisci eventuali richieste particolari..."
          className="w-full"
        />
      </div>

      {/* Privacy Policy */}
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <input
            type="checkbox"
            id="privacy-consent-dietary"
            checked={privacyAccepted}
            onChange={(e) => onPrivacyChange(e.target.checked)}
            required
            className="peer sr-only"
          />
          <label
            htmlFor="privacy-consent-dietary"
            className="flex h-5 w-5 cursor-pointer items-center justify-center border-2 border-warm-wood/40 shadow-sm transition-all duration-300 hover:border-warm-wood hover:shadow-md peer-checked:border-warm-orange peer-checked:shadow-lg peer-focus-visible:ring-4 peer-focus-visible:ring-warm-wood/20"
            style={{ backgroundColor: privacyAccepted ? '#D2691E' : 'white' }}
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
          htmlFor="privacy-consent-dietary"
          className="cursor-pointer text-sm text-gray-700"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '8px 16px', borderRadius: '8px', backdropFilter: 'blur(1px)' }}
        >
          Accetto la{' '}
          <Link
            to="/privacy"
            target="_blank"
            className="text-al-ritrovo-primary hover:text-al-ritrovo-primary-dark underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Privacy Policy
          </Link>
          {' '}*
        </label>
      </div>

      {/* Campi obbligatori */}
      <p className="text-xs text-gray-500 italic">
        * I campi contrassegnati sono obbligatori
      </p>
    </div>
  )
}


