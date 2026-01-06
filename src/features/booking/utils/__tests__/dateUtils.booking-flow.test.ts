/**
 * Test TDD per verificare il flusso completo di trascrizione dei dati di prenotazione
 * 
 * FLUSSO COMPLETO:
 * 1. Utente inserisce: data="2025-01-15", startTime="20:00", endTime="23:00"
 * 2. AcceptBookingModal → createBookingDateTime → salva in DB
 * 3. Pending requests → mostra pending (non usa confirmed_start)
 * 4. Calendario → transformBookingToCalendarEvent → mostra evento
 * 5. Collapse card fascia oraria → extractTimeFromISO → mostra orario
 * 6. Pannello laterale (click calendario) → BookingDetailsModal → extractDateFromISO/extractTimeFromISO
 * 7. Archivio → mostra confirmed_start o desired_date
 * 
 * REQUISITO: I dati inseriti dall'utente devono rimanere IDENTICI in tutte le fasi
 */

import { describe, test, expect } from 'vitest'
import {
  createBookingDateTime,
  extractDateFromISO,
  extractTimeFromISO,
  getAccurateStartTime,
  getAccurateEndTime,
  calculateEndTimeFromStart,
} from '../dateUtils'
import { transformBookingToCalendarEvent } from '../bookingEventTransform'
import type { BookingRequest } from '@/types/booking'

describe('Booking Flow: Data Transcription Verification', () => {
  // Dati di test: quello che l'utente inserisce
  const USER_INPUT = {
    date: '2025-01-15',
    startTime: '20:00',
    endTime: '23:00',
  }

  test('RED: createBookingDateTime preserves exact user input (no timezone shift)', () => {
    // Utente inserisce 20:00 e 23:00
    const confirmedStart = createBookingDateTime(USER_INPUT.date, USER_INPUT.startTime, true)
    const confirmedEnd = createBookingDateTime(USER_INPUT.date, USER_INPUT.endTime, false, USER_INPUT.startTime)

    // Verifica formato ISO corretto
    expect(confirmedStart).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}$/)

    // Estrai data e ora dalla stringa ISO salvata
    const startDate = extractDateFromISO(confirmedStart)
    const startTime = extractTimeFromISO(confirmedStart)
    const endDate = extractDateFromISO(confirmedEnd)
    const endTime = extractTimeFromISO(confirmedEnd)

    // Deve essere ESATTAMENTE quello che l'utente ha inserito
    expect(startDate).toBe(USER_INPUT.date)
    expect(startTime).toBe(USER_INPUT.startTime)
    expect(endDate).toBe(USER_INPUT.date)
    expect(endTime).toBe(USER_INPUT.endTime)
  })

  test('RED: extractDateFromISO extracts exact date without timezone conversion', () => {
    const isoString = '2025-01-15T20:00:00+00:00'
    const extractedDate = extractDateFromISO(isoString)

    expect(extractedDate).toBe('2025-01-15')
  })

  test('RED: extractTimeFromISO extracts exact time without timezone conversion', () => {
    const isoString = '2025-01-15T20:00:00+00:00'
    const extractedTime = extractTimeFromISO(isoString)

    expect(extractedTime).toBe('20:00')
  })

  test('RED: Full flow: user input → DB storage → extraction → same values', () => {
    // 1. Utente inserisce dati
    const userDate = '2025-01-15'
    const userStartTime = '20:00'
    const userEndTime = '23:00'

    // 2. Crea ISO strings per salvare in DB
    const confirmedStart = createBookingDateTime(userDate, userStartTime, true)
    const confirmedEnd = createBookingDateTime(userDate, userEndTime, false, userStartTime)

    // 3. Simula quello che fa BookingDetailsModal quando rilegge dal DB
    const extractedDate = extractDateFromISO(confirmedStart)
    const extractedStartTime = extractTimeFromISO(confirmedStart)
    const extractedEndTime = extractTimeFromISO(confirmedEnd)

    // 4. Verifica che i valori siano identici
    expect(extractedDate).toBe(userDate)
    expect(extractedStartTime).toBe(userStartTime)
    expect(extractedEndTime).toBe(userEndTime)
  })

  test('RED: transformBookingToCalendarEvent preserves time from confirmed_start', () => {
    // Crea booking con confirmed_start e confirmed_end
    const booking: BookingRequest = {
      id: 'test-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client_name: 'Test User',
      client_email: 'test@example.com',
      client_phone: '123456789',
      event_type: 'cena',
      desired_date: '2025-01-15',
      desired_time: '20:00',
      num_guests: 4,
      special_requests: null,
      menu: null,
      status: 'accepted',
      confirmed_start: '2025-01-15T20:00:00+00:00',
      confirmed_end: '2025-01-15T23:00:00+00:00',
      rejection_reason: null,
      cancellation_reason: null,
      cancelled_at: null,
      cancelled_by: null,
    }

    // Trasforma per calendario
    const calendarEvent = transformBookingToCalendarEvent(booking)

    // Estrai ora dall'evento del calendario
    // L'evento usa Date objects, ma estraiamo l'ora per verificare
    const startDate = new Date(calendarEvent.start)
    const endDate = new Date(calendarEvent.end)

    // Verifica che l'ora sia corretta (20:00 e 23:00)
    expect(startDate.getHours()).toBe(20)
    expect(startDate.getMinutes()).toBe(0)
    expect(endDate.getHours()).toBe(23)
    expect(endDate.getMinutes()).toBe(0)
  })

  test('Midnight crossover: calendar display is clamped to start day (no next-day rendering)', () => {
    // Prenotazione che finisce dopo mezzanotte (es. 21:00 → 00:30)
    const booking: BookingRequest = {
      id: 'test-midnight',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client_name: 'Test User',
      client_email: 'test@example.com',
      client_phone: '123456789',
      event_type: 'cena',
      desired_date: '2025-01-15',
      desired_time: '21:00',
      num_guests: 4,
      special_requests: null,
      menu: null,
      status: 'accepted',
      confirmed_start: '2025-01-15T21:00:00+00:00',
      confirmed_end: '2025-01-16T00:30:00+00:00',
      rejection_reason: null,
      cancellation_reason: null,
      cancelled_at: null,
      cancelled_by: null,
    }

    const calendarEvent = transformBookingToCalendarEvent(booking)

    const start = new Date(calendarEvent.start)
    const end = new Date(calendarEvent.end)

    // Deve terminare entro il giorno di inizio (clamp a fine giornata)
    expect(end.getFullYear()).toBe(start.getFullYear())
    expect(end.getMonth()).toBe(start.getMonth())
    expect(end.getDate()).toBe(start.getDate())
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getSeconds()).toBe(59)
    expect(end.getMilliseconds()).toBe(999)

    // FullCalendar safety: non è un allDay/multi-day event
    expect(calendarEvent.allDay).toBe(false)
  })

  test('RED: Midnight crossover: end time moves to next day correctly', () => {
    // Utente inserisce prenotazione che attraversa mezzanotte
    const date = '2025-01-15'
    const startTime = '22:00'
    const endTime = '02:00'

    // Fine deve essere il giorno successivo
    const confirmedStart = createBookingDateTime(date, startTime, true)
    const confirmedEnd = createBookingDateTime(date, endTime, false, startTime)

    // Estrai date
    const startDate = extractDateFromISO(confirmedStart)
    const endDate = extractDateFromISO(confirmedEnd)

    // Verifica: inizio = 15, fine = 16
    expect(startDate).toBe('2025-01-15')
    expect(endDate).toBe('2025-01-16')

    // Verifica orari
    const extractedStartTime = extractTimeFromISO(confirmedStart)
    const extractedEndTime = extractTimeFromISO(confirmedEnd)

    expect(extractedStartTime).toBe('22:00')
    expect(extractedEndTime).toBe('02:00')
  })

  test('RED: ArchiveTab displays correct date and time from confirmed_start', () => {
    const confirmedStart = '2025-01-15T20:00:00+00:00'
    
    // ArchiveTab usa confirmed_start se presente
    const displayDate = extractDateFromISO(confirmedStart)
    const displayTime = extractTimeFromISO(confirmedStart)

    expect(displayDate).toBe('2025-01-15')
    expect(displayTime).toBe('20:00')
  })

  test('RED: BookingCalendar collapse cards show correct time', () => {
    const booking: BookingRequest = {
      id: 'test-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client_name: 'Test User',
      client_email: 'test@example.com',
      client_phone: null,
      event_type: 'cena',
      desired_date: '2025-01-15',
      desired_time: '20:00',
      num_guests: 4,
      special_requests: null,
      menu: null,
      status: 'accepted',
      confirmed_start: '2025-01-15T20:00:00+00:00',
      confirmed_end: '2025-01-15T23:00:00+00:00',
      rejection_reason: null,
      cancellation_reason: null,
      cancelled_at: null,
      cancelled_by: null,
    }

    // BookingCalendar usa helper centralizzati per mostrare l'orario
    const displayedStartTime = getAccurateStartTime(booking)
    const displayedEndTime = getAccurateEndTime(booking)

    expect(displayedStartTime).toBe('20:00')
    expect(displayedEndTime).toBe('23:00')
  })

  test('RED: BookingDetailsModal shows correct values when opened from calendar', () => {
    const booking: BookingRequest = {
      id: 'test-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client_name: 'Test User',
      client_email: 'test@example.com',
      client_phone: null,
      event_type: 'cena',
      desired_date: '2025-01-15',
      desired_time: '20:00',
      num_guests: 4,
      special_requests: null,
      menu: null,
      status: 'accepted',
      confirmed_start: '2025-01-15T20:00:00+00:00',
      confirmed_end: '2025-01-15T23:00:00+00:00',
      rejection_reason: null,
      cancellation_reason: null,
      cancelled_at: null,
      cancelled_by: null,
    }

    // BookingDetailsModal usa helper centralizzati per popolare i campi
    const formDataDate = extractDateFromISO(booking.confirmed_start)
    const formDataStartTime = getAccurateStartTime(booking)
    const formDataEndTime = getAccurateEndTime(booking)

    // Deve essere identico a quello inserito
    expect(formDataDate).toBe('2025-01-15')
    expect(formDataStartTime).toBe('20:00')
    expect(formDataEndTime).toBe('23:00')
  })
})

describe('Centralized time helpers', () => {
  test('calculateEndTimeFromStart adds 3 hours and wraps after midnight', () => {
    expect(calculateEndTimeFromStart('20:00')).toBe('23:00')
    expect(calculateEndTimeFromStart('22:30')).toBe('01:30')
  })

  test('getAccurateStartTime prefers desired_time over confirmed_start', () => {
    const booking: BookingRequest = {
      id: '1',
      created_at: '',
      updated_at: '',
      client_name: '',
      client_email: null,
      client_phone: null,
      event_type: 'cena',
      desired_date: '2025-01-15',
      desired_time: '19:45',
      num_guests: 0,
      special_requests: null,
      menu: null,
      status: 'accepted',
      confirmed_start: '2025-01-15T18:45:00+00:00',
      confirmed_end: null,
      rejection_reason: null,
      cancellation_reason: null,
      cancelled_at: null,
      cancelled_by: null,
    }

    expect(getAccurateStartTime(booking)).toBe('19:45')
  })

  test('getAccurateEndTime falls back to startTime + 3h when confirmed_end missing', () => {
    const booking: BookingRequest = {
      id: '1',
      created_at: '',
      updated_at: '',
      client_name: '',
      client_email: null,
      client_phone: null,
      event_type: 'cena',
      desired_date: '2025-01-15',
      desired_time: '18:00',
      num_guests: 0,
      special_requests: null,
      menu: null,
      status: 'accepted',
      confirmed_start: null,
      confirmed_end: null,
      rejection_reason: null,
      cancellation_reason: null,
      cancelled_at: null,
      cancelled_by: null,
    }

    expect(getAccurateEndTime(booking)).toBe('21:00')
  })
})

