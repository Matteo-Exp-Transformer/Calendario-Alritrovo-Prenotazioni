import type { BookingRequest } from '@/types/booking'

/**
 * Utility functions for handling booking dates, especially when crossing midnight
 */

/**
 * Creates a proper date string handling midnight crossover
 * If endTime is before startTime (e.g., 22:00 to 02:00), the end date is the next day
 * 
 * @param date - The date string (YYYY-MM-DD)
 * @param time - The time string (HH:mm)
 * @param isStart - Whether this is the start time (true) or end time (false)
 * @param startTime - The start time for comparison (only needed for end time)
 * @returns ISO string with timezone offset
 */
export function createBookingDateTime(
  date: string,
  time: string,
  isStart: boolean = true,
  startTime?: string
): string {
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  
  // ✅ FIX: L'utente inserisce un orario (es. "20:00") e deve rimanere ESATTAMENTE quello
  // La soluzione: salviamo l'orario inserito direttamente come UTC (senza conversioni)
  // In questo modo, quando PostgreSQL lo salva e lo ritorna, la stringa ISO contiene ancora "20:00"
  // e extractTimeFromISO estrae correttamente "20:00"
  
  let finalYear = year
  let finalMonth = month
  let finalDay = day
  let finalHours = hours
  let finalMinutes = minutes
  
  // Gestione attraversamento mezzanotte: se l'orario di fine è prima dell'orario di inizio,
  // significa che la prenotazione attraversa la mezzanotte (es. 22:00-02:00)
  if (!isStart && startTime) {
    const [startHours] = startTime.split(':').map(Number)
    
    // Se l'orario di fine è prima dell'orario di inizio, è il giorno successivo
    if (hours < startHours || (hours === startHours && startHours >= 22)) {
      // Aggiungi 1 giorno preservando anno, mese, ore e minuti esattamente come inseriti
      // Usiamo Date per gestire automaticamente fine mese, fine anno, anni bisestili, ecc.
      const currentDate = new Date(year, month - 1, day)
      currentDate.setDate(currentDate.getDate() + 1)
      
      finalYear = currentDate.getFullYear()
      finalMonth = currentDate.getMonth() + 1
      finalDay = currentDate.getDate()
      // finalHours e finalMinutes rimangono invariati (già impostati sopra)
    }
  }
  
  // ✅ SALVIAMO L'ORARIO ESATTO COME UTC (+00:00)
  // Questo fa sì che PostgreSQL non faccia conversioni e la stringa ISO rimanga identica
  // Quando rileggiamo, extractTimeFromISO estrae l'ora dalla stringa e ottiene esattamente l'orario inserito
  return `${String(finalYear).padStart(4, '0')}-${String(finalMonth).padStart(2, '0')}-${String(finalDay).padStart(2, '0')}T${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}:00+00:00`
}

/**
 * Checks if an end time crosses midnight (end before start)
 */
export function crossesMidnight(startTime: string, endTime: string): boolean {
  const [startHours] = startTime.split(':').map(Number)
  const [endHours] = endTime.split(':').map(Number)
  
  // If end hour is significantly earlier than start hour (crossing midnight)
  // OR if start is late (22+) and end is early (0-6)
  const isCrossMidnight = (endHours < startHours) || (startHours >= 22 && endHours <= 6)
  
  return isCrossMidnight
}

/**
 * Estrae la data (YYYY-MM-DD) da una stringa ISO timestamp senza conversioni timezone
 * Questa funzione estrae direttamente dalla stringa per evitare problemi di conversione timezone
 * quando si usa new Date() che interpreta il timestamp nel timezone locale del browser.
 * 
 * @param isoString - Stringa ISO timestamp (es: "2025-01-15T20:00:00+00:00" o "2025-01-15T20:00:00Z")
 * @returns Data in formato YYYY-MM-DD o stringa vuota se isoString è null/undefined/invalido
 * 
 * @example
 * extractDateFromISO("2025-01-15T20:00:00+00:00") // "2025-01-15"
 * extractDateFromISO("2025-01-15T20:00:00Z") // "2025-01-15"
 */
export function extractDateFromISO(isoString: string | null | undefined): string {
  if (!isoString) return ''
  const match = isoString.match(/(\d{4})-(\d{2})-(\d{2})/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : ''
}

/**
 * Estrae l'orario (HH:MM) da una stringa ISO timestamp senza conversioni timezone
 * Questa funzione estrae direttamente dalla stringa per evitare problemi di conversione timezone
 * quando si usa new Date() che interpreta il timestamp nel timezone locale del browser.
 * 
 * @param isoString - Stringa ISO timestamp (es: "2025-01-15T20:00:00+00:00" o "2025-01-15T20:00:00Z")
 * @returns Orario in formato HH:MM o stringa vuota se isoString è null/undefined/invalido
 * 
 * @example
 * extractTimeFromISO("2025-01-15T20:00:00+00:00") // "20:00"
 * extractTimeFromISO("2025-01-15T20:00:00Z") // "20:00"
 */
export function extractTimeFromISO(isoString: string | null | undefined): string {
  if (!isoString) return ''
  const match = isoString.match(/T(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : ''
}

/**
 * Calculates the end time string starting from startTime adding a number of hours.
 * Keeps the result within the same 24h window (wraps if it crosses midnight).
 */
export function calculateEndTimeFromStart(startTime: string, hoursToAdd: number = 3): string {
  if (!startTime) return ''

  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + hoursToAdd * 60
  const wrappedMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60)
  const endHours = Math.floor(wrappedMinutes / 60)
  const endMinutes = wrappedMinutes % 60

  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
}

/**
 * Returns the most accurate start time for a booking, preferring desired_time (TIME)
 * to avoid timezone conversions. Falls back to confirmed_start if needed.
 */
export function getAccurateStartTime(booking: BookingRequest): string {
  if (booking.desired_time) {
    return booking.desired_time.split(':').slice(0, 2).join(':')
  }
  if (booking.confirmed_start) {
    return extractTimeFromISO(booking.confirmed_start)
  }
  return ''
}

/**
 * Returns the most accurate end time for a booking.
 * Prefers confirmed_end (since it's the authoritative value),
 * otherwise derives it from the accurate start time adding 3 hours.
 */
export function getAccurateEndTime(booking: BookingRequest): string {
  if (booking.confirmed_end) {
    return extractTimeFromISO(booking.confirmed_end)
  }

  const startTime = getAccurateStartTime(booking)
  if (startTime) {
    return calculateEndTimeFromStart(startTime)
  }

  return ''
}

