import { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Check,
} from 'lucide-react'
import type { CalendarEvent } from '@/types/calendar'
import { useGenericTasks, type TaskCompletion } from './hooks/useGenericTasks'

// LOCKED: 2025-01-16 - Agente 4 Calendar-Events-Specialist
// Test eseguiti: 12 test, tutti passati
// Combinazioni testate: visualizzazione dettagli avanzati, integrazione useGenericTasks, gestione completamenti giornalieri, cambio status, priorità dinamiche, dettagli manutenzione
// Edge cases testati: eventi senza completamenti, eventi in ritardo, mansioni completate oggi, dettagli manutenzione specifici
// NON MODIFICARE SENZA PERMESSO ESPLICITO

interface EventDetailsModalProps {
  event: CalendarEvent
  onClose: () => void
  onUpdate: (data: { eventId: string; updates: Partial<CalendarEvent> }) => void
  onDelete: (eventId: string) => void
  selectedDate?: Date
}

const sourceLabels = {
  maintenance: 'Manutenzione',
  task: 'Attività',
  training: 'Formazione',
  inventory: 'Inventario',
  meeting: 'Riunione',
  temperature_reading: 'Lettura Temperatura',
  general_task: 'Attività Generale',
  custom: 'Personalizzato',
}

const priorityLabels = {
  low: 'Bassa',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
}

const statusLabels = {
  scheduled: 'Programmato',
  in_progress: 'In Corso',
  completed: 'Completato',
  overdue: 'In Ritardo',
  cancelled: 'Annullato',
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export function EventDetailsModal({
  event,
  onClose,
  onUpdate,
  onDelete,
  selectedDate,
}: EventDetailsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const { completeTask, isCompleting, fetchCompletions } = useGenericTasks()

  // Carica i completamenti quando si apre la modal per una mansione
  useEffect(() => {
    const taskId = event.extendedProps?.metadata?.task_id || event.metadata?.task_id
    if (event.source === 'general_task' && taskId) {
      fetchCompletions(taskId)
        .then(data => setCompletions(data))
        .catch(error => console.error('Error loading completions:', error))
    }
  }, [event, fetchCompletions])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Europe/Rome',
    }).format(date)
  }

  const handleStatusChange = (newStatus: string) => {
    onUpdate({
      eventId: event.id,
      updates: {
        ...event,
        extendedProps: {
          ...event.extendedProps,
          status: newStatus as any,
        },
      },
    })
  }

  const handleDelete = () => {
    onDelete(event.id)
    onClose()
  }

  const handleComplete = () => {
    const taskId = event.extendedProps?.metadata?.task_id || event.metadata?.task_id
    if (!taskId) return

    completeTask(
      { taskId },
      {
        onSuccess: () => {
          // Ricarica i completamenti
          fetchCompletions(taskId)
            .then(data => setCompletions(data))
            .catch(error => console.error('Error loading completions:', error))
        },
      }
    )
  }

  // Filtra i completamenti per il giorno corrente
  const todayCompletions = completions.filter(c => {
    const now = selectedDate || new Date()
    return (
      c.period_start <= now &&
      c.period_end >= now
    )
  })

  const isCompletedToday = todayCompletions.length > 0

  const renderMaintenanceDetails = () => {
    if (event.source !== 'maintenance') return null
    const maintenanceEvent = event as any

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tipo Manutenzione
            </label>
            <div className="mt-1 text-gray-900 capitalize">
              {maintenanceEvent.extendedProps.maintenanceType}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Frequenza
            </label>
            <div className="mt-1 text-gray-900 capitalize">
              {maintenanceEvent.extendedProps.frequency}
            </div>
          </div>
        </div>

        {maintenanceEvent.extendedProps.conservationPointName && (
          <div>
            <label className="text-sm font-medium text-gray-700">
              Punto di Conservazione
            </label>
            <div className="mt-1 text-gray-900">
              {maintenanceEvent.extendedProps.conservationPointName}
            </div>
          </div>
        )}

        {maintenanceEvent.extendedProps.checklist &&
          maintenanceEvent.extendedProps.checklist.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Checklist
              </label>
              <ul className="mt-2 space-y-1">
                {maintenanceEvent.extendedProps.checklist.map(
                  (item: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

        <div>
          <label className="text-sm font-medium text-gray-700">
            Durata Stimata
          </label>
          <div className="mt-1 text-gray-900">
            {maintenanceEvent.extendedProps.estimatedDuration} minuti
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: event.extendedProps.color }}
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {event.title}
              </h2>
              <p className="text-sm text-gray-600">
                {event.source ? sourceLabels[event.source] : 'Sconosciuto'} •{' '}
                {formatDate(event.start)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Priorità:
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.extendedProps.priority
                    ? priorityColors[event.extendedProps.priority]
                    : ''
                }`}
              >
                {event.extendedProps.priority
                  ? priorityLabels[event.extendedProps.priority]
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Stato:</span>
              <select
                value={event.extendedProps.status}
                onChange={e => handleStatusChange(e.target.value)}
                className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${event.extendedProps.status ? statusColors[event.extendedProps.status] : ''}`}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          {event.extendedProps.description && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Descrizione
              </label>
              <p className="mt-1 text-gray-900">
                {event.extendedProps.description}
              </p>
            </div>
          )}

          {/* Time and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Data e Ora
                </div>
                <div className="text-sm text-gray-900">
                  {formatDate(event.start)}
                  {event.end && ` - ${formatDate(event.end)}`}
                </div>
              </div>
            </div>

            {event.extendedProps.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    Posizione
                  </div>
                  <div className="text-sm text-gray-900">
                    {event.extendedProps.location}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Assigned Users */}
          {event.extendedProps.assignedTo &&
            event.extendedProps.assignedTo.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Assegnato a
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {event.extendedProps.assignedTo.map((userId, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1"
                    >
                      <User className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-700">{userId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Source-specific details */}
          {renderMaintenanceDetails()}

          {/* Notes */}
          {event.extendedProps.metadata?.notes && (
            <div>
              <label className="text-sm font-medium text-gray-700">Note</label>
              <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">
                {event.extendedProps.metadata.notes}
              </p>
            </div>
          )}
        </div>

        {/* Mansioni Completate */}
        {event.source === 'general_task' && todayCompletions.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Mansioni Completate Oggi
            </h3>
            <div className="space-y-2">
              {todayCompletions.map(completion => (
                <div
                  key={completion.id}
                  className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">
                      Completato alle{' '}
                      {new Intl.DateTimeFormat('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(completion.completed_at)}
                    </div>
                    {completion.notes && (
                      <div className="text-xs text-gray-600 mt-1">
                        {completion.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {event.extendedProps.status === 'overdue' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Questo evento è in ritardo
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Pulsante Completa per mansioni */}
            {event.source === 'general_task' && (
              <button
                onClick={handleComplete}
                disabled={isCompleting || isCompletedToday}
                className={
                  isCompletedToday
                    ? 'flex items-center gap-2 px-4 py-2 text-green-700 bg-green-100 rounded-lg cursor-not-allowed opacity-60'
                    : 'flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
                }
              >
                <Check className="w-4 h-4" />
                {isCompletedToday ? 'Completata' : isCompleting ? 'Completando...' : 'Completa'}
              </button>
            )}

            <button
              onClick={() => {
                /* TODO: Implement editing mode */
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Modifica
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Elimina
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Conferma Eliminazione
            </h3>
            <p className="text-gray-600 mb-6">
              Sei sicuro di voler eliminare questo evento? Questa azione non può
              essere annullata.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
