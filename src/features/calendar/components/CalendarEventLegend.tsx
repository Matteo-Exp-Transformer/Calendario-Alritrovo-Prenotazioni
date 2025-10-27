import React from 'react'

interface CalendarEventLegendProps {
  sources?: {
    maintenance?: number
    temperatureChecks?: number
    haccpExpiry?: number
    productExpiry?: number
    haccpDeadlines?: number
    genericTasks?: number
  }
  compact?: boolean
}

export const CalendarEventLegend: React.FC<CalendarEventLegendProps> = ({ 
  sources = {}, 
  compact = false 
}) => {
  // Unifica temperature checks in manutenzioni
  const totalMaintenance = (sources.maintenance || 0) + (sources.temperatureChecks || 0)
  
  // Unifica scadenze HACCP e alert HACCP in una sola categoria
  const totalHaccpAlerts = (sources.haccpExpiry || 0) + (sources.haccpDeadlines || 0)

  const legendItems = [
    {
      icon: '­ƒöº',
      label: 'Manutenzioni',
      count: totalMaintenance,
      description: 'Incluye rilevamento temperature'
    },
    {
      icon: '­ƒôª',
      label: 'Scadenze Prodotti',
      count: sources.productExpiry || 0
    },
    {
      icon: 'ÔÅ░',
      label: 'Alert HACCP',
      count: totalHaccpAlerts,
      description: 'Incluye scadenze certificazioni'
    },
    {
      icon: '­ƒôï',
      label: 'Attivit├á Generiche',
      count: sources.genericTasks || 0
    }
  ]

  if (compact) {
    return (
      <div className="flex flex-wrap gap-3 text-sm">
        {legendItems.map((item, index) => (
          <div 
            key={index} 
            className="group relative flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="text-lg group-hover:scale-110 transition-transform duration-200" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}>
              {item.icon}
            </span>
            <span className="text-gray-700 font-semibold">{item.label}</span>
            <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 text-xs font-bold text-indigo-700 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full border border-indigo-200 shadow-sm">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
      {legendItems.map((item, index) => (
        <div 
          key={index} 
          className="group flex items-center gap-4 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl group-hover:scale-110 transition-transform duration-200">
            <span className="text-2xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(99,102,241,0.2))' }}>
              {item.icon}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800 text-sm mb-1 truncate">{item.label}</div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center min-w-[32px] h-6 px-2.5 text-sm font-bold text-indigo-700 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border border-indigo-200 shadow-sm">
                {item.count}
              </span>
              {item.description && (
                <span className="text-xs text-gray-500 truncate">{item.description}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CalendarEventLegend
