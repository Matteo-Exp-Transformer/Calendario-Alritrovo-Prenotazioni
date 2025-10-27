import type { StaffMember } from '@/features/management/hooks/useStaff'
import type { CalendarEvent } from '@/types/calendar'
import { differenceInDays, parseISO } from 'date-fns'

export interface HaccpDeadlineConfig {
  warningDays: number[]
  criticalDays: number
}

const DEFAULT_CONFIG: HaccpDeadlineConfig = {
  warningDays: [90, 60, 30, 14, 7],
  criticalDays: 7,
}

export function generateHaccpDeadlineEvents(
  staff: StaffMember[],
  companyId: string,
  userId: string,
  config: HaccpDeadlineConfig = DEFAULT_CONFIG
): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const now = new Date()

  staff.forEach(member => {
    if (
      !member.haccp_certification ||
      typeof member.haccp_certification !== 'object' ||
      !('expiry_date' in member.haccp_certification)
    ) {
      return
    }

    const cert = member.haccp_certification as {
      expiry_date: string
      level?: string
      issuing_authority?: string
      certificate_number?: string
    }

    const expiryDate = parseISO(cert.expiry_date)
    const daysUntilExpiry = differenceInDays(expiryDate, now)

    if (daysUntilExpiry < 0) {
      events.push(
        createHaccpExpiryEvent(
          member,
          cert,
          expiryDate,
          daysUntilExpiry,
          companyId,
          userId,
          'overdue'
        )
      )
      return
    }

    if (daysUntilExpiry <= config.criticalDays) {
      events.push(
        createHaccpExpiryEvent(
          member,
          cert,
          expiryDate,
          daysUntilExpiry,
          companyId,
          userId,
          'critical'
        )
      )
      return
    }

    config.warningDays.forEach(warningDay => {
      if (daysUntilExpiry <= warningDay && daysUntilExpiry > warningDay - 1) {
        const priority =
          daysUntilExpiry <= 30
            ? 'high'
            : daysUntilExpiry <= 60
              ? 'medium'
              : 'low'

        events.push(
          createHaccpExpiryEvent(
            member,
            cert,
            expiryDate,
            daysUntilExpiry,
            companyId,
            userId,
            'warning',
            priority
          )
        )
      }
    })
  })

  return events
}

function createHaccpExpiryEvent(
  staffMember: StaffMember,
  cert: {
    expiry_date: string
    level?: string
    issuing_authority?: string
    certificate_number?: string
  },
  expiryDate: Date,
  daysUntilExpiry: number,
  companyId: string,
  userId: string,
  type: 'warning' | 'critical' | 'overdue',
  priority?: 'low' | 'medium' | 'high' | 'critical'
): CalendarEvent {
  const finalPriority: CalendarEvent['priority'] =
    priority ||
    (type === 'overdue' || type === 'critical' ? 'critical' : 'high')

  const status: CalendarEvent['status'] =
    type === 'overdue' ? 'overdue' : 'pending'

  let title = ''
  let description = ''

  if (type === 'overdue') {
    title = `⚠️ SCADUTO: Certificato HACCP ${staffMember.name}`
    description = `Il certificato HACCP di ${staffMember.name} è scaduto da ${Math.abs(daysUntilExpiry)} giorni. Rinnovo urgente richiesto!`
  } else if (type === 'critical') {
    title = `🔴 URGENTE: Rinnovo HACCP ${staffMember.name}`
    description = `Il certificato HACCP di ${staffMember.name} scade tra ${daysUntilExpiry} giorni. Azione immediata richiesta!`
  } else {
    title = `⏰ Promemoria: Rinnovo HACCP ${staffMember.name}`
    description = `Il certificato HACCP di ${staffMember.name} scade tra ${daysUntilExpiry} giorni.`
  }

  const colors = getEventColors(status, finalPriority)

  return {
    id: `haccp-expiry-${staffMember.id}-${type}`,
    title,
    description,
    start: expiryDate,
    end: expiryDate,
    allDay: true,
    type: 'custom',
    status,
    priority: finalPriority,
    source: 'custom',
    sourceId: staffMember.id,
    assigned_to: [staffMember.id],
    recurring: false,
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    textColor: colors.textColor,
    metadata: {
      staff_id: staffMember.id,
      assigned_to_staff_id: staffMember.id,
      assigned_to_role: 'admin',
      assigned_to_category: 'Amministratore',
      notes: `Scadenza certificato HACCP - ${staffMember.name}\nLivello: ${cert.level || 'N/A'}\nNumero: ${cert.certificate_number || 'N/A'}`,
    },
    extendedProps: {
      status: status as
        | 'scheduled'
        | 'in_progress'
        | 'completed'
        | 'overdue'
        | 'cancelled',
      priority: finalPriority,
      assignedTo: [staffMember.id],
      metadata: {
        staffMember: staffMember.name,
        haccpLevel: cert.level,
        certificateNumber: cert.certificate_number,
        issuingAuthority: cert.issuing_authority,
        daysUntilExpiry,
        expiryType: type,
      },
    },
    created_at: new Date(),
    updated_at: new Date(),
    created_by: userId,
    company_id: companyId,
  }
}

function getEventColors(
  status: CalendarEvent['status'],
  priority: CalendarEvent['priority']
): { backgroundColor: string; borderColor: string; textColor: string } {
  if (status === 'overdue') {
    return {
      backgroundColor: '#7F1D1D',
      borderColor: '#991B1B',
      textColor: '#FFFFFF',
    }
  }

  if (priority === 'critical') {
    return {
      backgroundColor: '#7F1D1D',
      borderColor: '#991B1B',
      textColor: '#FFFFFF',
    }
  }

  if (priority === 'high') {
    return {
      backgroundColor: '#FEF2F2',
      borderColor: '#EF4444',
      textColor: '#991B1B',
    }
  }

  if (priority === 'medium') {
    return {
      backgroundColor: '#FFFBEB',
      borderColor: '#F59E0B',
      textColor: '#92400E',
    }
  }

  return {
    backgroundColor: '#F0FDF4',
    borderColor: '#22C55E',
    textColor: '#166534',
  }
}
