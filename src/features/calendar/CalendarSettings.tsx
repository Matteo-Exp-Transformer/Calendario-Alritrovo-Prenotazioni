import { Clock, Globe, Bell, Palette } from 'lucide-react'
import type { CalendarSettings as CalendarSettingsType } from '@/types/calendar'

interface CalendarSettingsProps {
  settings: CalendarSettingsType
  onSettingsChange: (settings: Partial<CalendarSettingsType>) => void
}

const viewOptions = [
  { value: 'dayGridMonth', label: 'Vista Mese' },
  { value: 'timeGridWeek', label: 'Vista Settimana' },
  { value: 'timeGridDay', label: 'Vista Giorno' },
] as const

const timeFormatOptions = [
  { value: '24h', label: '24 ore (14:30)' },
  { value: '12h', label: '12 ore (2:30 PM)' },
] as const

const weekStartOptions = [
  { value: 1, label: 'Lunedì' },
  { value: 0, label: 'Domenica' },
] as const

export function CalendarSettings({
  settings,
  onSettingsChange,
}: CalendarSettingsProps) {
  const updateBusinessHours = (
    field: keyof CalendarSettingsType['businessHours'],
    value: CalendarSettingsType['businessHours'][typeof field]
  ) => {
    onSettingsChange({
      businessHours: {
        ...settings.businessHours,
        [field]: value,
      },
    })
  }

  const updateColorScheme = (source: string, color: string) => {
    onSettingsChange({
      colorScheme: {
        ...settings.colorScheme,
        [source]: color,
      },
    })
  }

  const updateNotifications = (
    field: keyof CalendarSettingsType['notifications'],
    value: CalendarSettingsType['notifications'][typeof field]
  ) => {
    onSettingsChange({
      notifications: {
        ...settings.notifications,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-8">
      {/* Visualizzazione */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
          <Globe className="w-5 h-5" />
          Visualizzazione
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vista Predefinita
            </label>
            <select
              value={settings.defaultView}
              onChange={e =>
                onSettingsChange({
                  defaultView: e.target
                    .value as CalendarSettingsType['defaultView'],
                })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {viewOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inizio Settimana
            </label>
            <select
              value={settings.weekStartsOn}
              onChange={e => {
                const value = parseInt(e.target.value, 10) as 0 | 1
                onSettingsChange({
                  weekStartsOn: value,
                  firstDayOfWeek: value,
                })
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {weekStartOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orari */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
          <Clock className="w-5 h-5" />
          Formato Orario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato Ora
            </label>
            <select
              value={settings.timeFormat}
              onChange={e =>
                onSettingsChange({
                  timeFormat: e.target
                    .value as CalendarSettingsType['timeFormat'],
                })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeFormatOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inizio Orario Lavorativo
            </label>
            <input
              type="time"
              value={settings.businessHours.startTime}
              onChange={e => updateBusinessHours('startTime', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fine Orario Lavorativo
            </label>
            <input
              type="time"
              value={settings.businessHours.endTime}
              onChange={e => updateBusinessHours('endTime', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Notifiche */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
          <Bell className="w-5 h-5" />
          Notifiche
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifications-enabled"
              checked={settings.notifications.enabled}
              onChange={e => updateNotifications('enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="notifications-enabled"
              className="ml-2 text-sm text-gray-700"
            >
              Abilita notifiche per eventi del calendario
            </label>
          </div>
        </div>
      </div>

      {/* Colori */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
          <Palette className="w-5 h-5" />
          Schema Colori Eventi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(settings.colorScheme).map(([source, color]) => {
            const sourceLabels: Record<string, string> = {
              maintenance: 'Manutenzioni',
              task: 'Attività',
              training: 'Formazione',
              inventory: 'Inventario',
              meeting: 'Riunioni',
              temperature_reading: 'Letture Temperatura',
              general_task: 'Attività Generali',
              custom: 'Personalizzato',
            }

            return (
              <div key={source} className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={e => updateColorScheme(source, e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  {sourceLabels[source] || source}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            const defaultSettings: CalendarSettingsType = {
              defaultView: 'dayGridMonth',
              weekStartsOn: 1,
              timeFormat: '24h',
              firstDayOfWeek: 1,
              businessHours: {
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: '08:00',
                endTime: '18:00',
              },
              notifications: {
                enabled: true,
                defaultTimings: ['minutes_before', 'hours_before'],
              },
              colorScheme: {
                maintenance: '#3B82F6',
                task: '#10B981',
                training: '#F59E0B',
                inventory: '#8B5CF6',
                meeting: '#EF4444',
                temperature_reading: '#06B6D4',
                general_task: '#6366F1',
                custom: '#EC4899',
              },
            }
            onSettingsChange(defaultSettings)
          }}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Ripristina Predefiniti
        </button>
      </div>
    </div>
  )
}
