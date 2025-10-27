import React, { useMemo, useState } from 'react'
import { X, User, Plus } from 'lucide-react'
import type { CalendarEventType, CalendarEvent } from '@/types/calendar'

interface CreateEventModalProps {
  selectedDate: Date | null
  onClose: () => void
  onCreate: (eventData: Partial<CalendarEvent>) => void
}

const eventTypes = [
  { value: 'maintenance', label: 'Manutenzione', color: '#3B82F6' },
  { value: 'general_task', label: 'Attività', color: '#10B981' },
  {
    value: 'temperature_reading',
    label: 'Lettura Temperatura',
    color: '#F59E0B',
  },
  { value: 'custom', label: 'Personalizzato', color: '#8B5CF6' },
] as const

const priorities = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Critica' },
] as const

const frequencyOptions = [
  { value: 'daily', label: 'Giornaliera' },
  { value: 'weekly', label: 'Settimanale' },
  { value: 'monthly', label: 'Mensile' },
  { value: 'yearly', label: 'Annuale' },
] as const

export function CreateEventModal({
  selectedDate,
  onClose,
  onCreate,
}: CreateEventModalProps) {
  const initialStart = useMemo(
    () => selectedDate?.toISOString().slice(0, 16) ?? '',
    [selectedDate]
  )

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'maintenance' as CalendarEventType,
    start: initialStart,
    end: '',
    allDay: false,
    priority: 'medium' as CalendarEvent['priority'],
    location: '',
    assignees: [] as string[],
    departmentId: '',
    conservationPointId: '',
    recurrence: 'weekly' as (typeof frequencyOptions)[number]['value'],
    estimatedDuration: 60,
  })

  const [assigneeEmail, setAssigneeEmail] = useState('')
  const [checklistItem, setChecklistItem] = useState('')
  const [checklist, setChecklist] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const startDate = formData.start ? new Date(formData.start) : new Date()
    const endDate = formData.end ? new Date(formData.end) : undefined

    const eventData: Partial<CalendarEvent> = {
      title: formData.title,
      description: formData.description,
      start: startDate,
      end: endDate,
      allDay: formData.allDay,
      type: formData.type,
      status: 'pending',
      priority: formData.priority,
      assigned_to: formData.assignees,
      department_id: formData.departmentId || undefined,
      conservation_point_id: formData.conservationPointId || undefined,
      recurring: formData.type === 'maintenance',
      recurrence_pattern:
        formData.type === 'maintenance'
          ? {
              frequency: formData.recurrence,
              interval: 1,
            }
          : undefined,
      metadata: {},
      extendedProps: {
        priority: formData.priority,
        assignedTo: formData.assignees,
        location: formData.location || undefined,
        metadata: {
          checklist: checklist.length ? checklist : undefined,
          estimatedDuration: formData.estimatedDuration,
        },
      },
    }

    onCreate(eventData)
    onClose()
  }

  const addAssignee = () => {
    const normalized = assigneeEmail.trim()
    if (!normalized || formData.assignees.includes(normalized)) return

    setFormData(prev => ({
      ...prev,
      assignees: [...prev.assignees, normalized],
    }))
    setAssigneeEmail('')
  }

  const removeAssignee = (email: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.filter(assignee => assignee !== email),
    }))
  }

  const addChecklistItem = () => {
    const normalized = checklistItem.trim()
    if (!normalized) return
    setChecklist(prev => [...prev, normalized])
    setChecklistItem('')
  }

  const removeChecklistItem = (index: number) => {
    setChecklist(prev => prev.filter((_, idx) => idx !== index))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Nuovo Evento
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titolo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Inserisci il titolo dell'evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Evento *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {eventTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          type: type.value,
                        }))
                      }
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.type === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        {type.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Aggiungi una descrizione dell'evento"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Ora Inizio *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, start: e.target.value }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Ora Fine
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, end: e.target.value }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="all-day"
                  checked={formData.allDay}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, allDay: e.target.checked }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="all-day" className="ml-2 text-sm text-gray-700">
                  Evento per tutto il giorno
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorità
                </label>
                <select
                  value={formData.priority}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      priority: e.target.value as CalendarEvent['priority'],
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posizione
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dove si svolge l'evento"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assegna a
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={assigneeEmail}
                  onChange={e => setAssigneeEmail(e.target.value)}
                  placeholder="Email utente"
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addAssignee()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addAssignee}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.assignees.length > 0 && (
                <ul className="space-y-1">
                  {formData.assignees.map(email => (
                    <li
                      key={email}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeAssignee(email)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {formData.type === 'maintenance' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequenza
                  </label>
                  <select
                    value={formData.recurrence}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        recurrence: e.target
                          .value as (typeof frequencyOptions)[number]['value'],
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durata Stimata (minuti)
                  </label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={formData.estimatedDuration}
                    onChange={e => {
                      const value = parseInt(e.target.value, 10)
                      setFormData(prev => ({
                        ...prev,
                        estimatedDuration: Number.isNaN(value)
                          ? prev.estimatedDuration
                          : value,
                      }))
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Checklist
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={checklistItem}
                      onChange={e => setChecklistItem(e.target.value)}
                      placeholder="Aggiungi elemento checklist"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addChecklistItem()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addChecklistItem}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {checklist.length > 0 && (
                    <ul className="space-y-1">
                      {checklist.map((item, index) => (
                        <li
                          key={`check-${item}-${index}`}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm">{item}</span>
                          <button
                            type="button"
                            onClick={() => removeChecklistItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {formData.type === 'temperature_reading' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Punto di Conservazione
                  </label>
                  <input
                    type="text"
                    value={formData.conservationPointId}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        conservationPointId: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ID punto di conservazione"
                  />
                </div>
              </div>
            )}

            {formData.type === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dettagli Evento Personalizzato
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Inserisci i dettagli dell'evento personalizzato"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center p-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              {formData.assignees.length > 0
                ? `${formData.assignees.length} assegnatari`
                : 'Nessun assegnatario'}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Crea Evento
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
