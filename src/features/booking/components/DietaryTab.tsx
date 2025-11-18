import React from 'react'
import type { BookingRequest } from '@/types/booking'

interface Props {
  booking: BookingRequest
  isEditMode: boolean
  dietaryRestrictions: Array<{
    restriction: string
    guest_count: number
    notes?: string
  }>
  specialRequests: string
  onDietaryRestrictionsChange: (restrictions: Array<{restriction: string, guest_count: number, notes?: string}>) => void
  onSpecialRequestsChange: (value: string) => void
}

const DIETARY_RESTRICTIONS_OPTIONS = [
  'No Lattosio',
  'Vegano',
  'Vegetariano',
  'No Glutine',
  'No Frutta secca',
  'Altro'
]

export const DietaryTab: React.FC<Props> = ({
  booking: _booking,
  isEditMode,
  dietaryRestrictions,
  specialRequests,
  onDietaryRestrictionsChange,
  onSpecialRequestsChange
}) => {
  // Helper to check if a restriction is currently selected
  const isRestrictionSelected = (restrictionName: string) => {
    return dietaryRestrictions.some(r => r.restriction === restrictionName)
  }

  // Helper to get guest count for a restriction
  const getGuestCount = (restrictionName: string): number => {
    const restriction = dietaryRestrictions.find(r => r.restriction === restrictionName)
    return restriction?.guest_count || 1
  }

  // Helper to get notes for a restriction
  const getNotes = (restrictionName: string): string => {
    const restriction = dietaryRestrictions.find(r => r.restriction === restrictionName)
    return restriction?.notes || ''
  }

  // Handle checkbox change
  const handleRestrictionToggle = (restrictionName: string, checked: boolean) => {
    if (checked) {
      // Add restriction
      const newRestriction = {
        restriction: restrictionName,
        guest_count: 1,
        notes: restrictionName === 'Altro' ? '' : undefined
      }
      onDietaryRestrictionsChange([...dietaryRestrictions, newRestriction])
    } else {
      // Remove restriction
      onDietaryRestrictionsChange(dietaryRestrictions.filter(r => r.restriction !== restrictionName))
    }
  }

  // Handle guest count change
  const handleGuestCountChange = (restrictionName: string, count: number) => {
    onDietaryRestrictionsChange(
      dietaryRestrictions.map(r =>
        r.restriction === restrictionName
          ? { ...r, guest_count: count }
          : r
      )
    )
  }

  // Handle notes change (for "Altro")
  const handleNotesChange = (restrictionName: string, notes: string) => {
    onDietaryRestrictionsChange(
      dietaryRestrictions.map(r =>
        r.restriction === restrictionName
          ? { ...r, notes }
          : r
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Dietary Restrictions */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span>⚠️</span>
          <span>Intolleranze e Allergie</span>
        </h3>

        {isEditMode ? (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {DIETARY_RESTRICTIONS_OPTIONS.map((restrictionName) => {
              const isSelected = isRestrictionSelected(restrictionName)
              const guestCount = getGuestCount(restrictionName)
              const notes = getNotes(restrictionName)

              return (
                <div key={restrictionName} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`restriction-${restrictionName}`}
                      checked={isSelected}
                      onChange={(e) => handleRestrictionToggle(restrictionName, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`restriction-${restrictionName}`}
                      className="text-sm font-medium text-gray-700 flex-1"
                    >
                      {restrictionName}
                    </label>
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <label htmlFor={`count-${restrictionName}`} className="text-sm text-gray-600">
                          Ospiti:
                        </label>
                        <input
                          type="number"
                          id={`count-${restrictionName}`}
                          min="1"
                          value={guestCount}
                          onChange={(e) => handleGuestCountChange(restrictionName, parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Notes field for "Altro" */}
                  {isSelected && restrictionName === 'Altro' && (
                    <div className="ml-7">
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => handleNotesChange(restrictionName, e.target.value)}
                        placeholder="Specifica l'intolleranza o esigenza"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            {dietaryRestrictions.length > 0 ? (
              <ul className="space-y-2">
                {dietaryRestrictions.map((restriction, index) => (
                  <li key={index} className="text-sm text-gray-900">
                    <span className="font-medium">• {restriction.restriction}</span>
                    <span className="text-gray-600"> - {restriction.guest_count} {restriction.guest_count === 1 ? 'ospite' : 'ospiti'}</span>
                    {restriction.notes && restriction.restriction === 'Altro' && (
                      <span className="text-gray-500 italic block ml-4">Note: {restriction.notes}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">Nessuna intolleranza segnalata</p>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Special Requests */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span>📝</span>
          <span>Note Speciali</span>
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          {isEditMode ? (
            <textarea
              value={specialRequests}
              onChange={(e) => onSpecialRequestsChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Inserisci eventuali richieste particolari..."
            />
          ) : (
            <p className="text-gray-900 whitespace-pre-wrap">
              {specialRequests || 'Nessuna nota aggiunta'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
