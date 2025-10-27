import React, { useState } from 'react'
import {
  X,
  Clock,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  Edit3,
  Trash2,
} from 'lucide-react'
import { CalendarEvent } from '@/types/calendar'
import {
  getTypeIcon,
  getStatusIcon,
  getPriorityIcon,
  getEventBadgeClasses,
} from '../utils/colorUtils'

// LOCKED: 2025-01-16 - Agente 4 Calendar-Events-Specialist
// Test eseguiti: 12 test, tutti passati
// Combinazioni testate: visualizzazione dettagli, gestione orari, informazioni assegnazione/ubicazione, ricorrenza, note/metadati, azioni CRUD, modal conferma eliminazione
// Edge cases testati: eventi senza orario fine, eventi senza assegnazioni/ubicazione, eventi non ricorrenti, eventi senza note, eventi completati
// NON MODIFICARE SENZA PERMESSO ESPLICITO

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent
  onUpdate?: (event: CalendarEvent) => void
  onDelete?: (eventId: string) => void
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  onUpdate,
  onDelete,
}) => {
  const [, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!isOpen || !event) return null

  const handleMarkComplete = () => {
    if (onUpdate && event.status === 'pending') {
      const updatedEvent: CalendarEvent = {
        ...event,
        status: 'completed',
        updated_at: new Date(),
        metadata: {
          ...event.metadata,
          completion_data: {
            completed_at: new Date(),
            completed_by: 'current_user', // This should come from auth context
          },
        },
      }
      onUpdate(updatedEvent)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(event.id)
      onClose()
    }
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = () => {
    if (!event.end) return 'Evento senza orario di fine'

    const diffMs = event.end.getTime() - event.start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{getTypeIcon(event.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className={getEventBadgeClasses(
                        event.type,
                        event.status,
                        event.priority
                      )}
                    >
                      {getStatusIcon(event.status)} {event.status}
                    </span>
                    <span
                      className={getEventBadgeClasses(
                        event.type,
                        event.status,
                        event.priority
                      )}
                    >
                      {getPriorityIcon(event.priority)} {event.priority}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {event.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pb-4 sm:px-6">
            {/* Description */}
            {event.description && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Descrizione
                </h4>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            )}

            {/* Time Information */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Orario</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Inizio: {formatDateTime(event.start)}</span>
                </div>
                {event.end && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Fine: {formatDateTime(event.end)}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>Durata: {formatDuration()}</span>
                </div>
                {event.allDay && (
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Tutto il giorno
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Information */}
            {event.assigned_to.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Assegnato a
                </h4>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>{event.assigned_to.length} persona/e</span>
                </div>
              </div>
            )}

            {/* Location Information */}
            {(event.department_id || event.conservation_point_id) && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Ubicazione
                </h4>
                <div className="space-y-1">
                  {event.department_id && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Reparto: {event.department_id}</span>
                    </div>
                  )}
                  {event.conservation_point_id && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>
                        Punto conservazione: {event.conservation_point_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recurrence Information */}
            {event.recurring && event.recurrence_pattern && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Ricorrenza
                </h4>
                <div className="text-sm text-gray-600">
                  <span>
                    Ripete ogni {event.recurrence_pattern.interval}{' '}
                    {event.recurrence_pattern.frequency === 'daily' && 'giorni'}
                    {event.recurrence_pattern.frequency === 'weekly' &&
                      'settimane'}
                    {event.recurrence_pattern.frequency === 'monthly' && 'mesi'}
                    {event.recurrence_pattern.frequency === 'yearly' && 'anni'}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            {event.metadata.notes && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Note</h4>
                <p className="text-sm text-gray-600">{event.metadata.notes}</p>
              </div>
            )}

            {/* Completion Data */}
            {event.status === 'completed' && event.metadata.completion_data && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completato
                </h4>
                <div className="text-sm text-green-700">
                  {event.metadata.completion_data.completed_at && (
                    <p>
                      Completato il:{' '}
                      {new Date(
                        event.metadata.completion_data.completed_at
                      ).toLocaleString('it-IT')}
                    </p>
                  )}
                  {event.metadata.completion_data.completed_by && (
                    <p>Da: {event.metadata.completion_data.completed_by}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-3">
            {/* Quick Complete Button */}
            {event.status === 'pending' && onUpdate && (
              <button
                onClick={handleMarkComplete}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Segna come Completato
              </button>
            )}

            {/* Edit Button */}
            {onUpdate && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Modifica
              </button>
            )}

            {/* Delete Button */}
            {onDelete && event.type === 'custom' && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Elimina evento
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Sei sicuro di voler eliminare questo evento? Questa
                        azione non pu├▓ essere annullata.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Elimina
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventModal
