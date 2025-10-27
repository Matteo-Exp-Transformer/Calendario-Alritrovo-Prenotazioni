import { useMemo, useCallback } from 'react'
import type { CalendarEvent } from '@/types/calendar'
import { differenceInHours, isPast } from 'date-fns'

export interface CalendarAlert {
  id: string
  event: CalendarEvent
  severity: 'critical' | 'high' | 'medium'
  message: string
  isDismissed: boolean
}

export interface CalendarAlertsResult {
  alerts: CalendarAlert[]
  alertCount: number
  criticalCount: number
  dismissAlert: (alertId: string) => void
  clearAllAlerts: () => void
  dismissedAlerts: string[]
}

const STORAGE_KEY = 'calendar-dismissed-alerts'
const ALERT_THRESHOLD_HOURS = 72 // 3 giorni

function getDismissedAlerts(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveDismissedAlerts(alertIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alertIds))
  } catch (error) {
    console.error('Failed to save dismissed alerts:', error)
  }
}

export function useCalendarAlerts(events: CalendarEvent[]): CalendarAlertsResult {
  const dismissedAlerts = useMemo(() => getDismissedAlerts(), [])

  const alerts = useMemo(() => {
    const now = new Date()
    const alertsList: CalendarAlert[] = []

    events.forEach(event => {
      // Ignora eventi completati o cancellati
      if (event.status === 'completed' || event.status === 'cancelled') {
        return
      }

      const eventStart = new Date(event.start)
      const isOverdue = isPast(eventStart) && (event.status !== 'completed' as any)
      const hoursUntilEvent = differenceInHours(eventStart, now)

      // ✅ FILTRO IMPORTANTE: Ignora eventi futuri oltre i 3 giorni
      if (!isOverdue && hoursUntilEvent > ALERT_THRESHOLD_HOURS) {
        return
      }

      // ✅ FILTRO RICORRENTI: Per eventi ricorrenti (controlli temperatura, etc.)
      // mostra solo se sono critici o high priority, oppure se scaduti
      if (event.recurring && !isOverdue && event.priority !== 'critical' && event.priority !== 'high') {
        return
      }


      let severity: CalendarAlert['severity'] | null = null
      let message = ''

      // ✅ CASO 1: Evento SCADUTO o non eseguito
      if (isOverdue) {
        severity = 'critical'
        const daysPast = Math.abs(Math.floor(hoursUntilEvent / 24))
        message = `⚠️ SCADUTO da ${daysPast} ${daysPast === 1 ? 'giorno' : 'giorni'}: ${event.title}`
      } 
      // ✅ CASO 2: Evento ENTRO 3 GIORNI (72 ore)
      else if (hoursUntilEvent <= ALERT_THRESHOLD_HOURS) {
        // Severity basata su priorità e tempo rimanente
        if (event.priority === 'critical' || hoursUntilEvent <= 24) {
          severity = 'critical'
          const hours = Math.max(0, Math.floor(hoursUntilEvent))
          message = `🔴 URGENTE (${hours}h): ${event.title}`
        } else if (event.priority === 'high' || hoursUntilEvent <= 48) {
          severity = 'high'
          const days = Math.ceil(hoursUntilEvent / 24)
          message = `🟠 In scadenza tra ${days} ${days === 1 ? 'giorno' : 'giorni'}: ${event.title}`
        } else {
          severity = 'medium'
          const days = Math.ceil(hoursUntilEvent / 24)
          message = `🟡 Promemoria (${days} giorni): ${event.title}`
        }
      }

      if (severity) {
        const alertId = `${event.id}-${eventStart.getTime()}`
        alertsList.push({
          id: alertId,
          event,
          severity,
          message,
          isDismissed: dismissedAlerts.includes(alertId),
        })
      }
    })

    return alertsList.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity]
      }
      return new Date(a.event.start).getTime() - new Date(b.event.start).getTime()
    })
  }, [events, dismissedAlerts])

  const activeAlerts = useMemo(
    () => alerts.filter(alert => !alert.isDismissed),
    [alerts]
  )

  const alertCount = activeAlerts.length

  const criticalCount = useMemo(
    () => activeAlerts.filter(alert => alert.severity === 'critical').length,
    [activeAlerts]
  )


  const dismissAlert = useCallback((alertId: string) => {
    const current = getDismissedAlerts()
    if (!current.includes(alertId)) {
      saveDismissedAlerts([...current, alertId])
    }
  }, [])

  const clearAllAlerts = useCallback(() => {
    saveDismissedAlerts([])
  }, [])

  return {
    alerts: activeAlerts,
    alertCount,
    criticalCount,
    dismissAlert,
    clearAllAlerts,
    dismissedAlerts,
  }
}

export function useAlertBadge(events: CalendarEvent[]): {
  count: number
  criticalCount: number
  hasAlerts: boolean
  hasCritical: boolean
  alerts: CalendarAlert[]
} {
  const { alertCount, criticalCount, alerts } = useCalendarAlerts(events)

  return {
    count: alertCount,
    criticalCount,
    hasAlerts: alertCount > 0,
    hasCritical: criticalCount > 0,
    alerts,
  }
}
