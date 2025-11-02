import React from 'react'

interface TimeInputProps {
  value: string // Format: "HH:mm"
  onChange: (value: string) => void
  className?: string
  required?: boolean
  id?: string
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  className = '',
  required = false,
  id,
}) => {
  // Parse current value
  const [hours, minutes] = value ? value.split(':').map(Number) : [0, 0]

  // Normalize minutes to 00 or 30
  const normalizedMinutes = minutes === 0 || minutes === 30 ? minutes : 0

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHours = parseInt(e.target.value, 10)
    const currentMinutes = normalizedMinutes
    const newValue = `${newHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`
    onChange(newValue)
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinutes = parseInt(e.target.value, 10)
    const newValue = `${hours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
    onChange(newValue)
  }

  const containerClass = `time-input-container ${className}`
  
  return (
    <>
      <div className={containerClass} id={id}>
        <select
          id={id ? `${id}_hour` : undefined}
          value={hours.toString().padStart(2, '0')}
          onChange={handleHourChange}
          required={required}
          aria-label="Ora"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i.toString().padStart(2, '0')}>
              {i.toString().padStart(2, '0')}
            </option>
          ))}
        </select>
        <span aria-hidden="true">:</span>
        <select
          id={id ? `${id}_minute` : undefined}
          value={normalizedMinutes.toString().padStart(2, '0')}
          onChange={handleMinuteChange}
          required={required}
          aria-label="Minuti"
        >
          <option value="00">00</option>
          <option value="30">30</option>
        </select>
      </div>
      <style>{`
        .time-input-container {
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
        .time-input-container:focus-within {
          border-color: #8B6914;
        }
        .time-input-container select {
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
        .time-input-container select::-ms-expand {
          display: none;
        }
        .time-input-container span {
          color: #6b7280;
          font-weight: 600;
          font-size: 16px;
          pointer-events: none;
        }
        /* Mobile-specific improvements */
        @media (max-width: 640px) {
          .time-input-container {
            font-size: 18px; /* Larger touch target */
          }
          .time-input-container select {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  )
}


