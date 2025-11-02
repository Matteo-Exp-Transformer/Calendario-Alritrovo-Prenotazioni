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
  
  // Always use UTC offset (+00:00) to avoid timezone conversion issues
  // The time stored is the actual time as entered by the user
  const tzString = '+00:00'
  
  // If this is an end time and we need to check for midnight crossover
  if (!isStart && startTime) {
    const [startHours] = startTime.split(':').map(Number)
    
    // If end time is earlier than start time, it's the next day
    if (hours < startHours || (hours === startHours && startHours >= 22)) {
      // Add 1 day
      const nextDay = new Date(year, month - 1, day)
      nextDay.setDate(nextDay.getDate() + 1)
      
      return `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00${tzString}`
    }
  }
  
  // Normal case - same day
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00${tzString}`
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

