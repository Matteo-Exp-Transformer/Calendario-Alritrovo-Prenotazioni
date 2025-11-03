import React, { useState } from 'react'
import { Input, Textarea } from '@/components/ui'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, X, Check } from 'lucide-react'
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

  const handleEdit = (index: number) => {
    const restriction = restrictions[index]
    setSelectedRestriction(restriction.restriction as DietaryRestrictionType | 'Altro')
    setGuestCount(restriction.guest_count)
    setOtherNotes(restriction.notes || '')
    setEditingIndex(index)
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
        className="text-3xl font-serif font-bold text-warm-wood mb-4 pb-3 border-b-2 border-warm-beige"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(6px)',
          padding: '12px 20px',
          borderRadius: '12px'
        }}
      >
        Intolleranze e Richieste Speciali
      </h2>

      {/* Form Aggiunta/Modifica */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-full">
          <div>
            <label 
              className="block text-sm font-bold text-warm-wood mb-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(6px)',
                padding: '8px 16px',
                borderRadius: '12px',
                display: 'inline-block',
                fontWeight: '700',
                marginBottom: '16px'
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
              className="flex rounded-full border bg-white/50 backdrop-blur-[6px] shadow-sm transition-all text-gray-600 w-full"
              style={{ 
                borderColor: 'rgba(0,0,0,0.2)', 
                height: '56px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '700',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(6px)'
              }}
              onFocus={(e) => e.target.style.borderColor = '#8B6914'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.2)'}
            >
              {DIETARY_RESTRICTIONS.map((restriction) => (
                <option key={restriction} value={restriction}>{restriction}</option>
              ))}
            </select>
          </div>
          <div>
            <label 
              className="block text-sm font-bold text-warm-wood mb-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(6px)',
                padding: '8px 16px',
                borderRadius: '12px',
                display: 'inline-block',
                fontWeight: '700',
                marginBottom: '16px'
              }}
            >
              Numero ospiti con intolleranze alimentari *
            </label>
            <Input
              type="number"
              min="1"
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
              className="w-full"
            />
            <p 
              className="text-xs text-gray-700 mt-2"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(6px)',
                padding: '8px 16px',
                borderRadius: '12px',
                display: 'inline-block',
                fontWeight: '600'
              }}
            >
              Nota: Questo numero è solo per associare l'intolleranza specifica e non viene sommato al totale ospiti della prenotazione.
            </p>
          </div>
        </div>
        {selectedRestriction === 'Altro' && (
          <div>
            <label 
              className="block text-sm font-bold text-warm-wood mb-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(6px)',
                padding: '8px 16px',
                borderRadius: '12px',
                display: 'inline-block',
                fontWeight: '700',
                marginBottom: '16px'
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
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 text-white font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-500/30"
            style={{
              backgroundColor: '#22c55e',
              borderRadius: '50px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#16a34a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#22c55e'
            }}
          >
            <Plus className="h-4 w-4" />
            {editingIndex !== null ? 'Salva Modifiche' : 'Aggiungi'}
          </button>
          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 border-2 border-warm-wood text-warm-wood font-semibold rounded-xl transition-all duration-300 hover:bg-warm-wood hover:text-white focus:outline-none focus:ring-4 focus:ring-warm-wood/30"
            >
              <X className="h-4 w-4" />
              Annulla
            </button>
          )}
        </div>
      </div>

      {/* Lista Recap */}
      {restrictions.length > 0 && (
        <div>
          <h3
            className="text-lg font-bold text-gray-800 mb-4"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(6px)',
              padding: '12px 20px',
              borderRadius: '12px'
            }}
          >
            Intolleranze inserite:
          </h3>
          <div className="space-y-4">
          {restrictions.map((restriction, index) => (
            <div
              key={index}
              className="flex items-center gap-6 p-8 bg-gradient-to-br from-warm-cream-60 via-warm-cream-40 to-transparent rounded-xl border-2 border-warm-beige hover:shadow-md transition-all"
              style={{
                minHeight: '64px'
              }}
            >
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="font-bold text-gray-900">{restriction.restriction}</span>
                {restriction.restriction === 'Altro' && restriction.notes && (
                  <span className="text-sm font-bold text-gray-600 italic">({restriction.notes})</span>
                )}
                <span className="text-warm-wood font-bold">
                  {restriction.guest_count} {restriction.guest_count === 1 ? 'ospite' : 'ospiti'}
                </span>
              </div>
              <div className="flex gap-3 ml-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  className="p-2 border-2 border-warm-wood text-warm-wood rounded-lg hover:bg-warm-wood hover:text-white transition-all focus:outline-none focus:ring-4 focus:ring-warm-wood/30"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="p-2 border-2 border-terracotta text-terracotta rounded-lg hover:bg-terracotta hover:text-white transition-all focus:outline-none focus:ring-4 focus:ring-terracotta/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Note o Richieste Speciali */}
      <div className="space-y-3 mt-6">
        <label 
          className="block text-sm font-bold text-warm-wood mb-4"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(6px)',
            padding: '8px 16px',
            borderRadius: '12px',
            display: 'inline-block',
            fontWeight: '700',
            marginBottom: '16px'
          }}
        >
          Note o richieste speciali
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
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: '8px 16px', borderRadius: '8px', backdropFilter: 'blur(4px)' }}
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

