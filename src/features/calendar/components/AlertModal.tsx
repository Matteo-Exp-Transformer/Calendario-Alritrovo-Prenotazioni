import React, { useState } from 'react'
import { X, Wrench, ClipboardList, Package, Calendar, User, Clock, AlertCircle, Thermometer } from 'lucide-react'
import type { CalendarAlert } from '../hooks/useCalendarAlerts'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  alerts: CalendarAlert[]
}

const categoryConfig = {
  maintenance: {
    icon: Wrench,
    label: 'Manutenzioni',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconBgColor: 'bg-blue-100',
  },
  general_task: {
    icon: ClipboardList,
    label: 'Mansioni/Attività Generiche',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    iconBgColor: 'bg-green-100',
  },
  product_expiry: {
    icon: Package,
    label: 'Scadenze Prodotti',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    iconBgColor: 'bg-orange-100',
  },
  temperature_reading: {
    icon: Thermometer,
    label: 'Controlli Temperatura',
    color: 'cyan',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-700',
    iconBgColor: 'bg-cyan-100',
  },
  custom: {
    icon: AlertCircle,
    label: 'Certificazioni HACCP',
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    iconBgColor: 'bg-purple-100',
  },
}

const severityConfig = {
  critical: { label: 'Critico', color: 'bg-red-100 text-red-800', icon: '🔴' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
}

const statusConfig = {
  pending: { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  in_progress: { label: 'In Corso', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
  completed: { label: 'Completato', color: 'bg-green-100 text-green-800', icon: '✅' },
  overdue: { label: 'In Ritardo', color: 'bg-red-100 text-red-800', icon: '⚠️' },
  cancelled: { label: 'Annullato', color: 'bg-gray-100 text-gray-800', icon: '❌' },
}

function getEventCategory(event: CalendarAlert['event']): keyof typeof categoryConfig {
  if (event.type === 'maintenance') return 'maintenance'
  if (event.type === 'general_task') return 'general_task'
  if (event.type === 'temperature_reading') return 'temperature_reading'
  if (event.source === 'custom' && event.title.includes('HACCP')) return 'custom'
  if (event.title.includes('Scadenza:')) return 'product_expiry'
  return 'custom'
}

function groupAlertsByCategory(alerts: CalendarAlert[]) {
  const grouped = alerts.reduce((acc, alert) => {
    const category = getEventCategory(alert.event)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(alert)
    return acc
  }, {} as Record<string, CalendarAlert[]>)

  // Ordina per severità (critical prima)
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  })

  return grouped
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  alerts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const groupedAlerts = groupAlertsByCategory(alerts)

  if (!isOpen) return null

  const categories = Object.keys(groupedAlerts) as Array<keyof typeof categoryConfig>
  const selectedAlerts = selectedCategory ? groupedAlerts[selectedCategory] : []
  const config = selectedCategory ? categoryConfig[selectedCategory as keyof typeof categoryConfig] : null
  const Icon = config?.icon

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl overflow-hidden flex flex-col">
        <div className={`${config?.bgColor || 'bg-red-50'} border-b ${config?.borderColor || 'border-red-200'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 ${config?.iconBgColor || 'bg-red-100'} rounded-lg`}>
                <AlertCircle className={`h-6 w-6 ${config?.textColor || 'text-red-600'}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Alert Attività Urgenti</h2>
                <p className="text-sm text-gray-600">
                  {alerts.length} attività richiedono attenzione immediata
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Categories Tabs */}
          <div className="flex space-x-8">
            {categories.map(category => {
              const categoryConfigItem = categoryConfig[category]
              const categoryAlerts = groupedAlerts[category]
              const criticalCount = categoryAlerts.filter(a => a.severity === 'critical').length
              const CategoryIcon = categoryConfigItem.icon

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedCategory === category
                      ? `${categoryConfigItem.borderColor} ${categoryConfigItem.textColor}`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-4 w-4" />
                    <span>{categoryConfigItem.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      criticalCount > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {categoryAlerts.length}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {selectedCategory ? (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${config?.iconBgColor || 'bg-red-100'}`}>
                  {Icon && <Icon className={`h-5 w-5 ${config?.textColor || 'text-red-600'}`} />}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${config?.textColor || 'text-red-600'}`}>
                    {config?.label || 'Alert'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedAlerts.length} attività richiedono attenzione
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedAlerts.map((alert) => {
                  const severity = severityConfig[alert.severity]
                  const status = statusConfig[alert.event.status] || statusConfig.pending
                  const eventDate = new Date(alert.event.start)

                  return (
                    <div
                      key={alert.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {alert.event.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {alert.event.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${severity.color}`}>
                            {severity.icon} {severity.label}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{eventDate.toLocaleDateString('it-IT')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{eventDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {alert.event.assigned_to && alert.event.assigned_to.length > 0 && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{alert.event.assigned_to.length} assegnato/i</span>
                          </div>
                        )}
                      </div>

                      {alert.message && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">
                              {alert.message}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Seleziona una categoria
                </h3>
                <p className="text-gray-600">
                  Scegli una categoria per visualizzare gli alert
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}