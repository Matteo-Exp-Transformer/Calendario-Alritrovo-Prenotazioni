import React from 'react'

interface DateInputProps {
  value: string // Format: "YYYY-MM-DD"
  onChange: (value: string) => void
  className?: string
  required?: boolean
  id?: string
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  className = '',
  required = false,
  id,
}) => {
  // Parse current value or use defaults
  const [year, month, day] = value
    ? value.split('-').map(Number)
    : [new Date().getFullYear(), 1, 1]

  // Generate arrays for dropdowns
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 2 }, (_, i) => currentYear + i) // Current year + 1 year ahead
  const months = [
    { value: 1, label: 'Gennaio' },
    { value: 2, label: 'Febbraio' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Aprile' },
    { value: 5, label: 'Maggio' },
    { value: 6, label: 'Giugno' },
    { value: 7, label: 'Luglio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Settembre' },
    { value: 10, label: 'Ottobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Dicembre' },
  ]

  // Get days in month (accounting for leap years)
  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m, 0).getDate()
  }

  const daysInMonth = getDaysInMonth(month || 1, year || currentYear)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = parseInt(e.target.value, 10)
    const newValue = `${(year || currentYear).toString()}-${(month || 1).toString().padStart(2, '0')}-${newDay.toString().padStart(2, '0')}`
    onChange(newValue)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10)
    const newDaysInMonth = getDaysInMonth(newMonth, year || currentYear)

    // Adjust day if it exceeds days in new month
    const adjustedDay = (day || 1) > newDaysInMonth ? newDaysInMonth : (day || 1)

    const newValue = `${(year || currentYear).toString()}-${newMonth.toString().padStart(2, '0')}-${adjustedDay.toString().padStart(2, '0')}`
    onChange(newValue)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10)
    const newDaysInMonth = getDaysInMonth(month || 1, newYear)

    // Adjust day if it exceeds days in new month (Feb 29 in non-leap year)
    const adjustedDay = (day || 1) > newDaysInMonth ? newDaysInMonth : (day || 1)

    const newValue = `${newYear.toString()}-${(month || 1).toString().padStart(2, '0')}-${adjustedDay.toString().padStart(2, '0')}`
    onChange(newValue)
  }

  const containerClass = `date-input-container ${className}`

  return (
    <>
      <div className={containerClass} id={id}>
        <select
          id={id ? `${id}_day` : undefined}
          value={(day || 1).toString()}
          onChange={handleDayChange}
          required={required}
          aria-label="Giorno"
        >
          {days.map((d) => (
            <option key={d} value={d.toString()}>
              {d}
            </option>
          ))}
        </select>
        <span aria-hidden="true">/</span>
        <select
          id={id ? `${id}_month` : undefined}
          value={(month || 1).toString()}
          onChange={handleMonthChange}
          required={required}
          aria-label="Mese"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value.toString()}>
              {m.label}
            </option>
          ))}
        </select>
        <span aria-hidden="true">/</span>
        <select
          id={id ? `${id}_year` : undefined}
          value={(year || currentYear).toString()}
          onChange={handleYearChange}
          required={required}
          aria-label="Anno"
        >
          {years.map((y) => (
            <option key={y} value={y.toString()}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <style>{`
        .date-input-container {
          display: flex;
          gap: 8px;
          align-items: center;
          border-radius: 9999px;
          border: 1px solid rgba(0,0,0,0.2);
          max-width: 600px;
          width: 100%;
          height: 56px;
          padding: 0 16px;
          font-size: 16px;
          font-weight: 500;
          background-color: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(6px);
          color: black;
          transition: border-color 0.2s;
        }
        .date-input-container:focus-within {
          border-color: #8B6914;
        }
        .date-input-container select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          flex: 1;
          border: none;
          outline: none;
          background-color: transparent;
          color: black;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          min-width: 50px;
        }
        .date-input-container select::-ms-expand {
          display: none;
        }
        .date-input-container span {
          color: #6b7280;
          font-weight: 600;
          font-size: 16px;
          pointer-events: none;
        }
        /* Mobile-specific improvements */
        @media (max-width: 640px) {
          .date-input-container {
            font-size: 18px; /* Larger touch target */
          }
          .date-input-container select {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  )
}
