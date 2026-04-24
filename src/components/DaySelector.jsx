/**
 * DaySelector – horizontal scrollable 1‑to‑N day picker.
 *
 * Props:
 *   daysInMonth  – number of days to show (28‑31)
 *   selectedDay  – currently highlighted day (1‑based)
 *   lockedDays   – { [day]: true } when a day has saved data
 *   onSelect     – callback(day: number)
 *   loading      – show a "loading…" label while fetching day data
 */
export default function DaySelector({ daysInMonth, selectedDay, lockedDays = {}, onSelect, loading = false }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', margin: '0 0 8px 0' }}>
        Select Day
      </p>

      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '8px',
        scrollbarWidth: 'thin',
      }}>
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const isSelected = selectedDay === d
          const isSaved = lockedDays[d] === true
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              title={isSaved ? `Day ${d} – already recorded` : `Day ${d}`}
              style={{
                minWidth: '36px',
                height: '36px',
                borderRadius: '50%',
                border: isSelected
                  ? '2px solid #0066cc'
                  : isSaved
                    ? '2px solid #28a745'
                    : '1px solid #ccc',
                backgroundColor: isSelected ? '#0066cc' : isSaved ? '#f0fff4' : 'white',
                color: isSelected ? 'white' : '#333',
                fontWeight: '600',
                fontSize: '13px',
                cursor: loading ? 'wait' : 'pointer',
                flexShrink: 0,
                padding: 0,
                lineHeight: '34px',
                textAlign: 'center',
              }}
            >
              {d}
            </button>
          )
        })}
      </div>

      {loading && (
        <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0 0' }}>Loading day data…</p>
      )}
    </div>
  )
}
