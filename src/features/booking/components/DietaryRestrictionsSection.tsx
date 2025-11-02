import React, { useState } from 'react'
import { Input } from '@/components/ui'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { DIETARY_RESTRICTIONS, type DietaryRestrictionType } from '@/types/menu'

interface DietaryRestriction {
  restriction: string
  guest_count: number
  notes?: string
}

interface DietaryRestrictionsSectionProps {
  restrictions: DietaryRestriction[]
  onRestrictionsChange: (restrictions: DietaryRestriction[]) => void
}

export const DietaryRestrictionsSection: React.FC<DietaryRestrictionsSectionProps> = ({
  restrictions,
  onRestrictionsChange
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
        Intolleranze Alimentari
      </h2>

      {/* Form Aggiunta/Modifica */}
      <div className="bg-gradient-to-br from-warm-cream-60 via-warm-cream-40 to-transparent border-2 border-warm-beige rounded-xl p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero ospiti con intolleranze alimentari *
            </label>
            <Input
              type="number"
              min="1"
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nota: Questo numero è solo per associare l'intolleranza specifica e non viene sommato al totale ospiti della prenotazione.
            </p>
          </div>
        </div>
        {selectedRestriction === 'Altro' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800">Intolleranze inserite:</h3>
          {restrictions.map((restriction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-br from-warm-cream-60 via-warm-cream-40 to-transparent rounded-lg border-2 border-warm-beige hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">{restriction.restriction}</span>
                  {restriction.restriction === 'Altro' && restriction.notes && (
                    <span className="text-sm text-gray-600 italic">({restriction.notes})</span>
                  )}
                  <span className="text-warm-wood font-bold">
                    {restriction.guest_count} {restriction.guest_count === 1 ? 'ospite' : 'ospiti'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
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
      )}
    </div>
  )
}

