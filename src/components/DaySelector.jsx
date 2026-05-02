import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './DaySelector.css'

/**
 * DaySelector – iOS-style monthly calendar day picker.
 *
 * Props:
 *   monthYear   – "YYYY-MM-DD" (first of the month, from FarmContext)
 *   selectedDay – currently highlighted day (1-based integer)
 *   lockedDays  – { [day]: true } when a day has saved data
 *   onSelect    – callback(day: number)
 *   loading     – show a "loading…" label while fetching day data
 *   daysInMonth – (unused, kept for backward compat)
 */
export default function DaySelector({ monthYear, selectedDay, lockedDays = {}, onSelect, loading = false }) {
  const [year, month] = monthYear.split('-').map(Number)
  const activeStartDate = new Date(year, month - 1, 1)
  const minDate = new Date(year, month - 1, 1)
  const maxDate = new Date(year, month, 0) // last day of month
  const value = new Date(year, month - 1, selectedDay)

  const handleChange = (date) => {
    onSelect(date.getDate())
  }

  const tileContent = ({ date, view }) => {
    if (view === 'month' && lockedDays[date.getDate()] === true) {
      return <div className="day-selector-saved-dot" />
    }
    return null
  }

  const tileClassName = ({ date, view }) => {
    if (view === 'month' && lockedDays[date.getDate()] === true) {
      return 'day-selector-locked'
    }
    return null
  }

  return (
    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Calendar
        onChange={handleChange}
        value={value}
        activeStartDate={activeStartDate}
        minDate={minDate}
        maxDate={maxDate}
        view="month"
        minDetail="month"
        showNavigation={false}
        showNeighboringMonth={false}
        calendarType="gregory"
        tileContent={tileContent}
        tileClassName={tileClassName}
        locale="en-US"
        className="day-selector-calendar"
      />
      {loading && (
        <p style={{ fontSize: '13px', color: '#888', margin: '8px 0 0 0' }}>Loading day data…</p>
      )}
    </div>
  )
}
