import { useState, useRef, useEffect } from 'react'
import './MonthSelector.css'

/**
 * MonthSelector – reusable month/year navigation component.
 *
 * Props:
 *   value      – "YYYY-MM-01" string (matches the app's monthYear / DB month_year format)
 *   onChange   – callback(newValue: "YYYY-MM-01")
 *   minYear    – earliest selectable year (default 2020)
 *   maxYear    – latest selectable year (default current year + 1)
 *   className  – optional extra class on the root element
 *
 * Usage with FarmContext (forms / reports that should share global state):
 *   const { monthYear, setMonthYear } = useFarmContext()
 *   <MonthSelector value={monthYear} onChange={setMonthYear} />
 *
 * Usage with local state (e.g. a standalone selector):
 *   const [month, setMonth] = useState('2026-05-01')
 *   <MonthSelector value={month} onChange={setMonth} />
 */

const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Produce a "YYYY-MM-01" string from year + month numbers */
function makeMonthYear(year, month) {
  return `${year}-${String(month).padStart(2, '0')}-01`
}

/** Parse a "YYYY-MM-01" (or any "YYYY-MM-DD") string safely */
function parseMonthYear(value) {
  if (!value || typeof value !== 'string') {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  }
  const parts = value.split('-')
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
  }
}

export default function MonthSelector({
  value,
  onChange,
  minYear = 2020,
  maxYear,
  className = '',
}) {
  const effectiveMaxYear = maxYear ?? new Date().getFullYear() + 1
  const { year, month } = parseMonthYear(value)

  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const containerRef = useRef(null)
  const yearListRef = useRef(null)

  // Close pickers on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowMonthPicker(false)
        setShowYearPicker(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // Scroll the selected year into view when the year picker opens
  useEffect(() => {
    if (showYearPicker && yearListRef.current) {
      const selected = yearListRef.current.querySelector('.month-selector-year-option.selected')
      if (selected) {
        selected.scrollIntoView({ block: 'center' })
      }
    }
  }, [showYearPicker])

  const canGoPrev = year > minYear || (year === minYear && month > 1)
  const canGoNext = year < effectiveMaxYear || (year === effectiveMaxYear && month < 12)

  const goToPrev = () => {
    if (!canGoPrev) return
    const newMonth = month === 1 ? 12 : month - 1
    const newYear = month === 1 ? year - 1 : year
    onChange(makeMonthYear(newYear, newMonth))
  }

  const goToNext = () => {
    if (!canGoNext) return
    const newMonth = month === 12 ? 1 : month + 1
    const newYear = month === 12 ? year + 1 : year
    onChange(makeMonthYear(newYear, newMonth))
  }

  const selectMonth = (m) => {
    onChange(makeMonthYear(year, m))
    setShowMonthPicker(false)
  }

  const selectYear = (y) => {
    onChange(makeMonthYear(y, month))
    setShowYearPicker(false)
  }

  const toggleMonthPicker = () => {
    setShowMonthPicker(prev => !prev)
    setShowYearPicker(false)
  }

  const toggleYearPicker = () => {
    setShowYearPicker(prev => !prev)
    setShowMonthPicker(false)
  }

  // Years listed most-recent first for the picker
  const years = Array.from(
    { length: effectiveMaxYear - minYear + 1 },
    (_, i) => effectiveMaxYear - i,
  )

  return (
    <div className={`month-selector${className ? ` ${className}` : ''}`} ref={containerRef}>
      {/* ← Prev month */}
      <button
        type="button"
        className="month-selector-nav-btn"
        onClick={goToPrev}
        disabled={!canGoPrev}
        aria-label="Previous month"
      >
        ←
      </button>

      {/* Month + Year labels (clickable) */}
      <div className="month-selector-display">
        <button
          type="button"
          className={`month-selector-month-btn${showMonthPicker ? ' active' : ''}`}
          onClick={toggleMonthPicker}
          aria-haspopup="listbox"
          aria-expanded={showMonthPicker}
          aria-label="Select month"
        >
          {MONTHS_LONG[month - 1]}
          <span className="month-selector-caret" aria-hidden="true">▾</span>
        </button>

        <button
          type="button"
          className={`month-selector-year-btn${showYearPicker ? ' active' : ''}`}
          onClick={toggleYearPicker}
          aria-haspopup="listbox"
          aria-expanded={showYearPicker}
          aria-label="Select year"
        >
          {year}
          <span className="month-selector-caret" aria-hidden="true">▾</span>
        </button>
      </div>

      {/* → Next month */}
      <button
        type="button"
        className="month-selector-nav-btn"
        onClick={goToNext}
        disabled={!canGoNext}
        aria-label="Next month"
      >
        →
      </button>

      {/* Month picker popup – 4-column grid of short month names */}
      {showMonthPicker && (
        <div className="month-selector-popup month-selector-month-grid" role="listbox" aria-label="Month">
          {MONTHS_SHORT.map((name, i) => (
            <button
              key={i}
              type="button"
              role="option"
              aria-selected={i + 1 === month}
              className={`month-selector-month-option${i + 1 === month ? ' selected' : ''}`}
              onClick={() => selectMonth(i + 1)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Year picker popup – scrollable vertical list */}
      {showYearPicker && (
        <div
          className="month-selector-popup month-selector-year-list"
          role="listbox"
          aria-label="Year"
          ref={yearListRef}
        >
          {years.map(y => (
            <button
              key={y}
              type="button"
              role="option"
              aria-selected={y === year}
              className={`month-selector-year-option${y === year ? ' selected' : ''}`}
              onClick={() => selectYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
