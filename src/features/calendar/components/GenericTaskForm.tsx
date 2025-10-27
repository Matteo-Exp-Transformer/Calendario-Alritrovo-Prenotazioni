import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Select,
  SelectOption,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

type MaintenanceFrequency = 'annuale' | 'mensile' | 'settimanale' | 'giornaliera' | 'custom'
type StaffRole = 'admin' | 'responsabile' | 'dipendente' | 'collaboratore' | 'all'
type CustomFrequencyDays = 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica'

interface GenericTaskFormData {
  name: string
  frequenza: MaintenanceFrequency
  assegnatoARuolo: StaffRole
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  giorniCustom?: CustomFrequencyDays[]
  dataInizio?: string // Data di inizio in formato ISO (YYYY-MM-DD)
  dataFine?: string // Data fine in formato ISO (YYYY-MM-DD) - Opzionale per intervallo
  departmentId: string // Reparto assegnato (obbligatorio) - per filtri calendario
  note?: string
  
  // Gestione Orario Attività
  timeManagement?: {
    // Fascia oraria per visibilità evento
    timeRange?: {
      startTime: string // formato HH:MM
      endTime: string   // formato HH:MM
      isOvernight: boolean // true se endTime è del giorno dopo
    }
    // Opzioni di completamento
    completionType?: 'timeRange' | 'startTime' | 'endTime' | 'none'
    completionStartTime?: string // formato HH:MM - da quando può essere completato
    completionEndTime?: string   // formato HH:MM - entro quando può essere completato
  }
}

interface GenericTaskFormProps {
  staffOptions: Array<{ id: string; label: string; role: string; categories: string[] }>
  departmentOptions?: Array<{ id: string; name: string }> // Lista reparti attivi
  onSubmit: (data: GenericTaskFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

const MAINTENANCE_FREQUENCIES: Array<{
  value: MaintenanceFrequency
  label: string
}> = [
  { value: 'annuale', label: 'Annuale' },
  { value: 'mensile', label: 'Mensile' },
  { value: 'settimanale', label: 'Settimanale' },
  { value: 'giornaliera', label: 'Giornaliera' },
  { value: 'custom', label: 'Personalizzata' },
]

const CUSTOM_DAYS: Array<{
  value: CustomFrequencyDays
  label: string
}> = [
  { value: 'lunedi', label: 'Lunedì' },
  { value: 'martedi', label: 'Martedì' },
  { value: 'mercoledi', label: 'Mercoledì' },
  { value: 'giovedi', label: 'Giovedì' },
  { value: 'venerdi', label: 'Venerdì' },
  { value: 'sabato', label: 'Sabato' },
  { value: 'domenica', label: 'Domenica' },
]

export const GenericTaskForm = ({
  staffOptions,
  departmentOptions = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: GenericTaskFormProps) => {
  const [formData, setFormData] = useState<GenericTaskFormData>({
    name: '',
    frequenza: 'settimanale',
    assegnatoARuolo: 'dipendente',
    assegnatoACategoria: 'all',
    departmentId: '',
    note: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isTimeManagementOpen, setIsTimeManagementOpen] = useState(false)

  // Helper per gestire orari notturni
  const isOvernightTime = (startTime: string, endTime: string): boolean => {
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    return end <= start
  }

  // Helper per aggiornare timeManagement
  const updateTimeManagement = (updates: Partial<GenericTaskFormData['timeManagement']>) => {
    setFormData(prev => ({
      ...prev,
      timeManagement: {
        ...prev.timeManagement,
        ...updates
      }
    }))
  }

  const updateField = (updates: Partial<GenericTaskFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    
    // Pulisci errori correlati
    const newErrors = { ...errors }
    Object.keys(updates).forEach(key => {
      delete newErrors[key]
    })
    setErrors(newErrors)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Nome attività obbligatorio'
    }
    if (!formData.frequenza) {
      newErrors.frequenza = 'Frequenza obbligatoria'
    }
    if (!formData.assegnatoARuolo) {
      newErrors.ruolo = 'Ruolo obbligatorio'
    }
    if (formData.frequenza === 'custom' && (!formData.giorniCustom || formData.giorniCustom.length === 0)) {
      newErrors.giorni = 'Seleziona almeno un giorno per frequenza personalizzata'
    }
    if (!formData.departmentId || formData.departmentId === 'none') {
      newErrors.departmentId = 'Reparto obbligatorio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData)
      // Reset form dopo invio
      setFormData({
        name: '',
        frequenza: 'settimanale',
        assegnatoARuolo: 'dipendente',
        assegnatoACategoria: 'all',
        departmentId: '',
        note: '',
      })
      setErrors({})
    }
  }

  const filteredStaffByRole = useMemo(() => {
    return staffOptions.filter(staff => staff.role === formData.assegnatoARuolo)
  }, [staffOptions, formData.assegnatoARuolo])

  const availableCategories = useMemo(() => {
    const categories = filteredStaffByRole
      .flatMap(staff => staff.categories)
      .filter(category => category && category.trim() !== '')
      .filter((category, index, arr) => arr.indexOf(category) === index)
    return categories
  }, [filteredStaffByRole])

  const filteredStaffByCategory = useMemo(() => {
    if (!formData.assegnatoACategoria || formData.assegnatoACategoria === 'all') {
      return filteredStaffByRole
    }
    return filteredStaffByRole.filter(staff =>
      staff.categories.includes(formData.assegnatoACategoria!)
    )
  }, [filteredStaffByRole, formData.assegnatoACategoria])

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">
          Nuova Attività Generica
        </h4>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Nome attività */}
        <div className="md:col-span-2">
          <Label>Nome attività *</Label>
          <Input
            value={formData.name}
            onChange={e => updateField({ name: e.target.value })}
            placeholder="Es: Pulizia cucina, Controllo fornelli..."
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Frequenza */}
        <div>
          <Label>Frequenza *</Label>
          <Select
            value={formData.frequenza}
            onValueChange={value =>
              updateField({
                frequenza: value as MaintenanceFrequency,
                giorniCustom: value === 'custom' ? ['lunedi'] : undefined
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona frequenza" />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_FREQUENCIES.map(freq => (
                <SelectOption key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
          {errors.frequenza && (
            <p className="mt-1 text-sm text-red-600">{errors.frequenza}</p>
          )}
        </div>


        {/* Ruolo */}
        <div>
          <Label>Ruolo *</Label>
          <Select
            value={formData.assegnatoARuolo || ''}
            onValueChange={value =>
              updateField({
                assegnatoARuolo: value as StaffRole,
                assegnatoACategoria: 'all',
                assegnatoADipendenteSpecifico: undefined
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona ruolo" />
            </SelectTrigger>
            <SelectContent>
              <SelectOption value="all">Tutti</SelectOption>
              <SelectOption value="admin">Amministratore</SelectOption>
              <SelectOption value="responsabile">Responsabile</SelectOption>
              <SelectOption value="dipendente">Dipendente</SelectOption>
              <SelectOption value="collaboratore">Collaboratore</SelectOption>
            </SelectContent>
          </Select>
          {errors.ruolo && (
            <p className="mt-1 text-sm text-red-600">{errors.ruolo}</p>
          )}
        </div>

        {/* Categoria */}
        <div>
          <Label>Categoria</Label>
          <Select
            value={formData.assegnatoACategoria || 'all'}
            onValueChange={value =>
              updateField({
                assegnatoACategoria: value,
                assegnatoADipendenteSpecifico: undefined
              })
            }
            disabled={!formData.assegnatoARuolo || availableCategories.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                formData.assegnatoARuolo
                  ? "Seleziona categoria"
                  : "Prima seleziona un ruolo"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectOption value="all">Tutte le categorie</SelectOption>
              {availableCategories.map(category => (
                <SelectOption key={category} value={category}>
                  {category}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dipendente specifico */}
        <div>
          <Label>Dipendente specifico</Label>
          <Select
            value={formData.assegnatoADipendenteSpecifico ?? 'none'}
            onValueChange={value =>
              updateField({
                assegnatoADipendenteSpecifico: value === 'none' ? undefined : value,
              })
            }
            disabled={filteredStaffByCategory.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Opzionale: seleziona dipendente specifico" />
            </SelectTrigger>
            <SelectContent>
              <SelectOption value="none">Nessun dipendente specifico</SelectOption>
              {filteredStaffByCategory.map(staff => (
                <SelectOption key={staff.id} value={staff.id}>
                  {staff.label} - {staff.categories.join(', ')}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reparto (obbligatorio) */}
        <div>
          <Label>Reparto *</Label>
          <Select
            value={formData.departmentId}
            onValueChange={value => updateField({ departmentId: value })}
            disabled={departmentOptions.length === 0}
          >
            <SelectTrigger aria-invalid={Boolean(errors.departmentId)}>
              <SelectValue placeholder={
                departmentOptions.length > 0
                  ? "Seleziona reparto"
                  : "Nessun reparto disponibile"
              } />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map(dept => (
                <SelectOption key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
          {errors.departmentId && (
            <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            💡 Il reparto è obbligatorio per organizzare le attività
          </p>
        </div>

        {/* Giorni custom se frequenza personalizzata */}
        {formData.frequenza === 'custom' && (
          <div className="md:col-span-2">
            <Label>Giorni della settimana *</Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {CUSTOM_DAYS.map(day => (
                <label key={day.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.giorniCustom?.includes(day.value) ?? false}
                    onChange={e => {
                      const currentDays = formData.giorniCustom || []
                      const newDays = e.target.checked
                        ? [...currentDays, day.value]
                        : currentDays.filter(d => d !== day.value)
                      updateField({ giorniCustom: newDays })
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{day.label}</span>
                </label>
              ))}
            </div>
            {errors.giorni && (
              <p className="mt-1 text-sm text-red-600">{errors.giorni}</p>
            )}
          </div>
        )}

        {/* Gestione Orario Attività - Sezione Collapse */}
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => setIsTimeManagementOpen(!isTimeManagementOpen)}
            className="flex items-center gap-2 w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          >
            <Clock className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">Gestione Orario Attività</span>
            {isTimeManagementOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-600 ml-auto" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600 ml-auto" />
            )}
          </button>
          
          {isTimeManagementOpen && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                💡 Configura quando l'attività può essere completata. 
                Se non configurato, usa l'orario di apertura dell'azienda.
              </p>

              {/* Opzioni di Completamento */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Opzioni Completamento</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateTimeManagement({ completionType: 'none' })}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      formData.timeManagement?.completionType === 'none' || !formData.timeManagement?.completionType
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Orario di Apertura
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => updateTimeManagement({ completionType: 'timeRange' })}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      formData.timeManagement?.completionType === 'timeRange'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Fascia Oraria
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => updateTimeManagement({ completionType: 'startTime' })}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      formData.timeManagement?.completionType === 'startTime'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Orario di Inizio
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => updateTimeManagement({ completionType: 'endTime' })}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      formData.timeManagement?.completionType === 'endTime'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Orario Fine
                  </button>
                </div>

                {/* Fascia Oraria Completamento */}
                {formData.timeManagement?.completionType === 'timeRange' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label className="text-sm font-medium text-blue-800">Fascia Oraria per Completamento</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <div>
                        <Label className="text-sm font-medium text-blue-700">Orario Inizio</Label>
                        <Input
                          type="time"
                          value={formData.timeManagement?.timeRange?.startTime || '09:00'}
                          onChange={e => {
                            const startTime = e.target.value
                            const endTime = formData.timeManagement?.timeRange?.endTime || '17:00'
                            const isOvernight = isOvernightTime(startTime, endTime)
                            
                            updateTimeManagement({
                              timeRange: {
                                startTime,
                                endTime,
                                isOvernight
                              }
                            })
                          }}
                          className="w-full mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-blue-700">Orario Fine</Label>
                        <Input
                          type="time"
                          value={formData.timeManagement?.timeRange?.endTime || '17:00'}
                          onChange={e => {
                            const endTime = e.target.value
                            const startTime = formData.timeManagement?.timeRange?.startTime || '09:00'
                            const isOvernight = isOvernightTime(startTime, endTime)
                            
                            updateTimeManagement({
                              timeRange: {
                                startTime,
                                endTime,
                                isOvernight
                              }
                            })
                          }}
                          className="w-full mt-1"
                        />
                      </div>
                    </div>
                    
                    {formData.timeManagement?.timeRange?.isOvernight && (
                      <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded text-sm text-blue-800">
                        🌙 Orario notturno (fine giorno dopo)
                      </div>
                    )}
                    
                    <p className="text-xs text-blue-600 mt-2">
                      L'attività potrà essere completata solo durante questa fascia oraria
                    </p>
                  </div>
                )}

                {/* Orario Inizio Completamento */}
                {formData.timeManagement?.completionType === 'startTime' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label className="text-sm font-medium text-blue-800">Da quando può essere completata</Label>
                    <Input
                      type="time"
                      value={formData.timeManagement?.completionStartTime || '09:00'}
                      onChange={e => updateTimeManagement({ completionStartTime: e.target.value })}
                      className="w-full max-w-xs mt-2"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      L'attività potrà essere completata da questo orario in poi
                    </p>
                  </div>
                )}

                {/* Orario Fine Completamento */}
                {formData.timeManagement?.completionType === 'endTime' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label className="text-sm font-medium text-blue-800">Entro quando può essere completata</Label>
                    <Input
                      type="time"
                      value={formData.timeManagement?.completionEndTime || '18:00'}
                      onChange={e => updateTimeManagement({ completionEndTime: e.target.value })}
                      className="w-full max-w-xs mt-2"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      L'attività potrà essere completata entro questo orario
                    </p>
                  </div>
                )}

                {/* Orario di Apertura Default */}
                {(!formData.timeManagement?.completionType || formData.timeManagement?.completionType === 'none') && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700">Usa orario di apertura azienda</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      L'attività seguirà gli orari di apertura configurati per l'azienda
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="md:col-span-2">
          <Label>Note (opzionale)</Label>
          <Textarea
            rows={3}
            value={formData.note ?? ''}
            onChange={e => updateField({ note: e.target.value })}
            placeholder="Note aggiuntive sull'attività..."
          />
        </div>
      </div>

      {/* Azioni */}
      <div className="flex justify-end gap-3 border-t pt-4 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Annulla
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Creazione...' : 'Crea Attività'}
        </Button>
      </div>
    </div>
  )
}

export default GenericTaskForm

