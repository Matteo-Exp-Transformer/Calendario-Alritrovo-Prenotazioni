import React, { useState } from 'react'
import {
  CheckCircle,
  Clock,
  User,
  X,
  Edit3,
  Trash2,
  Calendar as CalendarIcon,
  AlertTriangle,
} from 'lucide-react'
import { CalendarEvent, DEFAULT_QUICK_ACTIONS } from '@/types/calendar'
import { useAuth } from '@/hooks/useAuth'

interface QuickActionsProps {
  event: CalendarEvent
  onUpdate: (event: CalendarEvent) => void
  onClose: () => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  event,
  onUpdate,
  onClose,
}) => {
  const { userRole, userId } = useAuth()
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null)
  const [newDateTime, setNewDateTime] = useState<string>('')

  // Filter available actions based on user role and event properties
  const availableActions = DEFAULT_QUICK_ACTIONS.filter(action => {
    // Check role permissions
    const hasRole = userRole && action.allowedRoles.includes(userRole)
    if (!hasRole) return false

    // Check if action applies to this event type and status
    const appliesToType = action.showFor.types.includes(event.type)
    const appliesToStatus = action.showFor.statuses.includes(event.status)

    return appliesToType && appliesToStatus
  })

  const handleQuickComplete = () => {
    const updatedEvent: CalendarEvent = {
      ...event,
      status: 'completed',
      updated_at: new Date(),
      metadata: {
        ...event.metadata,
        completion_data: {
          completed_at: new Date(),
          completed_by: userId || 'unknown',
          method: 'quick_action',
        },
      },
    }
    onUpdate(updatedEvent)
    onClose()
  }

  const handleReschedule = () => {
    if (!newDateTime) return

    const newDate = new Date(newDateTime)
    const duration = event.end
      ? event.end.getTime() - event.start.getTime()
      : 60 * 60 * 1000 // Default 1 hour

    const updatedEvent: CalendarEvent = {
      ...event,
      start: newDate,
      end: new Date(newDate.getTime() + duration),
      updated_at: new Date(),
      metadata: {
        ...event.metadata,
        notes: `${event.metadata.notes || ''}\nRiprogrammato il ${new Date().toLocaleString('it-IT')}`,
      },
    }

    onUpdate(updatedEvent)
    setShowRescheduleModal(false)
    onClose()
  }

  const handleCancel = () => {
    const updatedEvent: CalendarEvent = {
      ...event,
      status: 'cancelled',
      updated_at: new Date(),
      metadata: {
        ...event.metadata,
        notes: `${event.metadata.notes || ''}\nAnnullato il ${new Date().toLocaleString('it-IT')}`,
      },
    }
    onUpdate(updatedEvent)
    setShowConfirmModal(null)
    onClose()
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'complete':
        return <CheckCircle className="h-4 w-4" />
      case 'reschedule':
        return <Clock className="h-4 w-4" />
      case 'assign':
        return <User className="h-4 w-4" />
      case 'cancel':
        return <X className="h-4 w-4" />
      case 'edit':
        return <Edit3 className="h-4 w-4" />
      case 'delete':
        return <Trash2 className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'complete':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'reschedule':
        return 'bg-blue-600 hover:bg-blue-700 text-white'
      case 'assign':
        return 'bg-purple-600 hover:bg-purple-700 text-white'
      case 'cancel':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'edit':
        return 'bg-gray-600 hover:bg-gray-700 text-white'
      case 'delete':
        return 'bg-red-700 hover:bg-red-800 text-white'
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  }

  const handleActionClick = (action: string, requiresConfirmation: boolean) => {
    if (requiresConfirmation) {
      setShowConfirmModal(action)
      return
    }

    switch (action) {
      case 'complete':
        handleQuickComplete()
        break
      case 'reschedule':
        setShowRescheduleModal(true)
        break
      case 'cancel':
        setShowConfirmModal('cancel')
        break
      default:
        console.log(`Action ${action} not implemented yet`)
    }
  }

  if (availableActions.length === 0) {
    return null
  }

  return (
    <>
      {/* Quick Actions Floating Panel */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-40">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">Azioni Rapide</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {availableActions.map(action => (
            <button
              key={action.action}
              onClick={() =>
                handleActionClick(action.action, action.requiresConfirmation)
              }
              className={`w-full inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${getActionColor(
                action.action
              )}`}
            >
              {getActionIcon(action.action)}
              <span className="ml-2">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">Evento: {event.title}</p>
          <p className="text-xs text-gray-500">
            Stato: {event.status} | Priorità: {event.priority}
          </p>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Riprogramma Evento
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Seleziona la nuova data e ora per l'evento "
                        {event.title}".
                      </p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nuova Data e Ora
                        </label>
                        <input
                          type="datetime-local"
                          value={newDateTime}
                          onChange={e => setNewDateTime(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleReschedule}
                  disabled={!newDateTime}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Riprogramma
                </button>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Conferma Azione
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {showConfirmModal === 'cancel' &&
                          `Sei sicuro di voler annullare l'evento "${event.title}"? Questa azione può essere annullata modificando nuovamente l'evento.`}
                        {showConfirmModal === 'delete' &&
                          `Sei sicuro di voler eliminare l'evento "${event.title}"? Questa azione non può essere annullata.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    if (showConfirmModal === 'cancel') {
                      handleCancel()
                    }
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {showConfirmModal === 'cancel' ? 'Annulla Evento' : 'Elimina'}
                </button>
                <button
                  onClick={() => setShowConfirmModal(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default QuickActions
