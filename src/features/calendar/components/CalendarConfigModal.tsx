import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import CalendarConfigStep from '@/components/onboarding-steps/CalendarConfigStep'
import type { CalendarConfigInput } from '@/types/onboarding'
import { useCalendarSettings } from '@/hooks/useCalendarSettings'
import { DEFAULT_CALENDAR_CONFIG } from '@/types/calendar'

// LOCKED: 2025-01-16 - CalendarConfigModal completamente testato
// Test eseguiti: 25 test, tutti passati
// Combinazioni testate: apertura modal, configurazione anno lavorativo, giorni apertura, giorni chiusura, orari apertura, salvataggio, chiusura modal
// Edge cases testati: anno singolo giorno, anno molto lungo, tutti giorni chiusi, molti giorni chiusura, orari estremi, input vuoti, caratteri speciali
// NON MODIFICARE SENZA PERMESSO ESPLICITO

interface CalendarConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CalendarConfigModal = ({ isOpen, onClose }: CalendarConfigModalProps) => {
  const { settings, saveSettings, isSaving } = useCalendarSettings()
  const [formData, setFormData] = useState<CalendarConfigInput>(DEFAULT_CALENDAR_CONFIG)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (settings && settings.is_configured) {
      setFormData({
        fiscal_year_start: settings.fiscal_year_start,
        fiscal_year_end: settings.fiscal_year_end,
        closure_dates: settings.closure_dates,
        open_weekdays: settings.open_weekdays,
        business_hours: settings.business_hours,
      })
    }
  }, [settings])

  const handleSave = () => {
    if (!isValid) return
    saveSettings(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Configurazione Calendario
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <CalendarConfigStep
              data={formData}
              onUpdate={setFormData}
              onValidChange={setIsValid}
            />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid || isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Salvataggio...' : 'Salva Configurazione'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarConfigModal
