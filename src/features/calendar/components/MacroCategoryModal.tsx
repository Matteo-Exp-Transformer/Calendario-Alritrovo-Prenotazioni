import React, { useState } from 'react'
import { X, Wrench, ClipboardList, Package, ChevronRight, Calendar, User, Clock, AlertCircle, Check, RotateCcw, AlertTriangle, Filter } from 'lucide-react'
import type { MacroCategory, MacroCategoryItem } from '../hooks/useMacroCategoryEvents'
import { useMacroCategoryEvents } from '../hooks/useMacroCategoryEvents'
import { useGenericTasks } from '../hooks/useGenericTasks'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import { 
  CalendarFilters, 
  DEFAULT_CALENDAR_FILTERS,
  determineEventType,
  calculateEventStatus,
  type EventType,
  type EventStatus 
} from '@/types/calendar-filters'

interface MacroCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: MacroCategory
  date: Date
  events?: any[] // ✅ NUOVO: Eventi passati dal Calendar
  onDataUpdated?: () => void // Callback per notificare aggiornamento dati
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
  generic_tasks: {
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
}

const statusConfig = {
  pending: { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  completed: { label: 'Completato', color: 'bg-green-100 text-green-800', icon: '✅' },
  overdue: { label: 'In Ritardo', color: 'bg-red-100 text-red-800', icon: '⚠️' },
}

const priorityConfig = {
  low: { label: 'Bassa', color: 'bg-gray-100 text-gray-800', icon: '🔵' },
  medium: { label: 'Media', color: 'bg-blue-100 text-blue-800', icon: '🟡' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  critical: { label: 'Critica', color: 'bg-red-100 text-red-800', icon: '🔴' },
}

export const MacroCategoryModal: React.FC<MacroCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  date,
  events: passedEvents,
  onDataUpdated,
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]) // Array di ID per toggle indipendente
  const [filters, setFilters] = useState<CalendarFilters>(DEFAULT_CALENDAR_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const { completeTask, uncompleteTask, isCompleting, isUncompleting } = useGenericTasks()
  const queryClient = useQueryClient()
  const { companyId, user } = useAuth()
  const [isCompletingMaintenance, setIsCompletingMaintenance] = useState(false)
  const [isUncompletingMaintenance, setIsUncompletingMaintenance] = useState(false)
  
  // ✅ Forza il refetch dei dati quando viene chiamato onDataUpdated
  const [refreshKey, setRefreshKey] = useState(0)
  
  // ✅ Funzione per convertire eventi CalendarEvent in MacroCategoryItem
  const convertEventToItem = (event: any): MacroCategoryItem => {
    const eventType = determineEventType(event.source, event.metadata)
    
    // ✅ Fix: Validazione sicura per event.start
    const eventStart = event.start ? new Date(event.start) : new Date()
    const eventStatus = calculateEventStatus(eventStart, event.status === 'completed')
    
    return {
      id: event.id,
      title: event.title,
      description: event.extendedProps?.description || '',
      status: event.status === 'completed' ? 'completed' : 
              eventStatus === 'overdue' ? 'overdue' : 'pending',
      priority: event.extendedProps?.priority || 'medium',
      assignedTo: event.extendedProps?.assignedTo || '',
      dueDate: eventStart, // ✅ Usa la data validata
      completedAt: event.status === 'completed' ? new Date() : null,
      completedBy: event.status === 'completed' ? 'User' : null,
      department: event.extendedProps?.department || '',
      type: eventType,
      metadata: {
        category: category,
        sourceId: event.id,
        ...event.metadata
      }
    } as MacroCategoryItem & { 
      completedAt?: Date | null
      completedBy?: string | null
      department?: string
      type: EventType
    }
  }

  // ✅ Usa eventi passati se disponibili, altrimenti carica dal database
  const { getCategoryForDate } = useMacroCategoryEvents(undefined, undefined, refreshKey)
  const categoryEvent = passedEvents ? 
    { items: passedEvents.map(event => convertEventToItem(event)) } : 
    getCategoryForDate(date, category)
  const rawItems = categoryEvent?.items || []

  // ✅ Applica filtri agli items
  const items = rawItems.filter(item => {
    // Filtro per stato
    if (filters.statuses.length > 0) {
      const itemStatus = item.status === 'completed' ? 'completed' :
                        item.status === 'overdue' ? 'overdue' : 'to_complete'
      if (!filters.statuses.includes(itemStatus as EventStatus)) {
        return false
      }
    }

    // Filtro per tipo
    if (filters.types.length > 0) {
      if (!filters.types.includes((item as any).type as EventType)) {
        return false
      }
    }

    // Filtro per reparto
    if (filters.departments.length > 0) {
      if (!(item as any).department || !filters.departments.includes((item as any).department)) {
        return false
      }
    }

    return true
  })
  
  // Helper per verificare se un item è selezionato
  const isItemSelected = (itemId: string) => selectedItems.includes(itemId)
  
  // ✅ Funzione per forzare il refresh dei dati
  const forceDataRefresh = () => {
    setRefreshKey(prev => prev + 1)
    console.log('🔄 Forcing macro data refresh in modal')
  }

  // ✅ Funzione per refresh fluido con invalidazione query
  const refreshDataFluidly = async () => {
    try {
      console.log('🔄 Starting fluid refresh...')
      
      // Invalida le query per forzare il refetch
      await queryClient.invalidateQueries({ 
        queryKey: ['macro-category-events'],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({ 
        queryKey: ['calendar-events'],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({ 
        queryKey: ['generic-tasks'],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({ 
        queryKey: ['maintenance-tasks'],
        refetchType: 'all'
      })
      
      // Forza il refresh del componente
      forceDataRefresh()
      
      // ✅ Forza aggiornamento UI
      window.dispatchEvent(new Event('calendar-refresh'))
      
      console.log('🔄 Fluid refresh completed')
    } catch (error) {
      console.error('Error during fluid refresh:', error)
    }
  }


  const handleCompleteMaintenance = async (maintenanceId: string) => {
    if (!companyId || !user) {
      toast.error('Utente non autenticato')
      return
    }

    setIsCompletingMaintenance(true)
    try {
      const now = new Date().toISOString()
      
      // Aggiorna lo stato della manutenzione a 'completed' con tutti i campi necessari
      const { error } = await supabase
        .from('maintenance_tasks')
        .update({
          status: 'completed',
          completed_by: user.id,
          completed_at: now,
          last_completed: now,
          updated_at: now
        })
        .eq('id', maintenanceId)
        .eq('company_id', companyId)

      if (error) throw error

      // ✅ Invalida TUTTE le query maintenance (senza conservationPointId specifico)
      await queryClient.invalidateQueries({ 
        queryKey: ['maintenance-tasks'],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({ 
        queryKey: ['calendar-events'],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({ 
        queryKey: ['macro-category-events'],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({ 
        queryKey: ['maintenance-completions'],
        refetchType: 'all'
      })

      toast.success('✅ Manutenzione completata - Calendario aggiornato')
      
      // ✅ Refresh fluido: aggiorna i dati senza chiudere il modal
      await refreshDataFluidly()
      
      // ✅ Notifica al componente padre di aggiornare i dati
      onDataUpdated?.()
      
      // ✅ Chiudi solo l'item completato per feedback visivo
      setSelectedItems(prev => prev.filter(id => id !== maintenanceId))
    } catch (error) {
      console.error('Error completing maintenance:', error)
      toast.error('Errore nel completamento della manutenzione')
    } finally {
      setIsCompletingMaintenance(false)
    }
  }

  // ✅ Funzione per ripristinare manutenzione completata
  const handleUncompleteMaintenance = async (maintenanceId: string) => {
    if (!companyId || !user) return

    try {
      setIsUncompletingMaintenance(true)

      // Rimuovi il completamento dalla tabella maintenance_completions
      const { error } = await supabase
        .from('maintenance_completions')
        .delete()
        .eq('maintenance_id', maintenanceId)
        .eq('company_id', companyId)

      if (error) throw error

      // ✅ Invalida TUTTE le query maintenance (senza conservationPointId specifico)
      await queryClient.invalidateQueries({
        queryKey: ['maintenance-tasks'],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({
        queryKey: ['calendar-events'],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({
        queryKey: ['maintenance-completions'],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({
        queryKey: ['macro-category-events'],
        refetchType: 'all'
      })

      toast.success('✅ Manutenzione ripristinata come "Da Completare"')

      // ✅ Refresh fluido: aggiorna i dati senza chiudere il modal
      await refreshDataFluidly()

      // ✅ Notifica al componente padre di aggiornare i dati
      onDataUpdated?.()

      // ✅ Chiudi solo l'item ripristinato per feedback visivo
      setSelectedItems(prev => prev.filter(id => id !== maintenanceId))
    } catch (error) {
      console.error('Error uncompleting maintenance:', error)
      toast.error('❌ Errore nel ripristinare la manutenzione')
    } finally {
      setIsUncompletingMaintenance(false)
    }
  }
  const config = categoryConfig[category]
  const Icon = config.icon

  if (!isOpen) return null

  const handleItemClick = (item: MacroCategoryItem) => {
    // Toggle indipendente: se è già aperto lo chiude, altrimenti lo apre
    setSelectedItems(prev => 
      prev.includes(item.id) 
        ? prev.filter(id => id !== item.id) // Rimuovi se già presente
        : [...prev, item.id] // Aggiungi se non presente
    )
  }

  // Separa gli items in attivi e completati
  const activeItems = items.filter(i => i.status !== 'completed')
  const completedItems = items.filter(i => i.status === 'completed')

  // Calcola le date per determinare "in ritardo"
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const selectedDate = new Date(date)
  selectedDate.setHours(0, 0, 0, 0)
  
  // Data 1 settimana fa (7 giorni prima di oggi)
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(now.getDate() - 7)
  
  // Ieri (1 giorno prima di oggi)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  // Attività in ritardo: non completate, da 1 settimana fa fino a ieri (escluso oggi)
  const overdueItems = items.filter(i => {
    if (i.status === 'completed') return false
    const itemDate = new Date(i.dueDate)
    itemDate.setHours(0, 0, 0, 0)
    // In ritardo se: data >= 1 settimana fa E data <= ieri (quindi < oggi)
    return itemDate >= oneWeekAgo && itemDate < now
  })
  
  const shouldShowOverdue = overdueItems.length > 0

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl overflow-hidden flex flex-col">
        <div className={`${config.bgColor} border-b ${config.borderColor} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 ${config.iconBgColor} rounded-lg`}>
                <Icon className={`h-6 w-6 ${config.textColor}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{config.label}</h2>
                <p className="text-sm text-gray-600">
                  {date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Filtri
                </span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 ${config.iconBgColor} rounded-lg`}>
              <span className="text-sm font-medium text-gray-700">
                Attive: <span className={`font-bold ${config.textColor}`}>{activeItems.length}</span>
              </span>
            </div>
            {shouldShowOverdue && (
              <div className="px-4 py-2 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  In Ritardo: <span className="font-bold text-red-700">
                    {overdueItems.length}
                  </span>
                </span>
              </div>
            )}
            <div className="px-4 py-2 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Completate: <span className="font-bold text-green-700">
                  {completedItems.length}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Filtri */}
        {showFilters && (
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="space-y-4">
              {/* Filtri per Stato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stato
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['to_complete', 'completed', 'overdue'] as EventStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        const newStatuses = filters.statuses.includes(status)
                          ? filters.statuses.filter(s => s !== status)
                          : [...filters.statuses, status]
                        setFilters({ ...filters, statuses: newStatuses })
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.statuses.includes(status)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {status === 'to_complete' ? 'Da completare' :
                       status === 'completed' ? 'Completato' :
                       status === 'overdue' ? 'In ritardo' : status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtri per Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['generic_task', 'maintenance', 'product_expiry'] as EventType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const newTypes = filters.types.includes(type)
                          ? filters.types.filter(t => t !== type)
                          : [...filters.types, type]
                        setFilters({ ...filters, types: newTypes })
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.types.includes(type)
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type === 'generic_task' ? 'Mansioni' :
                       type === 'maintenance' ? 'Manutenzioni' :
                       type === 'product_expiry' ? 'Scadenze' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Filtri */}
              <div className="flex justify-end">
                <button
                  onClick={() => setFilters(DEFAULT_CALENDAR_FILTERS)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset filtri
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nessuna attività per questa data</p>
            </div>
          ) : (
            <>
              {/* Sezione Attività Attive */}
              {activeItems.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center px-4">
                    <Clock className="h-5 w-5 mr-2" />
                    {category === 'maintenance' ? 'Manutenzioni Attive' : 'Mansioni/Attività Attive'}
                  </h3>
                  <div className="space-y-4">
                    {activeItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {item.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[item.status].color}`}>
                            {statusConfig[item.status].icon} {statusConfig[item.status].label}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[item.priority].color}`}>
                            {priorityConfig[item.priority].icon} {priorityConfig[item.priority].label}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {item.frequency && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Frequenza:</span>
                              <span className="capitalize">{item.frequency}</span>
                            </div>
                          )}

                          {(item.assignedTo || item.assignedToRole || item.assignedToCategory) && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span className="font-medium">Assegnato a:</span>
                              <span>
                                {item.assignedToStaffId ? 'Dipendente specifico' :
                                 item.assignedToRole ? item.assignedToRole :
                                 item.assignedToCategory ? item.assignedToCategory :
                                 item.assignedTo || 'Non assegnato'}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Scadenza:</span>
                            <span>
                              {item.dueDate.toLocaleDateString('it-IT', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                          isItemSelected(item.id) ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {isItemSelected(item.id) && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Dettagli Completi
                      </h4>

                      <div className="space-y-3 text-sm">
                        {item.metadata.notes && (
                          <div>
                            <span className="font-medium text-gray-700">Note:</span>
                            <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                              {item.metadata.notes}
                            </p>
                          </div>
                        )}

                        {item.metadata.estimatedDuration && (
                          <div>
                            <span className="font-medium text-gray-700">Durata Stimata:</span>
                            <p className="text-gray-600 mt-1">
                              {item.metadata.estimatedDuration} minuti
                            </p>
                          </div>
                        )}

                        {category === 'maintenance' && item.metadata.conservationPointId && (
                          <div>
                            <span className="font-medium text-gray-700">Punto di Conservazione:</span>
                            <p className="text-gray-600 mt-1">
                              ID: {item.metadata.conservationPointId}
                            </p>
                          </div>
                        )}

                        {category === 'maintenance' && item.metadata.instructions && Array.isArray(item.metadata.instructions) && (
                          <div>
                            <span className="font-medium text-gray-700">Istruzioni:</span>
                            <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                              {item.metadata.instructions.map((instruction, idx) => (
                                <li key={idx}>{instruction}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {category === 'product_expiry' && (
                          <>
                            {item.metadata.quantity && (
                              <div>
                                <span className="font-medium text-gray-700">Quantità:</span>
                                <p className="text-gray-600 mt-1">
                                  {item.metadata.quantity} {item.metadata.unit || ''}
                                </p>
                              </div>
                            )}

                            {item.metadata.supplierName && (
                              <div>
                                <span className="font-medium text-gray-700">Fornitore:</span>
                                <p className="text-gray-600 mt-1">
                                  {item.metadata.supplierName}
                                </p>
                              </div>
                            )}

                            {item.metadata.barcode && (
                              <div>
                                <span className="font-medium text-gray-700">Barcode:</span>
                                <p className="text-gray-600 mt-1 font-mono">
                                  {item.metadata.barcode}
                                </p>
                              </div>
                            )}

                            {item.metadata.sku && (
                              <div>
                                <span className="font-medium text-gray-700">SKU:</span>
                                <p className="text-gray-600 mt-1 font-mono">
                                  {item.metadata.sku}
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        <div className="pt-3 border-t border-gray-200">
                          <span className="font-medium text-gray-700">ID Attività:</span>
                          <p className="text-gray-600 mt-1 font-mono text-xs">
                            {item.id}
                          </p>
                        </div>

                        {/* Pulsante Completa per mansioni e manutenzioni */}
                        {(category === 'generic_tasks' || category === 'maintenance') && (
                          <div className="pt-4 border-t-2 border-green-400 mt-4 bg-green-50 p-4 rounded-lg">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()

                                if (category === 'maintenance') {
                                  handleCompleteMaintenance(item.id)
                                } else {
                                  // Permetti completamento solo per eventi passati e presenti, NON futuri
                                  const today = new Date()
                                  today.setHours(0, 0, 0, 0)

                                  const taskDate = new Date(item.dueDate)
                                  taskDate.setHours(0, 0, 0, 0)

                                  // ✅ Fix: Validazione sicura per taskDate
                                  const isValidTaskDate = !isNaN(taskDate.getTime())
                                  const safeTaskDate = isValidTaskDate ? taskDate : new Date()

                                  // Debug: mostra le date per verificare il confronto
                                  console.log('🔍 Debug completamento mansione:', {
                                    taskTitle: item.title,
                                    today: today.toISOString(),
                                    taskDate: safeTaskDate.toISOString(),
                                    isFuture: safeTaskDate > today,
                                    comparison: `${safeTaskDate.getTime()} > ${today.getTime()} = ${safeTaskDate.getTime() > today.getTime()}`
                                  })

                                  // Blocca SOLO se la mansione è nel futuro
                                  if (safeTaskDate > today) {
                                    const taskDateStr = safeTaskDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
                                    toast.warning(`⚠️ Non puoi completare eventi futuri!\nQuesta mansione è del ${taskDateStr}.`, {
                                      autoClose: 5000
                                    })
                                    return
                                  }

                                  const taskId = item.metadata.taskId || item.id
                                  completeTask(
                                    { taskId: taskId },
                                    {
                                      onSuccess: async () => {
                                        await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
                                        await queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
                                        await queryClient.invalidateQueries({ queryKey: ['task-completions', companyId] })
                                        await queryClient.invalidateQueries({ queryKey: ['macro-category-events'] })

                                        toast.success('✅ Mansione completata!')
                                        
                                        // ✅ Refresh fluido: aggiorna i dati senza chiudere il modal
                                        await refreshDataFluidly()
                                        
                                        // ✅ Notifica al componente padre di aggiornare i dati
                                        onDataUpdated?.()
                                        
                                        // ✅ Chiudi solo l'item completato per feedback visivo
                                        setSelectedItems(prev => prev.filter(id => id !== item.id))
                                      },
                                      onError: (error) => {
                                        console.error('Error completing task:', error)
                                        toast.error('Errore nel completamento')
                                      }
                                    }
                                  )
                                }
                              }}
                              disabled={isCompleting || isCompletingMaintenance}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="w-5 h-5" />
                              {(isCompleting || isCompletingMaintenance) ? 'Completando...' : category === 'maintenance' ? 'Completa Manutenzione' : 'Completa Mansione'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sezione Attività in Ritardo */}
              {overdueItems.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center px-4">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    {category === 'maintenance' ? 'Manutenzioni in Ritardo' : 'Mansioni/Attività in Ritardo'}
                    <span className="ml-2 text-sm text-red-600">
                      (da 1 settimana fa fino a ieri)
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {overdueItems.map((item) => (
                      <div key={item.id} className="bg-red-50 border-2 border-red-300 rounded-lg shadow-md overflow-hidden">
                        <div
                          className="p-4 hover:bg-red-100 cursor-pointer transition-colors"
                          onClick={() => handleItemClick(item)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  ⚠️ {item.title}
                                </h3>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
                                  IN RITARDO
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[item.priority].color}`}>
                                  {priorityConfig[item.priority].icon} {priorityConfig[item.priority].label}
                                </span>
                              </div>

                              {item.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {item.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                {item.frequency && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">Frequenza:</span>
                                    <span className="capitalize">{item.frequency}</span>
                                  </div>
                                )}

                                {(item.assignedTo || item.assignedToRole || item.assignedToCategory) && (
                                  <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">Assegnato a:</span>
                                    <span>
                                      {item.assignedToStaffId ? 'Dipendente specifico' :
                                       item.assignedToRole ? item.assignedToRole :
                                       item.assignedToCategory ? item.assignedToCategory :
                                       item.assignedTo || 'Non assegnato'}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span className="font-medium">Scadenza:</span>
                                  <span className="text-red-700 font-semibold">
                                    {item.dueDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isItemSelected(item.id) ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {isItemSelected(item.id) && (
                          <div className="border-t-2 border-red-300 bg-red-50 p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Dettagli
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Descrizione completa:</span>
                                <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                  {item.description || 'Nessuna descrizione'}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">ID Attività:</span>
                                <p className="text-gray-600 mt-1 font-mono text-xs">
                                  {item.id}
                                </p>
                              </div>
                            </div>

                            {/* Pulsante Completa per mansioni in ritardo */}
                            {(category === 'generic_tasks' || category === 'maintenance') && (
                              <div className="pt-4 border-t-2 border-red-400 mt-4 bg-red-100 p-4 rounded-lg">
                                <p className="text-xs text-red-800 mb-3 text-center font-medium">
                                  ⚠️ Questa attività è in ritardo. Completala al più presto!
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()

                                    if (category === 'maintenance') {
                                      handleCompleteMaintenance(item.id)
                                    } else {
                                      // Permetti completamento solo per eventi passati e presenti, NON futuri
                                      const today = new Date()
                                      today.setHours(0, 0, 0, 0)

                                      const taskDate = new Date(item.dueDate)
                                      taskDate.setHours(0, 0, 0, 0)

                                      // ✅ Fix: Validazione sicura per taskDate
                                      const isValidTaskDate = !isNaN(taskDate.getTime())
                                      const safeTaskDate = isValidTaskDate ? taskDate : new Date()

                                      // Blocca SOLO se la mansione è nel futuro
                                      if (safeTaskDate > today) {
                                        const taskDateStr = safeTaskDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
                                        toast.warning(`⚠️ Non puoi completare eventi futuri!\nQuesta mansione è del ${taskDateStr}.`, {
                                          autoClose: 5000
                                        })
                                        return
                                      }

                                      const taskId = item.metadata.taskId || item.id
                                      completeTask(
                                        { taskId: taskId },
                                        {
                                          onSuccess: async () => {
                                            await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
                                            await queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
                                            await queryClient.invalidateQueries({ queryKey: ['task-completions', companyId] })
                                            await queryClient.invalidateQueries({ queryKey: ['macro-category-events'] })

                                            toast.success('✅ Mansione completata!')
                                            
                                            // ✅ Refresh fluido: aggiorna i dati senza chiudere il modal
                                            await refreshDataFluidly()
                                            
                                            // ✅ Notifica al componente padre di aggiornare i dati
                                            onDataUpdated?.()
                                            
                                            // ✅ Chiudi solo l'item completato per feedback visivo
                                            setSelectedItems(prev => prev.filter(id => id !== item.id))
                                          },
                                          onError: (error) => {
                                            console.error('Error completing task:', error)
                                            toast.error('Errore nel completamento')
                                          }
                                        }
                                      )
                                    }
                                  }}
                                  disabled={isCompleting || isCompletingMaintenance}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Check className="w-5 h-5" />
                                  {(isCompleting || isCompletingMaintenance) ? 'Completando...' : category === 'maintenance' ? 'Completa Manutenzione' : 'Completa Mansione in Ritardo'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sezione Attività Completate */}
              {completedItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center px-4">
                    <Check className="h-5 w-5 mr-2 text-green-600" />
                    {category === 'maintenance' ? 'Manutenzioni Completate' : 'Mansioni/Attività Completate'}
                  </h3>
                  <div className="space-y-4">
                    {completedItems.map((item) => (
                      <div key={item.id} className="bg-green-50 border border-green-200 rounded-lg shadow-sm overflow-hidden opacity-75">
                        <div
                          className="p-4 hover:bg-green-100 cursor-pointer transition-colors"
                          onClick={() => handleItemClick(item)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                ✅ {item.title}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {isItemSelected(item.id) && (
                          <div className="border-t border-green-200 bg-green-50 p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Dettagli
                            </h4>
                            <div className="space-y-3 text-sm">
                              {/* Informazioni di completamento */}
                              {item.metadata.completedAt && (
                                <div className="bg-green-100 p-3 rounded-lg border border-green-300">
                                  <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                                    <Check className="h-4 w-4 mr-2" />
                                    Log Completamento
                                  </h5>
                                  <div className="space-y-1 text-xs text-green-800">
                                    <div className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span className="font-medium">Completata il:</span>
                                      <span className="ml-1">
                                        {new Date(item.metadata.completedAt).toLocaleString('it-IT', {
                                          day: '2-digit',
                                          month: 'long',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    {(item.metadata.completedBy || item.metadata.completedByName) && (
                                      <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1" />
                                        <span className="font-medium">Completata da:</span>
                                        <span className="ml-1">
                                          {item.metadata.completedByName || 
                                           (item.metadata.completedBy ? `ID: ${item.metadata.completedBy.substring(0, 8)}...` : 'Sconosciuto')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Note completamento */}
                              {item.metadata.completionNotes && (
                                <div>
                                  <span className="font-medium text-gray-700">Note completamento:</span>
                                  <p className="text-gray-600 mt-1 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                                    {item.metadata.completionNotes}
                                  </p>
                                </div>
                              )}

                              {/* Note task */}
                              {item.metadata.notes && (
                                <div>
                                  <span className="font-medium text-gray-700">Descrizione task:</span>
                                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                    {item.metadata.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Pulsante Ripristina per mansioni/manutenzioni completate - SOLO per chi ha completato */}
                            {(category === 'generic_tasks' || category === 'maintenance') && (() => {
                              const canUncomplete = item.metadata.completedBy === user?.id
                              
                              // Mostra la sezione SOLO se l'utente può ripristinare
                              if (!canUncomplete) {
                                return null
                              }
                              
                              return (
                                <div className="pt-4 border-t-2 border-yellow-400 mt-4 bg-yellow-50 p-4 rounded-lg">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()

                                      if (category === 'maintenance') {
                                        handleUncompleteMaintenance(item.id)
                                      } else {
                                        const taskId = item.metadata.taskId || item.id
                                        uncompleteTask(
                                          { taskId: taskId },
                                          {
                                            onSuccess: async () => {
                                              await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
                                              await queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
                                              await queryClient.invalidateQueries({ queryKey: ['task-completions', companyId] })
                                              await queryClient.invalidateQueries({ queryKey: ['macro-category-events'] })
                                              
                                              // ✅ Refresh fluido: aggiorna i dati senza chiudere il modal
                                              await refreshDataFluidly()
                                              
                                              // ✅ Notifica al componente padre di aggiornare i dati
                                              onDataUpdated?.()
                                              
                                              // ✅ Chiudi solo l'item ripristinato per feedback visivo
                                              setSelectedItems(prev => prev.filter(id => id !== item.id))
                                            },
                                            onError: (error) => {
                                              console.error('Error uncompleting task:', error)
                                            }
                                          }
                                        )
                                      }
                                    }}
                                    disabled={isUncompleting || isUncompletingMaintenance}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <RotateCcw className="w-5 h-5" />
                                    {(isUncompleting || isUncompletingMaintenance) ? 'Ripristinando...' : `Ripristina come "Da Completare"`}
                                  </button>
                                  <p className="text-xs text-gray-600 mt-2 text-center">
                                    ⚠️ Questo annullerà il completamento della {category === 'maintenance' ? 'manutenzione' : 'mansione'}
                                  </p>
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MacroCategoryModal
