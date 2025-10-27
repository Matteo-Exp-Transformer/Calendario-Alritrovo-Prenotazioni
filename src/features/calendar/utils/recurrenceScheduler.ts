import { addDays, addWeeks, addMonths, addYears, startOfDay } from 'date-fns'

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

export interface RecurrencePattern {
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  endDate?: Date
  maxOccurrences?: number
  customDays?: string[]
}

export interface ScheduledOccurrence {
  date: Date
  occurrenceNumber: number
  isLast: boolean
}

export function calculateNextOccurrences(
  startDate: Date,
  pattern: RecurrencePattern,
  count: number = 10
): ScheduledOccurrence[] {
  const occurrences: ScheduledOccurrence[] = []
  let currentDate = startOfDay(startDate)
  let occurrenceNumber = 0

  while (occurrences.length < count) {
    if (pattern.maxOccurrences && occurrenceNumber >= pattern.maxOccurrences) {
      break
    }

    if (pattern.endDate && currentDate > pattern.endDate) {
      break
    }

    if (shouldIncludeDate(currentDate, pattern, occurrenceNumber)) {
      occurrences.push({
        date: new Date(currentDate),
        occurrenceNumber: occurrenceNumber + 1,
        isLast:
          (pattern.maxOccurrences &&
            occurrenceNumber + 1 >= pattern.maxOccurrences) ||
          false,
      })
      occurrenceNumber++
    }

    currentDate = getNextCandidateDate(currentDate, pattern)
  }

  return occurrences
}

export function calculateNextDue(
  currentDate: Date,
  frequency: 'giornaliera' | 'settimanale' | 'mensile' | 'annuale' | 'custom',
  customDays?: string[]
): Date {
  const now = startOfDay(currentDate)

  switch (frequency) {
    case 'giornaliera':
      return addDays(now, 1)

    case 'settimanale':
      return addWeeks(now, 1)

    case 'mensile':
      return addMonths(now, 1)

    case 'annuale':
      return addYears(now, 1)

    case 'custom':
      if (customDays && customDays.length > 0) {
        return findNextCustomDay(now, customDays)
      }
      return addWeeks(now, 1)

    default:
      return addWeeks(now, 1)
  }
}

function shouldIncludeDate(
  date: Date,
  pattern: RecurrencePattern,
  occurrenceNumber: number
): boolean {
  if (occurrenceNumber === 0) {
    return true
  }

  if (pattern.frequency === 'custom' && pattern.customDays) {
    const dayNames = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato']
    const dayName = dayNames[date.getDay()]
    return pattern.customDays.includes(dayName)
  }

  if (pattern.frequency === 'weekly' && pattern.daysOfWeek) {
    return pattern.daysOfWeek.includes(date.getDay())
  }

  if (pattern.frequency === 'monthly' && pattern.dayOfMonth) {
    return date.getDate() === pattern.dayOfMonth
  }

  return true
}

function getNextCandidateDate(
  currentDate: Date,
  pattern: RecurrencePattern
): Date {
  switch (pattern.frequency) {
    case 'daily':
      return addDays(currentDate, pattern.interval)

    case 'weekly':
      return addDays(currentDate, 1)

    case 'monthly':
      if (pattern.dayOfMonth) {
        return addDays(currentDate, 1)
      }
      return addMonths(currentDate, pattern.interval)

    case 'yearly':
      return addYears(currentDate, pattern.interval)

    case 'custom':
      return addDays(currentDate, 1)

    default:
      return addDays(currentDate, pattern.interval)
  }
}

function findNextCustomDay(currentDate: Date, customDays: string[]): Date {
  const dayNameToNumber: Record<string, number> = {
    domenica: 0,
    lunedi: 1,
    martedi: 2,
    mercoledi: 3,
    giovedi: 4,
    venerdi: 5,
    sabato: 6,
  }

  const customDayNumbers = customDays
    .map(day => dayNameToNumber[day.toLowerCase()])
    .filter(num => num !== undefined)
    .sort((a, b) => a - b)

  if (customDayNumbers.length === 0) {
    return addWeeks(currentDate, 1)
  }

  let candidateDate = addDays(currentDate, 1)
  const maxDays = 14

  for (let i = 0; i < maxDays; i++) {
    if (customDayNumbers.includes(candidateDate.getDay())) {
      return candidateDate
    }
    candidateDate = addDays(candidateDate, 1)
  }

  return addWeeks(currentDate, 1)
}

export function isRecurringEventDue(
  lastOccurrence: Date,
  pattern: RecurrencePattern,
  checkDate: Date = new Date()
): boolean {
  const nextOccurrences = calculateNextOccurrences(lastOccurrence, pattern, 1)

  if (nextOccurrences.length === 0) {
    return false
  }

  const nextDue = nextOccurrences[0].date
  return checkDate >= nextDue
}

export function expandRecurringEvent(
  startDate: Date,
  pattern: RecurrencePattern,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  const occurrences: Date[] = []
  let currentDate = startOfDay(startDate)
  let occurrenceNumber = 0

  while (currentDate <= rangeEnd) {
    if (pattern.maxOccurrences && occurrenceNumber >= pattern.maxOccurrences) {
      break
    }

    if (pattern.endDate && currentDate > pattern.endDate) {
      break
    }

    if (shouldIncludeDate(currentDate, pattern, occurrenceNumber)) {
      if (currentDate >= rangeStart && currentDate <= rangeEnd) {
        occurrences.push(new Date(currentDate))
      }
      occurrenceNumber++
    }

    currentDate = getNextCandidateDate(currentDate, pattern)

    if (occurrenceNumber > 1000) {
      console.warn('Recurrence expansion exceeded 1000 occurrences, stopping')
      break
    }
  }

  return occurrences
}
