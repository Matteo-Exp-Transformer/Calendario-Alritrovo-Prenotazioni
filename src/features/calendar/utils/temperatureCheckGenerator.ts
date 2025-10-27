import type { ConservationPoint } from '@/types/conservation'
import type { CalendarEvent } from '@/types/calendar'
import { addDays, addWeeks, addMonths, startOfDay, setHours } from 'date-fns'

export interface TemperatureCheckSchedule {
  conservationPointId: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  customDays?: string[]
  startHour?: number
  assignedToRole?: string
  assignedToCategory?: string
  assignedToStaffId?: string
}

export interface GenerateTemperatureChecksOptions {
  startDate?: Date
  daysAhead?: number
  maxEventsPerPoint?: number
}

const DEFAULT_OPTIONS: GenerateTemperatureChecksOptions = {
  startDate: new Date(),
  daysAhead: 90,
  maxEventsPerPoint: 100,
}

export function generateTemperatureCheckEvents(
  conservationPoints: ConservationPoint[],
  companyId: string,
  userId: string,
  options: GenerateTemperatureChecksOptions = DEFAULT_OPTIONS
): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const startDate = options.startDate || new Date()
  const daysAhead = options.daysAhead || 90
  const maxEvents = options.maxEventsPerPoint || 100

  conservationPoints.forEach(point => {
    const frequency = inferFrequencyFromPoint(point)
    const schedule: TemperatureCheckSchedule = {
      conservationPointId: point.id,
      frequency,
      startHour: 9,
      assignedToRole: 'dipendente',
      assignedToCategory: 'all',
    }

    const pointEvents = generateEventsForSchedule(
      point,
      schedule,
      startDate,
      daysAhead,
      maxEvents,
      companyId,
      userId
    )

    events.push(...pointEvents)
  })

  return events
}

function inferFrequencyFromPoint(
  point: ConservationPoint
): 'daily' | 'weekly' | 'monthly' {
  if (point.type === 'blast' || point.type === 'fridge') {
    return 'daily'
  }

  if (point.type === 'freezer') {
    return 'weekly'
  }

  return 'weekly'
}

function generateEventsForSchedule(
  point: ConservationPoint,
  schedule: TemperatureCheckSchedule,
  startDate: Date,
  daysAhead: number,
  maxEvents: number,
  companyId: string,
  userId: string
): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const endDate = addDays(startDate, daysAhead)
  let currentDate = startOfDay(startDate)
  let eventCount = 0

  while (currentDate <= endDate && eventCount < maxEvents) {
    if (shouldGenerateEventForDate(currentDate, schedule)) {
      const event = createTemperatureCheckEvent(
        point,
        schedule,
        currentDate,
        companyId,
        userId
      )
      events.push(event)
      eventCount++
    }

    currentDate = getNextDate(currentDate, schedule.frequency)
  }

  return events
}

function shouldGenerateEventForDate(
  date: Date,
  schedule: TemperatureCheckSchedule
): boolean {
  if (schedule.frequency === 'daily') {
    return true
  }

  if (schedule.frequency === 'weekly') {
    return date.getDay() === 1
  }

  if (schedule.frequency === 'monthly') {
    return date.getDate() === 1
  }

  if (schedule.frequency === 'custom' && schedule.customDays) {
    const dayNames = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato']
    const dayName = dayNames[date.getDay()]
    return schedule.customDays.includes(dayName)
  }

  return false
}

function getNextDate(
  currentDate: Date,
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
): Date {
  switch (frequency) {
    case 'daily':
      return addDays(currentDate, 1)
    case 'weekly':
      return addWeeks(currentDate, 1)
    case 'monthly':
      return addMonths(currentDate, 1)
    case 'custom':
      return addDays(currentDate, 1)
    default:
      return addDays(currentDate, 1)
  }
}

function createTemperatureCheckEvent(
  point: ConservationPoint,
  schedule: TemperatureCheckSchedule,
  date: Date,
  companyId: string,
  userId: string
): CalendarEvent {
  const eventTime = setHours(date, schedule.startHour || 9)
  const endTime = setHours(date, (schedule.startHour || 9) + 1)

  const frequencyLabel = {
    daily: 'giornaliero',
    weekly: 'settimanale',
    monthly: 'mensile',
    custom: 'personalizzato',
  }[schedule.frequency]

  const title = `🌡️ Controllo Temperatura: ${point.name}`
  const description = `Rilevamento temperatura ${frequencyLabel} per ${point.name}\nTemp. obiettivo: ${point.setpoint_temp}°C`

  const colors = {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
    textColor: '#065F46',
  }

  return {
    id: `temp-check-${point.id}-${date.getTime()}`,
    title,
    description,
    start: eventTime,
    end: endTime,
    allDay: false,
    type: 'temperature_reading',
    status: 'pending',
    priority: 'medium',
    source: 'temperature_reading',
    sourceId: point.id,
    assigned_to: schedule.assignedToStaffId ? [schedule.assignedToStaffId] : [],
    conservation_point_id: point.id,
    department_id: point.department_id,
    recurring: true,
    recurrence_pattern: {
      frequency: schedule.frequency,
      interval: 1,
      days_of_week:
        schedule.frequency === 'weekly' ? [1] : undefined,
      day_of_month: schedule.frequency === 'monthly' ? 1 : undefined,
    },
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    textColor: colors.textColor,
    metadata: {
      conservation_point_id: point.id,
      temperature_reading_id: `temp-check-${point.id}-${date.getTime()}`,
      assigned_to_role: schedule.assignedToRole,
      assigned_to_category: schedule.assignedToCategory,
      assigned_to_staff_id: schedule.assignedToStaffId,
      notes: `Controllo temperatura ${frequencyLabel}`,
    },
    extendedProps: {
      status: 'scheduled',
      priority: 'medium',
      assignedTo: schedule.assignedToStaffId ? [schedule.assignedToStaffId] : [],
      metadata: {
        conservationPointName: point.name,
        targetTemperature: point.setpoint_temp,
        pointType: point.type,
        frequency: schedule.frequency,
      },
    },
    created_at: new Date(),
    updated_at: new Date(),
    created_by: userId,
    company_id: companyId,
  }
}
